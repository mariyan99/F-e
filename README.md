# Fabrizia — e-commerce платформа

Преизграждане на fabriziafashion.bg: headless магазин за дамска мода.
**Medusa v2** за търговията, **Next.js 15** за витрината, **Payload CMS 3** за съдържанието,
две отделни **PostgreSQL 16** бази.

Старият PHP сайт не се доразвива — служи само за анализ и миграция.

**Пускане на основния домейн: 20–27.10.2026.** Новият сайт заменя стария на `fabriziafashion.bg`
(решение O-3), затова 301 картата и пълният каталог са блокиращи.
**10.09 е вътрешна go/no-go проверка на staging**, не пускане — виж
[11-main-domain-launch.md](docs/plan/11-main-domain-launch.md).

---

## Бързо пускане

Изисквания: **Node 22.22.2** (`nvm use`), **pnpm 10** (`corepack enable`), **Docker**.

```bash
git clone https://github.com/mariyan99/F-e.git && cd F-e
pnpm bootstrap
```

`pnpm bootstrap` прави всичко: създава `.env` файловете от примерите, вдига
контейнерите, инсталира зависимостите, билдва споделения пакет и пуска
миграциите. После:

```bash
pnpm seed        # регион България/EUR, ДДС 20%, склад, 3 модела в 2 цвята
```

Seed-ът отпечатва publishable ключ. Сложи го в `apps/storefront/.env`:

```
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

Създай администратори — по един за всеки панел:

```bash
pnpm --filter @fabrizia/backend user -- -e ti@fabrizia.bg -p <парола>   # Medusa
# Payload иска първия си потребител през браузъра при първо отваряне на /admin
```

Пусни всичко:

```bash
pnpm dev
```

| Адрес | Какво е |
|---|---|
| http://localhost:8000 | витрината |
| http://localhost:8000/admin | **админ за съдържание** (Payload) |
| http://localhost:9000/app | **админ за търговия** (Medusa) |
| http://localhost:9000/health | health check на backend-а |
| http://localhost:7700 | Meilisearch |
| http://localhost:9001 | MinIO конзола (S3 API на 9002) |

## Ръчно пускане, стъпка по стъпка

Ако `pnpm bootstrap` спре някъде, ето какво прави:

```bash
cp infra/.env.example            infra/.env
cp apps/backend/.env.example     apps/backend/.env
cp apps/storefront/.env.example  apps/storefront/.env

# истински тайни за локалната машина
openssl rand -base64 32   # → JWT_SECRET и COOKIE_SECRET в apps/backend/.env
openssl rand -base64 32   # → PAYLOAD_SECRET в apps/storefront/.env

pnpm infra:up                                    # postgres, valkey, meilisearch, minio
pnpm install
pnpm --filter @fabrizia/shared build             # backend и storefront внасят типовете оттук
pnpm --filter @fabrizia/backend migrate
pnpm --filter @fabrizia/storefront payload:migrate
pnpm seed
pnpm dev
```

## Команди

| Команда | Какво прави |
|---|---|
| `pnpm dev` | backend и витрина едновременно |
| `pnpm dev:backend` / `pnpm dev:storefront` | само едното |
| `pnpm build` | билдва shared, backend и витрината |
| `pnpm typecheck` | TypeScript през целия монорепо |
| `pnpm --filter @fabrizia/shared test` | тестове на споделения пакет |
| `pnpm infra:up` / `infra:down` / `infra:logs` | контейнерите |
| `pnpm infra:reset` | **изтрива и данните** в контейнерите |
| `pnpm db:migrate` | миграции и на двете бази |
| `pnpm seed` | демо каталог |
| `pnpm --filter @fabrizia/storefront generate:types` | пре-генерира `payload-types.ts` след промяна в колекция |
| `pnpm --filter @fabrizia/backend user -- -e ... -p ...` | администратор за Medusa |

След промяна в модел на Medusa модул:

```bash
cd apps/backend && npx medusa db:generate style_group && cd ../.. && pnpm --filter @fabrizia/backend migrate
```

След промяна в Payload колекция:

```bash
pnpm --filter @fabrizia/storefront generate:types
pnpm --filter @fabrizia/storefront payload:migrate:create <име>
pnpm --filter @fabrizia/storefront payload:migrate
```

## Структура

```
apps/backend        Medusa v2 — продукти, варианти, наличности, цени, поръчки
  src/modules/style-group   цветовете на един модел, групирани заедно
  src/links                 връзка StyleGroup ↔ Product (без чужд ключ)
  src/api/store             GET /store/style-groups/:code — цветовият суичър
  src/scripts/seed.ts       регион, склад, категории, демо каталог
