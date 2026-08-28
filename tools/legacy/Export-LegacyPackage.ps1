<#
.SYNOPSIS
    Builds a safe /legacy analysis package from the old Fabrizia PHP site.

.DESCRIPTION
    Reads the old site locally and writes ONLY derived, safe artefacts:
    schema without data, row counts, a catalogue extract, URL sources, brand
    colours and fonts, an image inventory and a few sample images.

    Personal data and secrets never reach the output. Four barriers enforce it:
      1. A deny list decides which tables may emit rows at all. Deny beats allow.
      2. A PII scan re-checks every row that survived barrier 1.
      3. Sensitive application code (accounts, orders, admin, mail, payments)
         and third-party libraries are summarised, never copied verbatim.
      4. A final sweep over the whole output replaces anything still matching
         with a summary, then fails loudly if something survives even that.

    Nothing is uploaded. The script writes to a folder you choose and stops.
    The source is only ever read: nothing under -SourcePath is written or moved.

.PARAMETER SourcePath
    The old site's folder.

.PARAMETER OutPath
    Where to write the package. Must be a new or empty folder.

.PARAMETER SqlDump
    Optional explicit path to the .sql dump. Found automatically if omitted.

.PARAMETER SampleImageCount
    How many real product images to copy for the visual assessment. Default 12.

.EXAMPLE
    .\Export-LegacyPackage.ps1 -SourcePath "C:\path\to\old-site" -OutPath "$HOME\Desktop\legacy-package"

.NOTES
    Windows PowerShell 5.1 or PowerShell 7. This file is deliberately ASCII-only:
    Windows PowerShell 5.1 reads .ps1 as ANSI unless there is a BOM, and non-ASCII
    characters cascade into parser errors. CI enforces this.
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

function Step($m) { Write-Host "`n> $m" -ForegroundColor Magenta }
function Ok($m)   { Write-Host "  [ok] $m"  -ForegroundColor Green }
function Warn($m) { Write-Host "  [!]  $m"  -ForegroundColor Yellow }
function Bad($m)  { Write-Host "  [x]  $m"  -ForegroundColor Red }

$script:Report = New-Object System.Collections.ArrayList
function Note($m) { [void]$script:Report.Add($m) }

# =============================================================== safety rules

# Deny always wins over allow. A table called last_viewed_products is tracking
# data first and catalogue second; product_customer_reviews is personal data
# first. Name matching is a blunt instrument, so it is set to over-refuse.
$DenyTable = @(
    'user','usr','customer','client','klient','member','account',
    'address','adres','contact','session','token','oauth','cookie',
    'password','passwd','remember','reset','login','auth',
    'admin','staff','employee','manager',
    'log','audit','history','activity','event',
    'newsletter','subscriber','mail','email','phone','sms',
    'order','poruchk','cart','checkout','payment','transaction','invoice','fakt',
    'comment','review','rating','message','feedback','inquiry',
    'visit','visitor','tracking','analytics','ip','stat','statistic',
    'view','views','seen','click','impression',
    # Reported by the first real run: these matched "product" in the allow list
    # while actually holding per-user behaviour.
    'viewed','favourite','favorite','wishlist','wish_list','recent','saved','compare'
)

# Only these may emit rows, and only after the PII scan agrees.
$AllowTable = @(
    'product','produkt','categor','kategor','attribut','atribut','brand',
    'collection','kolekc','size','razmer','color','colour','cvyat','tag','image','catalog',
    'snimk','gallery','galer','variant','quantit','stock','price','cena',
    'currency','menu','page','stranic','banner','slider','seo','redirect',
    'translation','setting'
)

$PiiPattern = @(
    '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',
    '(\+359|00359|\b0)8[789][0-9]{7}\b',
    '\bBG[0-9]{2}[A-Z]{4}[0-9A-Z]{14}\b'
)

$SecretPattern = @(
    'sk_live_[0-9a-zA-Z]{10,}', 'pk_live_[0-9a-zA-Z]{10,}',
    'AKIA[0-9A-Z]{16}', '-----BEGIN [A-Z ]*PRIVATE KEY-----',
    'ghp_[0-9A-Za-z]{30,}', 'xox[baprs]-[0-9A-Za-z-]{10,}',
    'AIza[0-9A-Za-z_\-]{35}'
)

