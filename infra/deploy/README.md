# Деплой

Един скрипт, две реалности. Не знаем още дали SuperHosting Managed VPS дава root и Docker,
затова деплоят **не предполага** — проверява и избира сам.

```bash
./infra/deploy/deploy.sh --check     # какво поддържа хостът, без да променя нищо
./infra/deploy/deploy.sh             # деплой по пътя, който работи
./infra/deploy/deploy.sh --path=native   # принудително без Docker
```

## Двата пътя

| | **Docker** | **Native (без Docker)** |
|---|---|---|
| Кога | хостът дава root и Docker | само root, без Docker |
| Инфраструктура | `docker-compose.prod.yml` | `provision-native.sh` — apt + бинарник на Meilisearch |
| Процеси | контейнери с `restart: always` | `systemd` units, или PM2 ако няма systemd |
| Рестарт при падане | Docker | `Restart=always`, `StartLimitBurst=0` |
| Рестарт при reboot | `restart: always` | `systemctl enable` |

И двата пътя вдигат едни и същи шест процеса: Next.js, Medusa, PostgreSQL, Redis/Valkey,
Meilisearch и фонов worker.

## Първо пускане на нов сървър

```bash
# 1. само ако няма Docker
sudo ./infra/deploy/provision-native.sh

# 2. конфигурация
cp infra/deploy/.env.backend.example    infra/deploy/.env.backend
cp infra/deploy/.env.storefront.example infra/deploy/.env.storefront
openssl rand -base64 32   # за всеки празен secret

# 3. деплой
./infra/deploy/deploy.sh
```

Nginx като reverse proxy към `:8000` (витрина) и `:9000` (админ), после `certbot`.
Нито един от двата порта не се публикува навън директно.

## Бекъпи

`provision-native.sh` включва **WAL архивиране**, не само нощен дъмп. Разликата: дъмпът губи
всичко от последното изпълнение насам; WAL позволява възстановяване до избрана минута.

Ако хостът предлага собствени managed бекъпи, попитай ги дали са PITR или само нощен дъмп,
преди да разчиташ на тях.

**Бекъп, който не е възстановяван, не е бекъп.** Възстанови в чиста база и си запиши времето,
преди да пуснеш реални поръчки.

## Трите въпроса към хостинг доставчика

1. Дава ли се **root достъп и Docker** на Managed VPS плана?
2. Какъв е SLA-то и **кой рестартира процес, паднал в 2 през нощта**?
3. Има ли **PITR** за PostgreSQL, или само нощен дъмп?

Ако отговорът на първия е „не“ — native пътят работи, но иска root. Ако и root няма,
хостът не може да носи този стек и трябва да се смени.

## Изисквания към машината

4 vCPU, 8 GB RAM (препоръчително 16), 80 GB NVMe. По-малко се справя с разработка, но не с реклами.
