# Подготовка на стария сайт за анализ

> Заменя [04-legacy-audit-request.md](04-legacy-audit-request.md) с изпълним чеклист.
> Цел: да получа всичко нужно за миграцията, **без нито един секрет или личен данен да влезе в git**.

## Правило номер едно

**Каквото влезе в git история, остава завинаги** — дори да го изтриеш със следващия commit.
Затова чистенето става **преди** качването, върху копие. Никога не работи върху живия сайт.

---

## Стъпка 1 · Направи копие, не работи върху живото

```bash
# на локалната машина
mkdir -p ~/fabrizia-legacy && cd ~/fabrizia-legacy

# изтегли кода без тежките папки
rsync -av --progress \
  --exclude 'vendor/' \
  --exclude 'node_modules/' \
  --exclude '.git/' \
  --exclude 'cache/' \
  --exclude 'tmp/' \
  --exclude 'logs/' \
  --exclude '*.log' \
  --exclude 'uploads/' \
  --exclude 'images/' \
  --exclude 'media/' \
  user@stariq-server:/path/to/site/ ./code/
```

Снимките се изключват нарочно — те са гигабайти и не ми трябват като файлове (виж стъпка 5).

## Стъпка 2 · Извади секретите

**Намери ги:**

```bash
cd ~/fabrizia-legacy/code
grep -rniE "password|passwd|pwd|secret|api[_-]?key|token|smtp|private[_-]?key|BEGIN RSA" \
  --include="*.php" --include="*.ini" --include="*.env" --include="*.conf" \
  --include="*.yml" --include="*.yaml" --include="*.json" . | head -100
```

**Замени ги, без да триеш имената на променливите** — имената ми трябват, за да разбера какви
интеграции е имало:

```php
// ПРЕДИ
define('DB_PASSWORD', 'r3alPassw0rd!');
$stripe_key = 'sk_live_51Abc...';

// СЛЕД
define('DB_PASSWORD', '***REMOVED***');
$stripe_key = '***REMOVED***';
```

**Задължително изтрий напълно:**
- `.env`, `.env.production`, `config/database.php` с реални пароли → остави `.env.example` вместо тях
- `.htpasswd`, `id_rsa`, `*.pem`, `*.key`, `*.p12`, `*.pfx`
- Файлове с креденшъли към куриери, платежен доставчик, SMTP
- Бекъп файлове: `*.sql`, `*.sql.gz`, `*.tar.gz`, `*.zip` вътре в папката на кода
- `error_log`, `access_log`, всякакви логове (съдържат IP-та и параметри на заявки)

**Провери накрая:**

```bash
# ако имаш gitleaks — най-надеждната проверка
gitleaks detect --source ~/fabrizia-legacy/code --no-git -v

# ръчна контролна проверка
grep -rnE "sk_live|pk_live|AKIA[0-9A-Z]{16}|-----BEGIN" ~/fabrizia-legacy/code
```

Ако последната команда върне **нула резултата**, си готов.

## Стъпка 3 · SQL дъмп — само схема плюс безопасни данни

**Не качвай пълния дъмп.** Той съдържа имена, адреси, телефони и хешове на пароли на реални клиенти.
Нужни са ми два файла:

**Файл 1 — пълната схема, без нито един ред данни:**

```bash
mysqldump --no-data --skip-add-drop-table --routines --triggers \
  -u USER -p DBNAME > schema.sql
```

**Файл 2 — данни само от неличните таблици:**

```bash
# сложи тук реалните имена на таблиците за продукти, категории, атрибути
mysqldump --complete-insert \
  -u USER -p DBNAME \
  products product_variants categories category_product attributes \
  brands collections product_images \
  > catalog_data.sql
```

**Файл 3 — броячи, за да знам мащаба (без съдържание):**

```bash
mysql -u USER -p -e "
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema='DBNAME'
ORDER BY table_rows DESC;" > table_counts.txt
```

**Файл 4 — анонимизирана извадка от поръчки** (трябва ми структурата, не хората):

```bash
mysql -u USER -p DBNAME -e "
SELECT id, status, total, currency, payment_method, shipping_method,
       created_at, updated_at
FROM orders ORDER BY id DESC LIMIT 200;" > orders_sample.tsv
```

**Никога не качвай:** таблици `users`, `customers`, `addresses`, `sessions`, `newsletter`,
`password_resets`, `admin_users`, `logs` — с данни. Схемата им е достатъчна.

