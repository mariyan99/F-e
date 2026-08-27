# Fabrizia — ново e-commerce приложение

Преизграждане на fabriziafashion.bg: модерен headless магазин за дамска мода.
Старият PHP сайт не се доразвива — използва се само като източник за анализ и миграция.

**Soft launch: 10.09.2026** (ограничен обхват) · **Пълен launch: октомври 2026**

## Документация

### За изпълнение
| Документ | Съдържание |
|---|---|
| [05 · Архитектурно решение](docs/plan/05-architecture-decision.md) | ADR-001: приети технологии, версии за pin-ване, окончателни решения, отворени въпроси със срокове |
| [06 · MVP обхват](docs/plan/06-mvp-scope-softlaunch.md) | Какво влиза, какво не, какво само ако има време, какво е опасно да се бута преди launch |
| [07 · Backlog](docs/plan/07-backlog.md) | 14 епики, 144 задачи с ID, acceptance criteria, зависимости и риск |
| [08 · Какво ми трябва от теб](docs/plan/08-inputs-required.md) | Файлове, достъпи, бизнес решения, информация от счетоводител, куриери и платежен доставчик |
| [09 · Подготовка на стария сайт](docs/plan/09-legacy-prep-checklist.md) | Чеклист с команди: какво да се копира, какво да се махне, как да не изтекат ключове и лични данни |
| [10 · Следващият промпт](docs/plan/10-next-prompt.md) | Точният текст, който да ми изпратиш |

### Обосновка (справочно)
| Документ | Съдържание |
|---|---|
| [01 · Стратегия и архитектура](docs/plan/01-strategy-and-architecture.md) | Сравнение на Medusa / Saleor / Laravel / NestJS / Vendure и защо е избран Medusa |
| [02 · Първоначален план по дни](docs/plan/02-mvp-scope-and-timeline.md) | План ден по ден до 10.09, рискове, фаза 2 |
| [03](docs/plan/03-next-prompt.md) · [04](docs/plan/04-legacy-audit-request.md) | Заменени съответно от 10 и 09 |

## Приет стек

```
Commerce core     Medusa v2 (Node 22 LTS, TypeScript strict)
База              PostgreSQL 16 — две отделни бази: commerce и cms
Кеш / опашки      Redis 7.2 (Valkey)
Търсене           Meilisearch 1.x
CMS / съдържание  Payload CMS 3, вътре в storefront приложението
Storefront        Next.js 15 App Router + React 19 + Tailwind CSS 4
Медия             Cloudflare R2 + image CDN
Хостинг           Vercel (storefront) + Hetzner EU-Central (backend)
Наблюдение        Sentry + uptime monitor
```

Всички версии се фиксират точно (без `^`) при инициализация и се записват в `docs/VERSIONS.md`.
**Замразяване на зависимостите от 28.08 до 10.09.**

## Статус

Планиране приключено, чака решения. Няма написан код.

**Блокира стартирането:**
- решения O-1 до O-10 ([05](docs/plan/05-architecture-decision.md#5-отворени-решения--със-срок))
- папката на стария сайт ([09](docs/plan/09-legacy-prep-checklist.md))
- push достъп до GitHub repo-то (в момента 403)
