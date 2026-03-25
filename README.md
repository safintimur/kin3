# Family Tree MVP (Next.js + Supabase)

Простой MVP веб-приложения для семейного дерева: просмотр связей, добавление и редактирование родственников.

## Стек

- Next.js (App Router)
- TypeScript
- React + Tailwind CSS
- shadcn/ui-стиль UI-компонентов
- React Flow (pan/zoom карта семьи)
- Zustand (клиентское состояние)
- Supabase/Postgres (опционально)

## Быстрый старт

```bash
npm install
npm run dev
```

Открыть: `http://localhost:3000`

## Настройка Supabase (опционально)

Если переменные не заданы, приложение автоматически работает на демо-данных в браузере.

Создайте `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Примените схему из `sql/schema.sql` в вашем проекте Supabase.

## Что есть в MVP

- Основной экран: левый сайдбар + canvas дерева + правая панель деталей
- Просмотр дерева через React Flow (pan/zoom, MiniMap, связи)
- Карточки персон с именем и годами жизни
- Выбор человека и просмотр полной информации
- Добавление/редактирование/удаление человека
- Добавление родителя/ребёнка/партнёра из правой панели
- Поиск по людям
- Адаптивная компоновка для мобильных/десктопа

## Структура

- `app` — страницы и layout
- `components` — UI и layout-компоненты
- `features` — доменные блоки (tree/person)
- `lib` — утилиты, репозиторий данных, mock/supabase
- `store` — Zustand store
- `types` — типы домена
- `sql` — схема БД

## Команды

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```