apps/storefront     Next.js 15 + Payload CMS 3 в едно приложение
  src/app/(storefront)      витрината
  src/app/(payload)         админът за съдържание на /admin
  src/payload/collections   Pages, Themes, Menus, Media, Users
  src/payload/blocks        седемте блока на page builder-а
  src/lib                   клиент към Medusa, четене от CMS, тема
packages/shared     транслитерация, slug-ове, SKU схема, домейн типове
infra               docker-compose, init скриптове, bootstrap
docs                планът, ADR-001 и фиксираните версии
```

## Решения, които обясняват кода

Пълният контекст е в [docs/plan/05-architecture-decision.md](docs/plan/05-architecture-decision.md).
Накратко:

- **Едно продуктово ID = един модел в един цвят.** Размерите са варианти. Всеки
  цвят има собствен URL, собствена галерия и собствен ред във фийда към Google.
  Цветовете се групират през `StyleGroup`.
- **SKU: `FB-{модел}-{цвят}-{размер}`** — `FB-2601-BLK-S`. Не се променя след
  първата поръчка.
- **Две отделни бази** — `fabrizia_commerce` и `fabrizia_cms`. И двете системи
  управляват собствени миграции; споделен schema означава, че миграция на едното
  чупи другото. Връзката между тях е по handle, не по чужд ключ.
- **Наличността никога не влиза в статичния HTML.** Витрината се кешира, stock-ът
  се дозарежда клиентски през `/api/inventory`.
- **URL-ите са на латиница.** Кирилицата се транслитерира по Обтекаемата система
  (`рокля` → `roklya`), същата, която е в закона за транслитерацията.
- **Съдържанието не изисква deploy.** Публикуване в CMS-а инвалидира кеша веднага —
  проверено: смяна на банер се вижда за секунди, без rebuild и без рестарт.
- **Наличността има safety buffer.** Продажбите на едро се пишат ръчно и не намаляват бройките,
  затова `sellable = available − 2` и никой клиентски път не чете `available`. Буферът важи на
  ниво API, не като правило в компонент.
- **Само наложен платеж и само Еконт** за пускането. Карти и Спиди са фаза 2.
- **Само EUR.** BGN не се показва на клиента.
- **Нищо не се индексира**, докато `NEXT_PUBLIC_ALLOW_INDEXING` не стане `true`.
  Дотогава сайтът връща `X-Robots-Tag: noindex`.

## Версии

Всичко е фиксирано точно, без `^`. Списъкът и **причините зад ограниченията** са в
[docs/VERSIONS.md](docs/VERSIONS.md) — включително защо Next е на 15.4.11, а не на 15.5.

**Зависимостите са замразени от 28.08 до 10.09.** Само security patch с доказан CVE.

## Документация

| Документ | Съдържание |
|---|---|
| [05 · ADR-001](docs/plan/05-architecture-decision.md) | приетите технологии, окончателни решения, отворени въпроси със срокове |
| [06 · MVP обхват](docs/plan/06-mvp-scope-softlaunch.md) | какво влиза, какво не, какво е опасно да се бута преди launch |
| [07 · Backlog](docs/plan/07-backlog.md) | 14 епики, 144 задачи с ID и acceptance criteria |
| [08 · Входни данни](docs/plan/08-inputs-required.md) | какво трябва да предостави бизнесът и до кога |
| [09 · Стар сайт](docs/plan/09-legacy-prep-checklist.md) | чеклист за безопасно качване без ключове и лични данни |
| [VERSIONS](docs/VERSIONS.md) | фиксирани версии и ограниченията зад тях |

## Какво още го няма

Този скелет покрива каталога, продуктовата страница, съдържанието и админите.
Все още липсват: кошница, checkout, плащания, куриери, фактури, аналитика.
Всяко от тях е епика в [backlog-а](docs/plan/07-backlog.md).