## Стъпка 4 · Списък с URL-и

Това е най-ценното за SEO миграцията. Дай поне два от трите източника:

**А. Sitemap на стария сайт**
```bash
curl -s https://fabriziafashion.bg/sitemap.xml -o sitemap.xml
# ако е индекс от няколко файла — изтегли всичките
```

**Б. Google Search Console** (най-важният)
- Ефективност → Страници → **Експорт → CSV**, период **последните 16 месеца**
- Ефективност → Заявки → експорт, същия период
- Индексиране → Страници → експорт на индексираните адреси

**В. Пълно обхождане** — Screaming Frog SEO Spider, безплатната версия стига до 500 URL-а:
- обходи `fabriziafashion.bg`
- експортирай `Internal → All` като CSV
- експортирай и отчета за отговорите (кои адреси вече връщат 404)

## Стъпка 5 · Снимки — само инвентар, не файловете

Не ми трябват гигабайти изображения. Трябва ми **какво има и в какво състояние е**:

```bash
# структура на папката, до 3 нива
find /path/to/site/uploads -maxdepth 3 -type d | head -50 > images_structure.txt

# брой и общ размер
find /path/to/site/uploads -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) | wc -l
du -sh /path/to/site/uploads

# извадка: имена, размери в пиксели и тегло за 50 файла
find /path/to/site/uploads -type f -iname '*.jpg' | head -50 | \
  xargs -I{} sh -c 'identify -format "%f %wx%h %b\n" "{}" 2>/dev/null' > images_sample.txt
```

**Плюс 10 реални снимки** — по една от най-типичните видове (продукт на бял фон, продукт на модел,
детайл, банер). От тях преценявам качеството и дали са годни за нов сайт, или трябва нова фотосесия.

## Стъпка 6 · CSS и визуална идентичност

Тук вадя брандовата палитра, за да не бягаме от идентичността на Fabrizia.

```bash
# всички CSS файлове, включително вградените в темплейтите
find ~/fabrizia-legacy/code -name '*.css' -o -name '*.scss' -o -name '*.less' > css_files.txt

# всички използвани цветове, подредени по честота
grep -rhoE "#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)" \
  --include="*.css" --include="*.scss" --include="*.php" ~/fabrizia-legacy/code \
  | sort | uniq -c | sort -rn | head -40 > colors_used.txt

# шрифтове
grep -rhoiE "font-family:[^;]+;" --include="*.css" ~/fabrizia-legacy/code \
  | sort | uniq -c | sort -rn > fonts_used.txt
```

## Стъпка 7 · Screenshots

12 файла — десктоп и мобилно за: начална, категория, продукт, кошница, checkout, админ.
Плюс един кадър на това, което най-много дразни в стария админ.

Именувай ги така, че да се четат: `01-home-desktop.png`, `01-home-mobile.png`, и т.н.

## Стъпка 8 · Качване

```
/legacy
  /code                 почистеният код
  /db
    schema.sql
    catalog_data.sql
    table_counts.txt
    orders_sample.tsv
  /urls
    sitemap.xml
    gsc-pages.csv
    gsc-queries.csv
    crawl-internal-all.csv
  /images
    images_structure.txt
    images_sample.txt
    /samples            10 реални снимки
  /branding
    colors_used.txt
    fonts_used.txt
    logo.svg
  /screenshots          12 файла
  README.txt            какво липсва и защо
```

## Финална проверка преди push

- [ ] `gitleaks detect --no-git` върху цялата папка `/legacy` — нула находки
- [ ] `grep -rE "sk_live|pk_live|-----BEGIN|AKIA"` — нула резултата
- [ ] Нито един `.sql` файл не съдържа таблици `users`, `customers`, `addresses` с данни
- [ ] Нито един лог файл
- [ ] Няма `.env` с реални стойности
- [ ] Общият размер на `/legacy` е под 200 MB
- [ ] Ако **някога** реален ключ е бил в старото repo или на сървъра — **смени го сега**,
      независимо от това какво качваш. Компрометиран ключ не се оправя с изтриване на файл.

## Ако нещо не можеш да извадиш

Не се блокирай. Качи каквото имаш и напиши в `README.txt` какво липсва и защо. Работя с непълни данни;
не работя с данни, за които не знам, че липсват.

**Абсолютният минимум, за да започна анализа:** `schema.sql`, `table_counts.txt`, списък с URL-и от
поне един източник, `colors_used.txt` и 6 screenshot-а.
