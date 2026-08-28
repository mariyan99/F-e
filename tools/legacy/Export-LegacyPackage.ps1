<#
.SYNOPSIS
    Builds a safe /legacy analysis package from the old Fabrizia PHP site.

.DESCRIPTION
    Reads the old site locally and writes ONLY derived, safe artefacts:
    schema without data, row counts, catalogue extract, URL sources, brand
    colours and fonts, an image inventory and a few sample images.

    Personal data and secrets never reach the output. The rules are enforced
    three times over: a deny list decides which tables may emit rows at all, a
    PII scan re-checks every row that survives, and a final sweep over the whole
    output folder fails the run if anything slipped through.

    Nothing is uploaded. The script writes to a folder you choose and stops.

.PARAMETER SourcePath
    The old site's folder, e.g. C:\Users\mariyan\OneDrive\Desktop\fabrizia\fabriziafashion-main

.PARAMETER OutPath
    Where to write the package. Created if missing. Must be empty or new.

.PARAMETER SqlDump
    Optional explicit path to the .sql dump. Found automatically if omitted.

.PARAMETER SampleImageCount
    How many real product images to copy for the visual assessment. Default 12.

.EXAMPLE
    .\Export-LegacyPackage.ps1 `
        -SourcePath "C:\Users\mariyan\OneDrive\Desktop\fabrizia\fabriziafashion-main" `
        -OutPath    "$HOME\Desktop\legacy-package"

.NOTES
    Windows PowerShell 5.1 or PowerShell 7. Read-only on the source: the script
    never writes to, moves or deletes anything under -SourcePath.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string] $SourcePath,
    [Parameter(Mandatory = $true)][string] $OutPath,
    [string] $SqlDump,
    [int]    $SampleImageCount = 12
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# ---------------------------------------------------------------- presentation
function Step($m) { Write-Host "`n> $m" -ForegroundColor Magenta }
function Ok($m)   { Write-Host "  [ok] $m"   -ForegroundColor Green }
function Warn($m) { Write-Host "  [!]  $m"   -ForegroundColor Yellow }
function Bad($m)  { Write-Host "  [x]  $m"   -ForegroundColor Red }

$script:Report = New-Object System.Collections.ArrayList
function Note($m) { [void]$script:Report.Add($m) }

# ------------------------------------------------------------------- safety
# Deny wins over allow, always. A table called product_customer_reviews is
# personal data first and catalogue second.
$DenyTable = @(
    'user','usr','customer','client','klient','address','adres','contact',
    'session','token','oauth','password','passwd','remember','reset',
    'admin','staff','employee','log','audit','newsletter','subscriber',
    'order','poruchk','cart','checkout','payment','transaction','invoice',
    'fakt','comment','review','rating','message','mail','email','phone',
    'visitor','tracking','analytics','ip_'
)

# Only these may emit rows, and only after passing the PII scan.
$AllowTable = @(
    'product','produkt','categor','kategor','attribut','atribut','brand',
    'collection','kolekc','size','razmer','color','cvyat','tag','image',
    'snimk','gallery','galer','variant','stock','price','cena','currency',
    'menu','page','stranic','banner','slider','seo','redirect','translation'
)

# Patterns that mean personal data is present, whatever the table is called.
$PiiPattern = @(
    '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',   # email
    '(\+359|00359|\b0)8[789][0-9]{7}\b',                  # BG mobile
    '\bBG[0-9]{2}[A-Z]{4}[0-9A-Z]{14}\b'                  # IBAN
)

# Patterns that mean a credential is present.
$SecretPattern = @(
    'sk_live_[0-9a-zA-Z]{10,}', 'pk_live_[0-9a-zA-Z]{10,}',
    'AKIA[0-9A-Z]{16}', '-----BEGIN [A-Z ]*PRIVATE KEY-----',
    'ghp_[0-9A-Za-z]{30,}', 'xox[baprs]-[0-9A-Za-z-]{10,}',
    'AIza[0-9A-Za-z_\-]{35}'
)

function Test-Deny([string]$name) {
    $n = $name.ToLowerInvariant()
    foreach ($d in $DenyTable) { if ($n -like "*$d*") { return $true } }
    return $false
}
function Test-Allow([string]$name) {
    $n = $name.ToLowerInvariant()
    foreach ($a in $AllowTable) { if ($n -like "*$a*") { return $true } }
    return $false
}
function Test-Pii([string]$text) {
    foreach ($p in $PiiPattern) { if ($text -match $p) { return $true } }
    return $false
}

# ------------------------------------------------------------------ preflight
Step "Preflight"

