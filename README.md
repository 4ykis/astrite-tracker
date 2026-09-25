# Astrite Tracker

Персональний трекер валюти Astrite (Wuthering Waves): щоденний баланс,
витрати на баннери, гача-лог 50/50 з піті-лічильником і статистика доходу.

## Стек

Next.js (App Router, TypeScript) · Prisma · PostgreSQL · Recharts · Tailwind CSS (тільки темна тема)

## Локальний запуск

1. Встановіть залежності:

   ```bash
   npm install
   ```

2. Скопіюйте `.env.example` у `.env` і заповніть значення:

   ```bash
   cp .env.example .env
   ```

   - `WUWA_PRISMA_DATABASE_URL` / `WUWA_DATABASE_URL` — рядки підключення
     до Postgres. Ці назви збігаються з тим, що Vercel Postgres (Neon)
     автоматично створює при підключенні бази до проєкту з префіксом
     `WUWA_`. Для локальної розробки вкажіть тут ваш локальний Postgres
     (однакове значення для обох підійде, якщо немає окремого
     pooled/direct URL).
   - `APP_PASSCODE` — код доступу до застосунку.
   - `SESSION_SECRET` — випадковий секрет для підпису cookie сесії
     (`openssl rand -base64 32`).

3. Застосуйте міграції Prisma:

   ```bash
   npx prisma migrate dev
   ```

4. Запустіть застосунок:

   ```bash
   npm run dev
   ```

   Відкрийте http://localhost:3000 і введіть `APP_PASSCODE`.

## Деплой на Vercel

1. У проєкті на Vercel: Storage → Create Database → Postgres, і підключіть
   її до проєкту. Vercel сам створить `WUWA_PRISMA_DATABASE_URL` і
   `WUWA_DATABASE_URL` (та кілька інших) — нічого копіювати вручну не треба.
2. Додайте власні env-змінні: `APP_PASSCODE`, `SESSION_SECRET`.
3. Задеплойте — команда `npm run build` автоматично виконає
   `prisma generate` (через `postinstall`) і `prisma migrate deploy`
   (перед `next build`), тож нові міграції накатуються на продакшн-базу
   самі при кожному деплої.

## Структура

- `/` — дашборд: введення поточного балансу, дохід за вчора, піті-лічильник, win-rate
- `/spending` — облік витрат astrite на баннери
- `/gacha` — гача-лог 50/50 з автоматичним піті-лічильником
- `/stats` — графіки доходу (день/тиждень/місяць/рік) і витрат за категорією

Формула доходу за період:

```
income(period) = (баланс_кінець - баланс_початок) + сума(витрати за period)
```
