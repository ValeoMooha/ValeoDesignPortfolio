# Портфолио Valeo: главная страница на Astro

Дата: 2026-10-10. Статус: на проверке у Valeo.

## Цель
Перенести портфолио www.mvaleo.com с WordPress на Astro. Первый этап: только главная страница по макету Figma, локально. Остальные страницы позже.

## Источники
- Макет: Figma, файл Folio (production), фрейм Home (node 4:75), десктоп 2048px.
- Живой сайт: www.mvaleo.com (ссылки на кейсы, тексты, соцсети).
- Ассеты: `img/`, имена файлов соответствуют слоям Figma (17 превью проектов + AvatarValeoGIF.gif).

## Решения
- Фреймворк: Astro, статическая сборка. Стили: обычный CSS в компонентах плюс CSS-переменные (`src/styles/tokens.css`). Без Tailwind и UI-библиотек.
- Без шаблонов, проект с нуля.
- Карточки ведут на существующие страницы кейсов на mvaleo.com, пока свои не перенесены.
- Dressy есть на живом сайте, но отсутствует в макете: не переносим.
- Адаптив: макета нет, поведение придумываем сами, Valeo правит по ходу.

## Компоненты (один Figma-инстанс = один Astro-компонент)
| Figma | Astro |
|---|---|
| Header | Header.astro (аватар-гиф, меню Work / Tools / About, кнопка Contact) |
| Home main title | HomeTitle.astro |
| Home main subtitle | часть HomeTitle.astro |
| seeking_button | SeekingButton.astro |
| Big_thumbnails_block | BigThumbnails.astro (2 карточки) |
| small_thumbnails_block | SmallThumbnails.astro (15 карточек) |
| Footer | Footer.astro (Instagram, Telegram, WhatsApp, LinkedIn, Dribbble, Contact) |
| — | ProjectCard.astro (общая карточка), Base.astro (layout) |

Данные проектов: `src/data/projects.ts` (название, файл картинки, ссылка, размер big/small). Новый проект добавляется одной записью.

## Структура
```
img/  src/{components,data,layouts,pages/index.astro,styles/tokens.css}  astro.config.mjs
```
Картинки подключаются через встроенную оптимизацию Astro (`astro:assets`).

## Адаптив
Сетка: 3 колонки на десктопе, 2 до ~900px, 1 до ~600px. Большие карточки на узких экранах тоже в колонку. Заголовок и отступы через `clamp()`. Шапка на телефоне компактная. Контент центрирован, с максимальной шириной как в макете.

## Поведение
Лёгкий hover на карточках, видимый focus для клавиатуры, alt-тексты, семантическая разметка. Анимации минимальны.

## Деплой (поэтапно)
1. Локально: `npm run dev`.
2. GitHub-репозиторий (ValeoMooha/ValeoDesignPortfolio) и Cloudflare Pages (бесплатный тариф), тестовый субдомен.
3. После одобрения: переключение основного домена с WordPress на Cloudflare Pages. WordPress остаётся нетронутым до переключения, откат возможен. Где держать DNS (Hostinger или Cloudflare) решаем на этом этапе.

## Открыто на этап реализации
- Точные токены (цвета, шрифты, отступы) берём из Figma через get_design_context.
- Список ссылок на кейсы берём с живого сайта.
- Целевая ссылка кнопки Contact: пока mvaleo.com/contact.

## Проверка
Сборка `npm run build` без ошибок, визуальное сравнение со скриншотом Figma на 2048px, проверка на 1440, 900 и 390px.
