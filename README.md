# Kin3

Легковесный сервис семейного дерева на Next.js и Supabase.

## Стек

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- React Flow для canvas дерева
- Zustand для UI-состояния
- Supabase Auth + Postgres для общей базы

## Локальный запуск

```bash
nvm use
npm install
npm run dev
```

Открыть: `http://localhost:3000`.

Без Supabase env приложение не запускает рабочий интерфейс.

## Supabase

1. Создайте проект в Supabase.
2. Примените миграции:

```bash
supabase link --project-ref <project-ref>
npm run db:push
```

3. Добавьте env vars в `.env.local` и в Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Для приватного доступа пригласите членов семьи через Supabase Auth и отключите публичный signup в настройках Supabase.

Для локальной проверки magic link должен возвращать на текущий `localhost`. Даже если в env задан production `NEXT_PUBLIC_SITE_URL`, приложение на `localhost` использует `window.location.origin` для Supabase redirect.

## Прод

1. В Vercel/хостинге укажите Node.js 20+.
2. Добавьте переменные окружения из `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_SITE_URL=https://kin3-five.vercel.app
```

3. В Supabase примените миграции:

```bash
supabase link --project-ref <project-ref>
npm run db:push
```

4. В Supabase Auth:
- включите email magic links;
- установите Site URL в `https://kin3-five.vercel.app`;
- добавьте `https://kin3-five.vercel.app`, `https://kin3-five.vercel.app/**`, `http://localhost:3000` и `http://localhost:3000/**` в redirect URLs;
- если локально используете другой порт, добавьте и его, например `http://localhost:3001` и `http://localhost:3001/**`;
- проверьте, что Magic Link template использует `{{ .ConfirmationURL }}` или `{{ .RedirectTo }}`, а не старый Vercel preview-домен;
- для приватного дерева отключите публичный signup и пригласите нужные email.

Без Supabase env прод соберётся, но покажет ошибку конфигурации вместо рабочего интерфейса.

## Команды

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run db:push
```

## Структура

- `app` - страницы и layout
- `components` - UI, auth и layout-компоненты
- `features` - доменные блоки дерева и формы человека
- `lib` - Supabase client и репозиторий данных
- `store` - Zustand store
- `types` - типы домена
- `supabase/migrations` - миграции БД