if (-not (Test-Path -LiteralPath $SourcePath)) { throw "SourcePath not found: $SourcePath" }
$SourcePath = (Resolve-Path -LiteralPath $SourcePath).Path
Ok "source: $SourcePath"

if (Test-Path -LiteralPath $OutPath) {
    $existing = @(Get-ChildItem -LiteralPath $OutPath -Force -ErrorAction SilentlyContinue)
    if ($existing.Count -gt 0) {
        throw "OutPath is not empty: $OutPath. Choose a new folder so nothing is mixed in."
    }
} else {
    New-Item -ItemType Directory -Path $OutPath -Force | Out-Null
}
$OutPath = (Resolve-Path -LiteralPath $OutPath).Path
Ok "output: $OutPath"

foreach ($d in 'code','db','urls','branding','images','images\samples','screenshots') {
    New-Item -ItemType Directory -Path (Join-Path $OutPath $d) -Force | Out-Null
}

# ------------------------------------------------------------------- the dump
Step "Locating the SQL dump"

if (-not $SqlDump) {
    $cand = Get-ChildItem -LiteralPath $SourcePath -Recurse -File -Filter *.sql -ErrorAction SilentlyContinue |
            Sort-Object Length -Descending | Select-Object -First 1
    if ($cand) { $SqlDump = $cand.FullName }
}

if (-not $SqlDump -or -not (Test-Path -LiteralPath $SqlDump)) {
    $rar = Get-ChildItem -LiteralPath $SourcePath -Recurse -File -Include *.rar,*.zip,*.7z -ErrorAction SilentlyContinue |
           Select-Object -First 1
    if ($rar) {
        Warn "No .sql found, but an archive exists: $($rar.Name)"
        Warn "Extract it first, then re-run. This script does not unpack archives on purpose —"
        Warn "unpacking a dump of unknown contents is exactly where personal data leaks in."
    } else {
        Warn "No .sql dump found. Everything except the database steps will still run."
    }
    Note "SQL dump: NOT FOUND — schema.sql, table_counts.txt and the catalogue extract were skipped."
} else {
    $dumpInfo = Get-Item -LiteralPath $SqlDump
    Ok "dump: $($dumpInfo.Name) ($([math]::Round($dumpInfo.Length / 1MB, 1)) MB)"

    Step "Reading the dump (streamed — the file is never loaded whole)"

    $schemaPath  = Join-Path $OutPath 'db\schema.sql'
    $catalogPath = Join-Path $OutPath 'db\catalog_data.sql'

    $schemaOut  = [System.IO.StreamWriter]::new($schemaPath,  $false, [System.Text.UTF8Encoding]::new($false))
    $catalogOut = [System.IO.StreamWriter]::new($catalogPath, $false, [System.Text.UTF8Encoding]::new($false))
    $reader     = [System.IO.StreamReader]::new($SqlDump, [System.Text.Encoding]::UTF8, $true)

    $rowCount    = @{}     # table -> approximate row count
    $deniedSeen  = @{}     # table -> $true, for the report
    $piiBlocked  = @{}     # table -> $true, dropped by the PII scan
    $catalogSeen = @{}
    $inCreate    = $false
    $lineNo      = 0

    try {
        $schemaOut.WriteLine("-- Structure only. Generated by tools/legacy/Export-LegacyPackage.ps1")
        $schemaOut.WriteLine("-- No INSERT statements are present in this file by construction.")
        $schemaOut.WriteLine("")

        while ($null -ne ($line = $reader.ReadLine())) {
            $lineNo++

            if ($line -match '^\s*CREATE\s+TABLE') { $inCreate = $true }

            if ($inCreate) {
                $schemaOut.WriteLine($line)
                if ($line -match ';\s*$') { $inCreate = $false; $schemaOut.WriteLine("") }
                continue
            }

            # Structural statements worth keeping, none of which carry data.
            if ($line -match '^\s*(DROP TABLE|ALTER TABLE|CREATE (UNIQUE )?INDEX|CREATE VIEW|SET |/\*!|--|#)') {
                $schemaOut.WriteLine($line); continue
            }

            if ($line -match '^\s*INSERT\s+INTO\s+[`"\[]?([A-Za-z0-9_$]+)') {
                $table = $Matches[1]

                # Approximate the row count without keeping the payload.
                $tuples = ([regex]::Matches($line, '\),\s*\(')).Count + 1
                if ($rowCount.ContainsKey($table)) { $rowCount[$table] += $tuples }
                else { $rowCount[$table] = $tuples }

                if (Test-Deny $table) { $deniedSeen[$table] = $true; continue }
                if (-not (Test-Allow $table)) { continue }
                if ($piiBlocked.ContainsKey($table)) { continue }

                if (Test-Pii $line) {
                    $piiBlocked[$table] = $true
                    continue
                }

                $catalogOut.WriteLine($line)
                $catalogSeen[$table] = $true
                continue
            }
        }
    } finally {
        $reader.Dispose(); $schemaOut.Dispose(); $catalogOut.Dispose()
    }

    Ok "schema.sql written — $lineNo lines scanned, zero INSERTs emitted into it"

    # Row counts: safe, numbers only.
    $countLines = @("table_name`trow_count_approx")
    foreach ($t in ($rowCount.Keys | Sort-Object)) { $countLines += "$t`t$($rowCount[$t])" }
    Set-Content -LiteralPath (Join-Path $OutPath 'db\table_counts.txt') -Value $countLines -Encoding UTF8
    Ok "table_counts.txt — $($rowCount.Count) tables"

    if ($deniedSeen.Count -gt 0) {
        Ok "$($deniedSeen.Count) tables held back by the deny list (structure kept, rows dropped)"
        Note "Tables whose rows were deliberately never emitted: $(($deniedSeen.Keys | Sort-Object) -join ', ')"
    }
    if ($piiBlocked.Count -gt 0) {
        Warn "$($piiBlocked.Count) catalogue tables dropped because a PII pattern matched"
        Note "Catalogue tables dropped by the PII scan: $(($piiBlocked.Keys | Sort-Object) -join ', ')"
    }
    if ($catalogSeen.Count -gt 0) {
        Ok "catalog_data.sql — $($catalogSeen.Count) tables"
        Note "Catalogue tables exported: $(($catalogSeen.Keys | Sort-Object) -join ', ')"
    } else {
        Remove-Item -LiteralPath $catalogPath -ErrorAction SilentlyContinue
        Warn "no catalogue table passed both checks — catalog_data.sql not written"
    }
}