# Third-party libraries and build artefacts. They tell us nothing about the
# shop, they are megabytes of noise, and they are where almost every false
# positive in the first real run came from.
$VendorPathPattern = @(
    'vendor', 'node_modules', 'composer', 'phpmailer', 'swiftmailer',
    'twitteroauth', 'twitter', 'minify', 'jquery', 'bootstrap',
    'tinymce', 'ckeditor', 'fpdf', 'tcpdf', 'mpdf', 'guzzle', 'symfony',
    'monolog', 'phpexcel', 'phpoffice', 'smarty', 'fontawesome', 'modernizr',
    'plupload', 'colorbox', 'fancybox', 'slick', 'owl', 'select2', 'datatables'
)

# Application code that touches accounts, orders, admin, mail or payments.
# These are summarised rather than copied: the summary tells me what the file
# does, the file itself would carry customer data and credentials.
$SensitivePathPattern = @(
    'password', 'reset', 'register', 'login', 'logout', 'signup', 'signin',
    'account', 'profile', 'customer', 'client',
    'order', 'cart', 'checkout', 'payment', 'invoice',
    'admin', 'management', 'backend', 'panel',
    'mail', 'email', 'smtp', 'contact_form', 'contact-form',
    'econt', 'speedy', 'courier', 'delivery',
    'auth', 'session', 'token', 'api/'
)

function Test-AnyPattern([string]$text, [string[]]$patterns) {
    $t = $text.ToLowerInvariant()
    foreach ($p in $patterns) { if ($t -like "*$($p.ToLowerInvariant())*") { return $true } }
    return $false
}

# Table names match on underscore-delimited tokens, never as a bare substring.
# Substring matching denies "catalog" because it contains "log" and "author"
# because it contains "auth" - both wrong, and both silent.
#
# The two lists match differently on purpose:
#   deny  - whole token, optional plural. Precise, so it cannot swallow
#           legitimate catalogue tables.
#   allow - token prefix, because the list is stems: "categor" has to reach
#           "categories" and "kategorii" alike.
# Deny is evaluated first and always wins.
function Test-DenyTerm([string]$name, [string[]]$terms) {
    $n = $name.ToLowerInvariant()
    foreach ($t in $terms) {
        if ($n -match ('(^|_)' + [regex]::Escape($t) + '(s|es)?($|_)')) { return $true }
    }
    return $false
}
function Test-AllowStem([string]$name, [string[]]$stems) {
    $n = $name.ToLowerInvariant()
    foreach ($t in $stems) {
        if ($n -match ('(^|_)' + [regex]::Escape($t) + '[a-z0-9]*($|_)')) { return $true }
    }
    return $false
}
function Test-Deny([string]$name)  { return (Test-DenyTerm  $name $DenyTable) }
function Test-Allow([string]$name) { return (Test-AllowStem $name $AllowTable) }
function Test-Pii([string]$text) {
    foreach ($p in $PiiPattern) { if ($text -match $p) { return $true } }
    return $false
}
function Test-Secret([string]$text) {
    foreach ($p in $SecretPattern) { if ($text -match $p) { return $true } }
    return $false
}

