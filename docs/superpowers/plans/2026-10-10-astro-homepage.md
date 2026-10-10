# Astro Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Статическая главная mvaleo.com на Astro по макету Figma Home (4:75).

**Architecture:** Astro без UI-фреймворков, CSS внутри компонентов, токены в `src/styles/tokens.css`, данные проектов в `src/data/projects.ts`, картинки из `src/assets` (копия `img/`) через `astro:assets`.

**Tech Stack:** Astro, TypeScript, plain CSS.

**Spec:** docs/superpowers/specs/2026-10-10-astro-homepage-design.md

## Global Constraints
- Без Tailwind и UI-библиотек.
- Dressy не переносим.
- Цвета: фон #000, BW_15 #262626, BW_10 #1a1919, W_50T rgba(255,255,255,.5), W_60T .6, W_80T .8.
- Шрифт Google Sans Flex: заголовок 64/64 Bold, подзаголовок 22 Medium, кнопка 14/26 Regular, меню 16/26 Medium.
- Контент макета: ширина 1376, зазор 16, радиус карточек 16; 2 больших карточки 680x560; маленькие 3 колонки.
- Адаптив: 3 колонки, до 900px 2, до 600px 1.

### Task 1: Каркас
Files: package.json, astro.config.mjs, tsconfig.json, src/layouts/Base.astro, src/styles/tokens.css, src/pages/index.astro, src/assets/ (копия img/).
- [ ] Установить astro, собрать пустую страницу, `npm run build` проходит.

### Task 2: Данные и карточка
Files: src/data/projects.ts, src/components/ProjectCard.astro.
- [ ] Список из 17 проектов (2 big + 15 small) со ссылками https://mvaleo.com/works/<slug>/.
- [ ] ProjectCard принимает `{ project, aspect }`.

### Task 3: Блоки страницы
Files: Header, HomeTitle, SeekingButton, BigThumbnails, SmallThumbnails, Footer (.astro).
- [ ] Собрать в index.astro, сверить с макетом.

### Task 4: Адаптив и проверка
- [ ] Проверка ширин 2048, 1440, 900, 390 в браузере, `npm run build`.