# --------------------------------------------------------------------- code
Step "Copying application code (without vendor, media or archives)"

$skipDir  = @('vendor','node_modules','.git','cache','tmp','temp','logs','log',
              'uploads','upload','images','image','media','img','files','backup','backups')
$skipExt  = @('.log','.sql','.rar','.zip','.7z','.gz','.tar','.jpg','.jpeg','.png','.gif',
              '.webp','.svg','.ico','.mp4','.mov','.pdf','.psd','.ai','.woff','.woff2','.ttf','.eot')
$skipName = @('.env','.htpasswd','id_rsa','id_dsa','.npmrc','.netrc')

$copied = 0; $scrubbed = 0
Get-ChildItem -LiteralPath $SourcePath -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $rel = $_.FullName.Substring($SourcePath.Length).TrimStart('\','/')
    $parts = $rel -split '[\\/]'
    foreach ($p in $parts) { if ($skipDir -contains $p.ToLowerInvariant()) { return } }
    if ($skipExt  -contains $_.Extension.ToLowerInvariant()) { return }
    if ($skipName -contains $_.Name.ToLowerInvariant())      { return }
    if ($_.Length -gt 2MB) { return }

    $dest = Join-Path (Join-Path $OutPath 'code') $rel
    New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null

    $text = $null
    try { $text = Get-Content -LiteralPath $_.FullName -Raw -ErrorAction Stop } catch { return }
    if ($null -eq $text) { $text = '' }

    # Replace credential VALUES, keep the variable NAMES: the names tell me which
    # integrations existed, the values are none of my business.
    $before = $text
    $text = [regex]::Replace($text,
        "(?i)((?:password|passwd|pwd|secret|api[_-]?key|apikey|token|private[_-]?key|smtp[_-]?pass|db[_-]?pass)\s*(?:=|=>|:)\s*)(['""])(?:(?!\2).){3,}(\2)",
        '$1$2***REMOVED***$3')
    $text = [regex]::Replace($text,
        "(?i)(define\s*\(\s*['""][A-Z_]*(?:PASS|SECRET|KEY|TOKEN)[A-Z_]*['""]\s*,\s*)(['""])(?:(?!\2).){3,}(\2)",
        '$1$2***REMOVED***$3')
    foreach ($sp in $SecretPattern) { $text = [regex]::Replace($text, $sp, '***REMOVED***') }
    if ($text -ne $before) { $scrubbed++ }

    Set-Content -LiteralPath $dest -Value $text -Encoding UTF8 -NoNewline
    $copied++
}
Ok "$copied files copied, credentials blanked in $scrubbed of them"
Note "Code files copied: $copied (credential values replaced in $scrubbed)"