# Regexes that contain both quote characters live in single-quoted here-strings.
# Written inline they terminate the surrounding PowerShell string and the parser
# cascades from there - which is exactly what broke the first release.
$CredentialAssignPattern = @'
(?i)((?:password|passwd|pwd|secret|api[_-]?key|apikey|token|private[_-]?key|smtp[_-]?pass|db[_-]?pass|dbpass|dbuser|db[_-]?name)\s*(?:=|=>|:)\s*)(["'])(?:(?!\2).){3,}(\2)
'@

$CredentialDefinePattern = @'
(?i)(define\s*\(\s*["'][A-Z_]*(?:PASS|SECRET|KEY|TOKEN|USER|HOST|DB)[A-Z_]*["']\s*,\s*)(["'])(?:(?!\2).){3,}(\2)
'@

# ================================================================== summaries

function New-CodeSummary {
    param([string]$FullPath, [string]$RelPath, [string]$Reason)

    $funcs = New-Object System.Collections.Generic.HashSet[string]
    $classes = New-Object System.Collections.Generic.HashSet[string]
    $tables = New-Object System.Collections.Generic.HashSet[string]
    $hosts = New-Object System.Collections.Generic.HashSet[string]
    $includes = New-Object System.Collections.Generic.HashSet[string]
    $lineCount = 0

    try {
        $reader = [System.IO.StreamReader]::new($FullPath, [System.Text.Encoding]::UTF8, $true)
        try {
            while ($null -ne ($line = $reader.ReadLine())) {
                $lineCount++
                foreach ($m in [regex]::Matches($line, '(?i)\bfunction\s+([A-Za-z_][A-Za-z0-9_]{1,60})')) {
                    [void]$funcs.Add($m.Groups[1].Value)
                }
                foreach ($m in [regex]::Matches($line, '(?i)\bclass\s+([A-Za-z_][A-Za-z0-9_]{1,60})')) {
                    [void]$classes.Add($m.Groups[1].Value)
                }
                foreach ($m in [regex]::Matches($line, '(?i)\b(?:FROM|JOIN|INTO|UPDATE)\s+`?([a-z0-9_]{2,40})`?')) {
                    [void]$tables.Add($m.Groups[1].Value.ToLowerInvariant())
                }
                foreach ($m in [regex]::Matches($line, 'https?://([A-Za-z0-9.-]{4,60})')) {
                    [void]$hosts.Add($m.Groups[1].Value.ToLowerInvariant())
                }
                foreach ($m in [regex]::Matches($line, '(?i)\b(?:include|require)(?:_once)?\s*\(?\s*[^;]{0,80}?([A-Za-z0-9_\-]{2,40}\.php)')) {
                    [void]$includes.Add($m.Groups[1].Value)
                }
            }
        } finally { $reader.Dispose() }
    } catch { }

    $out = New-Object System.Collections.ArrayList
    [void]$out.Add("SUMMARY ONLY - the source file was not copied.")
    [void]$out.Add("Reason: $Reason")
    [void]$out.Add("Path:   $RelPath")
    [void]$out.Add("Lines:  $lineCount")
    [void]$out.Add("")
    [void]$out.Add("This file is described, not reproduced. No line of its code is present here.")
    [void]$out.Add("")
    if ($classes.Count)  { [void]$out.Add("Classes:      " + (($classes  | Sort-Object) -join ', ')) }
    if ($funcs.Count)    { [void]$out.Add("Functions:    " + (($funcs    | Sort-Object) -join ', ')) }
    if ($tables.Count)   { [void]$out.Add("DB tables:    " + (($tables   | Sort-Object) -join ', ')) }
    if ($includes.Count) { [void]$out.Add("Includes:     " + (($includes | Sort-Object) -join ', ')) }
    if ($hosts.Count)    { [void]$out.Add("External hosts: " + (($hosts  | Sort-Object) -join ', ')) }
    return ($out -join "`r`n")
}

# ================================================================== preflight
Step "Preflight"

if (-not (Test-Path -LiteralPath $SourcePath)) { throw "SourcePath not found: $SourcePath" }
$SourcePath = (Resolve-Path -LiteralPath $SourcePath).Path
Ok "source: $SourcePath"

if (Test-Path -LiteralPath $OutPath) {
    $existing = @(Get-ChildItem -LiteralPath $OutPath -Force -ErrorAction SilentlyContinue)
    if ($existing.Count -gt 0) { throw "OutPath is not empty: $OutPath. Use a new folder." }
} else {
    New-Item -ItemType Directory -Path $OutPath -Force | Out-Null
}
$OutPath = (Resolve-Path -LiteralPath $OutPath).Path
Ok "output: $OutPath"

foreach ($d in 'code','code-summaries','db','urls','branding','images','images\samples','screenshots') {
    New-Item -ItemType Directory -Path (Join-Path $OutPath $d) -Force | Out-Null
}

# =================================================================== the dump
Step "Locating the SQL dump"

if (-not $SqlDump) {
    $cand = @(Get-ChildItem -LiteralPath $SourcePath -Recurse -File -Filter *.sql -ErrorAction SilentlyContinue |
              Sort-Object Length -Descending)
    if ($cand.Count -gt 0) { $SqlDump = $cand[0].FullName }
}

$dumpFound = $false
if (-not $SqlDump -or -not (Test-Path -LiteralPath $SqlDump)) {
    $arch = @(Get-ChildItem -LiteralPath $SourcePath -Recurse -File -Include *.rar,*.zip,*.7z -ErrorAction SilentlyContinue)
    if ($arch.Count -gt 0) {
        Warn "No .sql found, but an archive exists: $($arch[0].Name)"
        Warn "Extract it first, then re-run. Archives are not unpacked on purpose:"
        Warn "unpacking a dump of unknown contents is where personal data leaks in."
    } else {
        Warn "No .sql dump found. Everything except the database steps will still run."
    }
    Note "SQL dump: NOT FOUND - schema.sql, table_counts.txt and the catalogue extract were skipped."
} else {
    $dumpFound = $true
    $dumpInfo = Get-Item -LiteralPath $SqlDump
    Ok "dump: $($dumpInfo.Name) ($([math]::Round($dumpInfo.Length / 1MB, 1)) MB)"
}

if ($dumpFound) {
    Step "Reading the dump (streamed - the file is never loaded whole)"

    $schemaPath  = Join-Path $OutPath 'db\schema.sql'
    $catalogPath = Join-Path $OutPath 'db\catalog_data.sql'

    $utf8NoBom  = New-Object System.Text.UTF8Encoding($false)
    $schemaOut  = [System.IO.StreamWriter]::new($schemaPath,  $false, $utf8NoBom)
    $catalogOut = [System.IO.StreamWriter]::new($catalogPath, $false, $utf8NoBom)
    $reader     = [System.IO.StreamReader]::new($SqlDump, [System.Text.Encoding]::UTF8, $true)

    $rowCount    = @{}
    $deniedSeen  = @{}
    $piiBlocked  = @{}
    $catalogSeen = @{}
    $inCreate    = $false
    $lineNo      = 0

    try {
        $schemaOut.WriteLine("-- Structure only. Generated by tools/legacy/Export-LegacyPackage.ps1")
        $schemaOut.WriteLine("-- No INSERT statement can reach this file: it is written by a")
        $schemaOut.WriteLine("-- different branch of the parser than the one that sees INSERTs.")
        $schemaOut.WriteLine("")

        while ($null -ne ($line = $reader.ReadLine())) {
            $lineNo++

            if ($line -match '^\s*CREATE\s+TABLE') { $inCreate = $true }

            if ($inCreate) {
                $schemaOut.WriteLine($line)
                if ($line -match ';\s*$') { $inCreate = $false; $schemaOut.WriteLine("") }
                continue
            }

            if ($line -match '^\s*(DROP TABLE|ALTER TABLE|CREATE (UNIQUE )?INDEX|CREATE VIEW|SET |/\*!|--|#)') {
                $schemaOut.WriteLine($line); continue
            }

            if ($line -match '^\s*INSERT\s+INTO\s+[`"\[]?([A-Za-z0-9_$]+)') {
                $table = $Matches[1]

                $tuples = ([regex]::Matches($line, '\),\s*\(')).Count + 1
                if ($rowCount.ContainsKey($table)) { $rowCount[$table] += $tuples } else { $rowCount[$table] = $tuples }

                if (Test-Deny $table) { $deniedSeen[$table] = $true; continue }
                if (-not (Test-Allow $table)) { continue }
                if ($piiBlocked.ContainsKey($table)) { continue }
                if (Test-Pii $line) { $piiBlocked[$table] = $true; continue }

                $catalogOut.WriteLine($line)
                $catalogSeen[$table] = $true
                continue
            }
        }
    } finally {
        $reader.Dispose(); $schemaOut.Dispose(); $catalogOut.Dispose()
    }

    Ok "schema.sql written - $lineNo lines scanned, zero INSERTs emitted into it"

    $countLines = @("table_name`trow_count_approx")
    foreach ($t in ($rowCount.Keys | Sort-Object)) { $countLines += "$t`t$($rowCount[$t])" }
    Set-Content -LiteralPath (Join-Path $OutPath 'db\table_counts.txt') -Value $countLines -Encoding UTF8
    Ok "table_counts.txt - $($rowCount.Count) tables"

    if ($deniedSeen.Count -gt 0) {
        Ok "$($deniedSeen.Count) tables held back by the deny list"
        Note "Rows never emitted (deny list): $(($deniedSeen.Keys | Sort-Object) -join ', ')"
    }
    if ($piiBlocked.Count -gt 0) {
        Warn "$($piiBlocked.Count) catalogue tables dropped by the PII scan"
        Note "Dropped by PII scan: $(($piiBlocked.Keys | Sort-Object) -join ', ')"
    }
    if ($catalogSeen.Count -gt 0) {
        Ok "catalog_data.sql - $($catalogSeen.Count) tables"
        Note "Catalogue tables exported: $(($catalogSeen.Keys | Sort-Object) -join ', ')"
    } else {
        Remove-Item -LiteralPath $catalogPath -ErrorAction SilentlyContinue
        Warn "no catalogue table passed both checks - catalog_data.sql not written"
    }
}

# ======================================================================= code
Step "Copying application code"

$skipDir  = @('vendor','node_modules','.git','cache','tmp','temp','logs','log',
              'uploads','upload','images','image','media','img','files','backup','backups')
$skipExt  = @('.log','.sql','.rar','.zip','.7z','.gz','.tar','.phar','.jpg','.jpeg','.png',
              '.gif','.webp','.svg','.ico','.mp4','.mov','.pdf','.psd','.ai','.woff','.woff2',
              '.ttf','.eot','.map','.lock')
$skipName = @('.env','.htpasswd','id_rsa','id_dsa','.npmrc','.netrc')

$copied = 0; $scrubbed = 0; $summarised = 0; $skippedVendor = 0
$summaryIndex = New-Object System.Collections.ArrayList

$allFiles = @(Get-ChildItem -LiteralPath $SourcePath -Recurse -File -ErrorAction SilentlyContinue)
foreach ($f in $allFiles) {
    $rel = $f.FullName.Substring($SourcePath.Length).TrimStart('\','/')
    $parts = $rel -split '[\\/]'
    # Patterns such as 'api/' never match a Windows path unless it is normalised.
    $relMatch = $rel -replace '\\', '/'

    $skip = $false
    foreach ($p in $parts) { if ($skipDir -contains $p.ToLowerInvariant()) { $skip = $true; break } }
    if ($skip) { continue }
    if ($skipExt  -contains $f.Extension.ToLowerInvariant()) { continue }
    if ($skipName -contains $f.Name.ToLowerInvariant())      { continue }

    # Third-party code: not copied, not summarised. It says nothing about the shop.
    if (Test-AnyPattern $relMatch $VendorPathPattern) { $skippedVendor++; continue }

    # Minified assets are unreadable and full of false positives.
    if ($f.Name -match '(?i)\.min\.(js|css)$') { $skippedVendor++; continue }
    if ($f.Length -gt 2MB) { $skippedVendor++; continue }

    # Sensitive flows: described, never reproduced. Restricted to server-side
    # code, so a stylesheet called border.css is not mistaken for an order flow.
    $serverExt = @('.php','.inc','.phtml','.phps','.tpl','.module')
    if (($serverExt -contains $f.Extension.ToLowerInvariant()) -and (Test-AnyPattern $relMatch $SensitivePathPattern)) {
        $summaryText = New-CodeSummary -FullPath $f.FullName -RelPath $rel -Reason 'account / order / admin / mail / payment flow'
        $dest = Join-Path (Join-Path $OutPath 'code-summaries') ($rel -replace '[\\/]', '__')
        Set-Content -LiteralPath "$dest.summary.txt" -Value $summaryText -Encoding UTF8
        [void]$summaryIndex.Add($rel)
        $summarised++
        continue
    }

    $text = $null
    try { $text = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction Stop } catch { continue }
    if ($null -eq $text) { $text = '' }

    $before = $text
    $text = [regex]::Replace($text, $CredentialAssignPattern, '$1$2***REMOVED***$3')
    $text = [regex]::Replace($text, $CredentialDefinePattern, '$1$2***REMOVED***$3')
    foreach ($sp in $SecretPattern) { $text = [regex]::Replace($text, $sp, '***REMOVED***') }
    if ($text -ne $before) { $scrubbed++ }

    $dest = Join-Path (Join-Path $OutPath 'code') $rel
    New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
    Set-Content -LiteralPath $dest -Value $text -Encoding UTF8 -NoNewline
    $copied++
}

Ok "$copied files copied, credentials blanked in $scrubbed"
Ok "$summarised sensitive files summarised instead of copied"
Ok "$skippedVendor third-party or minified files skipped entirely"
Note "Code: $copied copied, $summarised summarised, $skippedVendor skipped as third-party."
if ($summaryIndex.Count -gt 0) {
    Set-Content -LiteralPath (Join-Path $OutPath 'code-summaries\_index.txt') `
        -Value (@("Files described but not copied:","") + ($summaryIndex | Sort-Object)) -Encoding UTF8
}

# =============================================== remediation pass over /code
Step "Re-scanning the copied code"

$remediated = 0
$codeFiles = @(Get-ChildItem -LiteralPath (Join-Path $OutPath 'code') -Recurse -File -ErrorAction SilentlyContinue)
foreach ($cf in $codeFiles) {
    $t = Get-Content -LiteralPath $cf.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $t) { continue }
    if ((Test-Secret $t) -or (Test-Pii $t)) {
        # Do not ship it, but do not lose the knowledge either.
        $rel = $cf.FullName.Substring((Join-Path $OutPath 'code').Length).TrimStart('\','/')
        $summaryText = New-CodeSummary -FullPath $cf.FullName -RelPath $rel -Reason 'matched a secret or PII pattern after copying'
        $dest = Join-Path (Join-Path $OutPath 'code-summaries') ($rel -replace '[\\/]', '__')
        Set-Content -LiteralPath "$dest.summary.txt" -Value $summaryText -Encoding UTF8
        Remove-Item -LiteralPath $cf.FullName -Force
        $remediated++
    }
}
if ($remediated -gt 0) {
    Warn "$remediated copied file(s) matched after the fact - replaced with summaries"
    Note "Replaced with summaries after the re-scan: $remediated file(s)."
} else {
    Ok "no copied file matched a secret or PII pattern"
}

# =================================================================== branding
Step "Brand colours and fonts"

$cssFiles = @(Get-ChildItem -LiteralPath (Join-Path $OutPath 'code') -Recurse -File `
              -Include *.css,*.scss,*.less,*.php,*.html,*.twig -ErrorAction SilentlyContinue)
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
@($colours.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 60) |
    ForEach-Object { "{0,6}  {1}" -f $_.Value, $_.Key } |
    Set-Content -LiteralPath (Join-Path $OutPath 'branding\colors_used.txt') -Encoding UTF8
@($fonts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 40) |
    ForEach-Object { "{0,6}  {1}" -f $_.Value, $_.Key } |
    Set-Content -LiteralPath (Join-Path $OutPath 'branding\fonts_used.txt') -Encoding UTF8
Ok "colors_used.txt ($($colours.Count) distinct) - fonts_used.txt ($($fonts.Count) distinct)"

# ======================================================================= urls
Step "URL sources"

$sitemaps = @(Get-ChildItem -LiteralPath $SourcePath -Recurse -File -Filter 'sitemap*.xml' -ErrorAction SilentlyContinue)
foreach ($s in $sitemaps) { Copy-Item -LiteralPath $s.FullName -Destination (Join-Path $OutPath "urls\$($s.Name)") -Force }
if ($sitemaps.Count -gt 0) {
    Ok "$($sitemaps.Count) sitemap file(s) copied"
} else {
    Warn "no local sitemap.xml - fetch it from the live site or export from Search Console"
    Note "URL sources: no local sitemap. A Search Console export is needed for the 301 map."
}

# ===================================================================== images
Step "Image inventory and samples"

$imgExt = @('.jpg','.jpeg','.png','.webp','.gif')
$images = @(Get-ChildItem -LiteralPath $SourcePath -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $imgExt -contains $_.Extension.ToLowerInvariant() -and $_.Length -gt 20KB })

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
        $bucket = 'other'
        if     ($ratio -ge 0.73 -and $ratio -le 0.77) { $bucket = 'portrait 3:4 (target)' }
        elseif ($ratio -ge 0.98 -and $ratio -le 1.02) { $bucket = 'square' }
        elseif ($ratio -lt 0.73)                      { $bucket = 'portrait narrower than 3:4' }
        elseif ($ratio -gt 1.02)                      { $bucket = 'landscape' }
        else                                          { $bucket = 'between 3:4 and square' }
        if ($ratioTally.ContainsKey($bucket)) { $ratioTally[$bucket]++ } else { $ratioTally[$bucket] = 1 }
    }
    if ($img.Length -gt 60KB) { [void]$samplePool.Add($img) }
}

Set-Content -LiteralPath (Join-Path $OutPath 'images\images_inventory.tsv') -Value $inv -Encoding UTF8
Ok "$($images.Count) images catalogued"

$ratioLines = @("Aspect ratio distribution. Product photography must end up 3:4 = 0.750.","")
foreach ($k in ($ratioTally.Keys | Sort-Object { -$ratioTally[$_] })) {
    $ratioLines += ("{0,6}  {1}" -f $ratioTally[$k], $k)
}
Set-Content -LiteralPath (Join-Path $OutPath 'images\aspect_ratios.txt') -Value $ratioLines -Encoding UTF8
if (-not $hasDrawing) { Warn "System.Drawing unavailable - dimensions blank; run under Windows PowerShell 5.1" }

$n = [Math]::Min($SampleImageCount, $samplePool.Count)
if ($n -gt 0) {
    $stride = [Math]::Max(1, [Math]::Floor($samplePool.Count / $n))
    for ($i = 0; $i -lt $n; $i++) {
        $src = $samplePool[$i * $stride]
        Copy-Item -LiteralPath $src.FullName -Destination (Join-Path $OutPath "images\samples\$('{0:D2}' -f ($i+1))-$($src.Name)") -Force
    }
    Ok "$n sample images copied"
}

# ============================================================== final sweep
Step "Final sweep over the output folder"

$flagged = New-Object System.Collections.ArrayList
$outFiles = @(Get-ChildItem -LiteralPath $OutPath -Recurse -File -ErrorAction SilentlyContinue |
              Where-Object { $imgExt -notcontains $_.Extension.ToLowerInvariant() })
foreach ($of in $outFiles) {
    $t = Get-Content -LiteralPath $of.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $t) { continue }
    if (Test-Secret $t) { [void]$flagged.Add("SECRET  $($of.FullName)"); continue }
    if (Test-Pii    $t) { [void]$flagged.Add("PII     $($of.FullName)"); continue }
}

