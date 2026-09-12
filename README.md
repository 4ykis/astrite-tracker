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

   - `DATABASE_URL` / `DIRECT_URL` — рядок підключення до Postgres (Vercel
     Postgres, Supabase, Neon тощо). Якщо провайдер дає лише один URL,
     використайте однакове значення для обох.
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

1. Створіть Postgres-базу (Vercel Postgres, Supabase або будь-який інший
   провайдер) і скопіюйте connection string.
2. У налаштуваннях проєкту на Vercel додайте env-змінні з `.env.example`
   (`DATABASE_URL`, `DIRECT_URL`, `APP_PASSCODE`, `SESSION_SECRET`).
3. Задеплойте — команда `npm run build` автоматично виконає
   `prisma generate` (через `postinstall`).
4. Застосуйте міграції до продакшн-бази один раз (локально з продакшн
   `DATABASE_URL`/`DIRECT_URL` у `.env`, або через Vercel CLI):

   ```bash
   npx prisma migrate deploy
   ```

## Структура

- `/` — дашборд: введення поточного балансу, дохід за вчора, піті-лічильник, win-rate
- `/spending` — облік витрат astrite на баннери
- `/gacha` — гача-лог 50/50 з автоматичним піті-лічильником
- `/stats` — графіки доходу (день/тиждень/місяць/рік) і витрат за категорією

Формула доходу за період:

```
income(period) = (баланс_кінець - баланс_початок) + сума(витрати за period)
```
