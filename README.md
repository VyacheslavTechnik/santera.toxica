# Frontend (Next.js)

Учебное пространство с уроками по искусственному интеллекту. Проект построен на Next.js (App Router) с Tailwind CSS и адаптивным интерфейсом.

## Быстрый старт

```bash
npm install
npm run dev
```

- Dev сервер: `http://localhost:3000` (или свободный порт при занятости)
- Очистка кэша и запуск: `npm run dev:clean`

## Скрипты

- `npm run dev` — запуск dev сервера
- `npm run dev:clean` — очистка `.next` и запуск dev
- `npm run build` — сборка
- `npm run start` — запуск собранного приложения
- `npm run lint` — ESLint
 - `npm run typecheck` — проверка типов TypeScript

## Стек и особенности

- Next.js 16, App Router
- Tailwind CSS v4
- Шрифты: системный стек SF Pro, моно — JetBrains Mono
- Оптимизация изображений: `next/image`
 
## Настройки
 
- `next.config.ts`: `turbopack.root = __dirname` для корректного определения корня воркспейса и стабильных sourcemaps в dev.

## Структура

- `src/app/page.tsx` — главная страница
- `src/components/ui/logo.tsx` — компонент логотипа
- `src/components/ui/topic-button.tsx` — кнопки тем с описаниями
- `src/app/topic/[slug]/page.tsx` — страницы тем

## Требования

- Node.js 18+
- npm 9+

## Лицензия

MIT
