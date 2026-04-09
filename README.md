# Okoshkin Site (MVP)

Текущая реализация включает:
- лендинг `/ru` и `/uk`;
- калькулятор с отправкой заявки;
- базовую админ-зону с безопасным входом (NextAuth Credentials + bcrypt + rate limit);
- Prisma-модели и API-роуты для дальнейшего развития.

## 1. Установка
```bash
npm install
```

## 2. Настройка окружения
1. Скопируйте `.env.example` в `.env`.
2. Заполните:
- `DATABASE_URL` — строка Supabase PostgreSQL.
- `NEXTAUTH_SECRET` — длинный случайный секрет.
- `NEXTAUTH_URL` — например `http://localhost:3000`.
- `ADMIN_EMAIL` и `ADMIN_PASSWORD` — данные первого администратора.
- `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` — опционально для уведомлений.

## 3. Prisma и база данных
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

В проект добавлена стартовая миграция:
- `prisma/migrations/0001_init/migration.sql`

## 4. Создание администратора
```bash
npm run admin:create
```

Скрипт:
- создает админа, если его нет;
- или обновляет пароль, если email уже существует.

## 5. Запуск
```bash
npm run dev
```

## 6. Маршруты
- `/{locale}` — лендинг (`/ru`, `/uk`)
- `/{locale}/calculator` — калькулятор
- `/{locale}/admin` — вход/панель администратора
- `/api/leads` — прием заявок
- `/api/comments` — заглушка под модуль отзывов

## 7. Что уже реализовано по админке
- проверка логина/пароля через Prisma;
- хранение пароля только в виде bcrypt-хэша;
- ограничение попыток входа по IP (in-memory rate limit);
- серверная проверка сессии для страницы `/admin`.

## 8. Следующие шаги
- модерация отзывов в админке;
- управление галереей (добавить/изменить/удалить);
- изменение опций калькулятора из БД;
- подключение облачного хранилища для фото (Cloudinary/S3).