# ------------------------------------------------------------------ branding
Step "Brand colours and fonts"

$cssFiles = Get-ChildItem -LiteralPath (Join-Path $OutPath 'code') -Recurse -File `
            -Include *.css,*.scss,*.less,*.php,*.html,*.twig -ErrorAction SilentlyContinue
$colours = @{}; $fonts = @{}
foreach ($f in $cssFiles) {
    $t = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $t) { continue }
    foreach ($m in [regex]::Matches($t, '#[0-9a-fA-F]{3,8}\b|rgba?\([^)]{3,40}\)')) {
        $k = $m.Value.ToLowerInvariant()
        if ($colours.ContainsKey($k)) { $colours[$k]++ } else { $colours[$k] = 1 }
    }
    foreach ($m in [regex]::Matches($t, '(?i)font-family\s*:\s*([^;}"]{3,120})')) {
        $k = $m.Groups[1].Value.Trim()
        if ($fonts.ContainsKey($k)) { $fonts[$k]++ } else { $fonts[$k] = 1 }
    }
}
$colours.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 60 |
    ForEach-Object { "{0,6}  {1}" -f $_.Value, $_.Key } |
    Set-Content -LiteralPath (Join-Path $OutPath 'branding\colors_used.txt') -Encoding UTF8
$fonts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 40 |
    ForEach-Object { "{0,6}  {1}" -f $_.Value, $_.Key } |
    Set-Content -LiteralPath (Join-Path $OutPath 'branding\fonts_used.txt') -Encoding UTF8
Ok "colors_used.txt ($($colours.Count) distinct) · fonts_used.txt ($($fonts.Count) distinct)"

# ---------------------------------------------------------------------- urls
Step "URL sources"

$sitemaps = Get-ChildItem -LiteralPath $SourcePath -Recurse -File -Filter 'sitemap*.xml' -ErrorAction SilentlyContinue
foreach ($s in $sitemaps) { Copy-Item -LiteralPath $s.FullName -Destination (Join-Path $OutPath "urls\$($s.Name)") -Force }
if ($sitemaps) { Ok "$($sitemaps.Count) sitemap file(s) copied" }
else {
    Warn "no local sitemap.xml — fetch it from the live site, or export from Search Console"
    Note "URL sources: no local sitemap found. A Search Console export is needed for the 301 map."
}

# ------------------------------------------------------------------- images
Step "Image inventory and samples"

$imgExt = @('.jpg','.jpeg','.png','.webp','.gif')
$images = Get-ChildItem -LiteralPath $SourcePath -Recurse -File -ErrorAction SilentlyContinue |
          Where-Object { $imgExt -contains $_.Extension.ToLowerInvariant() -and $_.Length -gt 20KB }

$hasDrawing = $true
try { Add-Type -AssemblyName System.Drawing -ErrorAction Stop } catch { $hasDrawing = $false }

$inv = @("filename`twidth`theight`tratio`tkb`tpath")
$ratioTally = @{}
$samplePool = New-Object System.Collections.ArrayList