$scanPassed = ($flagged.Count -eq 0)
if (-not $scanPassed) {
    Bad "$($flagged.Count) file(s) still match a secret or PII pattern:"
    foreach ($f in $flagged) { Bad "   $f" }
    Set-Content -LiteralPath (Join-Path $OutPath 'FLAGGED-DO-NOT-UPLOAD.txt') -Value $flagged -Encoding UTF8
    Note "FINAL SCAN FAILED: $($flagged.Count) file(s) flagged."
} else {
    Ok "clean - no secret or PII pattern anywhere in the output"
    Note "FINAL SCAN PASSED: no secret or PII pattern in the output."
}

# ===================================================================== README
$readme = @"
# /legacy - analysis package

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm')
Source:    $SourcePath
Tool:      tools/legacy/Export-LegacyPackage.ps1

## Two answers the migration needs

1. In which currency are the prices stored, and do they include VAT?
   ANSWER:

2. How can you tell a product is no longer for sale?
   ANSWER:

## Still to add by hand

- [ ] Search Console export: Performance > Pages > Export, last 16 months
- [ ] Screenshots in screenshots\: home, category, product, cart, checkout, admin

## What this package deliberately does not contain

- No full SQL dump. db\schema.sql is structure only.
- No rows from user, customer, address, order, session, password, admin, log,
  newsletter, viewed, favourite or wishlist tables.
- No third-party libraries.
- No account, order, admin, mail or payment source files. Those are described
  in code-summaries\ instead: what they do, which tables they touch, which
  hosts they call - without a line of their code.
- No credential values. Variable names are kept so integrations stay visible.

## Upload only if the final scan passed

Check EXPORT-REPORT.txt. If FLAGGED-DO-NOT-UPLOAD.txt exists, do not upload.
"@
Set-Content -LiteralPath (Join-Path $OutPath 'README.txt') -Value $readme -Encoding UTF8

$reportLines = @("Fabrizia legacy export - $(Get-Date -Format 'yyyy-MM-dd HH:mm')","") + @($script:Report)
Set-Content -LiteralPath (Join-Path $OutPath 'EXPORT-REPORT.txt') -Value $reportLines -Encoding UTF8

Step "Done"
Write-Host "  Package: $OutPath" -ForegroundColor Cyan
if ($scanPassed) {
    Write-Host "  Final scan passed. Read README.txt, answer the two questions, then upload." -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "  DO NOT UPLOAD. See FLAGGED-DO-NOT-UPLOAD.txt." -ForegroundColor Red
    exit 2
}