foreach ($img in $images) {
    $w = 0; $h = 0
    if ($hasDrawing) {
        try {
            $bmp = [System.Drawing.Image]::FromFile($img.FullName)
            $w = $bmp.Width; $h = $bmp.Height; $bmp.Dispose()
        } catch { }
    }
    $ratio = if ($h -gt 0) { [math]::Round($w / $h, 3) } else { 0 }
    $relp  = $img.FullName.Substring($SourcePath.Length).TrimStart('\','/')
    $inv  += "$($img.Name)`t$w`t$h`t$ratio`t$([math]::Round($img.Length/1KB))`t$relp"

    if ($h -gt 0) {
        $bucket = switch ($ratio) {
            { $_ -ge 0.73 -and $_ -le 0.77 } { '3:4 (0.75)'; break }
            { $_ -ge 0.98 -and $_ -le 1.02 } { '1:1'; break }
            { $_ -ge 0.65 -and $_ -lt 0.73 } { 'по-тясно от 3:4'; break }
            { $_ -gt 0.77 -and $_ -lt 0.98 } { 'между 3:4 и квадрат'; break }
            { $_ -gt 1.02 }                  { 'хоризонтално'; break }
            default                          { 'много тясно' }
        }
        if ($ratioTally.ContainsKey($bucket)) { $ratioTally[$bucket]++ } else { $ratioTally[$bucket] = 1 }
    }
    if ($img.Length -gt 60KB) { [void]$samplePool.Add($img) }
}

Set-Content -LiteralPath (Join-Path $OutPath 'images\images_inventory.tsv') -Value $inv -Encoding UTF8
Ok "$($images.Count) images catalogued"

$ratioLines = @("Aspect ratio distribution (product photography must end up 3:4 = 0.750)","")
foreach ($k in ($ratioTally.Keys | Sort-Object { -$ratioTally[$_] })) {
    $ratioLines += ("{0,6}  {1}" -f $ratioTally[$k], $k)
}
Set-Content -LiteralPath (Join-Path $OutPath 'images\aspect_ratios.txt') -Value $ratioLines -Encoding UTF8
if (-not $hasDrawing) { Warn "System.Drawing unavailable — dimensions are blank; run in Windows PowerShell 5.1" }

# Spread the samples across the pool instead of taking the first N, which would
# all come from the same folder and tell us nothing about variety.
$n = [Math]::Min($SampleImageCount, $samplePool.Count)
if ($n -gt 0) {
    $stride = [Math]::Max(1, [Math]::Floor($samplePool.Count / $n))
    for ($i = 0; $i -lt $n; $i++) {
        $src = $samplePool[$i * $stride]
        Copy-Item -LiteralPath $src.FullName -Destination (Join-Path $OutPath "images\samples\$('{0:D2}' -f ($i+1))-$($src.Name)") -Force
    }
    Ok "$n sample images copied"
}

# ------------------------------------------------------------- final PII scan
Step "Final sweep over the output folder"

$flagged = New-Object System.Collections.ArrayList
Get-ChildItem -LiteralPath $OutPath -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $imgExt -notcontains $_.Extension.ToLowerInvariant() } | ForEach-Object {
        $t = Get-Content -LiteralPath $_.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $t) { return }
        foreach ($p in $SecretPattern) { if ($t -match $p) { [void]$flagged.Add("SECRET  $($_.FullName)"); return } }
        foreach ($p in $PiiPattern)    { if ($t -match $p) { [void]$flagged.Add("PII     $($_.FullName)"); return } }
    }

if ($flagged.Count -gt 0) {
    Bad "$($flagged.Count) file(s) still match a secret or PII pattern:"
    $flagged | ForEach-Object { Bad "   $_" }
    Set-Content -LiteralPath (Join-Path $OutPath 'FLAGGED-DO-NOT-UPLOAD.txt') -Value $flagged -Encoding UTF8
    Bad ""
    Bad "Do NOT upload this folder. Review the files above, remove or redact them,"
    Bad "delete FLAGGED-DO-NOT-UPLOAD.txt, then re-run the final scan."
    Note "FINAL SCAN FAILED: $($flagged.Count) file(s) flagged."
} else {
    Ok "clean — no secret or PII pattern matched anywhere in the output"
    Note "FINAL SCAN PASSED: no secret or PII pattern in the output."
}

# ------------------------------------------------------------------- README
$readme = @"
# /legacy — analysis package

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm')
Source:    $SourcePath
Tool:      tools/legacy/Export-LegacyPackage.ps1

## Please answer these two before uploading

The migration fails quietly without them.

1. In which currency are the prices stored, and do they include VAT?
   The new shop runs in EUR only. If the old prices are in leva, I need to know
   whether to convert.
   ANSWER:

2. How can you tell a product is no longer for sale?
   A column such as active/status, zero stock, or just a hidden category?
   Otherwise the full migration imports discontinued items too.
   ANSWER:

## Still missing (add by hand if you can)

- [ ] Search Console export: Performance > Pages > Export, last 16 months
- [ ] Screenshots in screenshots\: home, category, product, cart, checkout, admin
      (desktop and mobile if possible)
- [ ] Anything the script warned about above

## What this package deliberately does not contain

- No full SQL dump. db\schema.sql is structure only.
- No rows from user, customer, address, order, session, password, admin,
  log or newsletter tables.
- No credential values. Variable names are kept so the integrations are visible.
"@
Set-Content -LiteralPath (Join-Path $OutPath 'README.txt') -Value $readme -Encoding UTF8

# ------------------------------------------------------------------- report
$reportLines = @("Fabrizia legacy export - $(Get-Date -Format 'yyyy-MM-dd HH:mm')","") + $script:Report
Set-Content -LiteralPath (Join-Path $OutPath 'EXPORT-REPORT.txt') -Value $reportLines -Encoding UTF8

Step "Done"
Write-Host "  Package: $OutPath" -ForegroundColor Cyan
Write-Host "  Read README.txt, answer the two questions, then upload the folder." -ForegroundColor Cyan
if ($flagged.Count -gt 0) { Write-Host "  DO NOT UPLOAD until the flagged files are dealt with." -ForegroundColor Red }
