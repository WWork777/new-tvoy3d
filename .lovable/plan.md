# План: Премиальный сайт компании 3D-печати

## Бренд и палитра

- **Акцент**: `#db1125` (фирменный красный) — CTA, glow, hover-подсветка, линии grid
- **Фон**: глубокий чёрный `oklch(0.08 0 0)` с лёгким warm shift
- **Текст**: белый / off-white, muted серый для подзаголовков
- **Логотип**: красная hex-сфера (buckyball) — используем как 3D-объект в hero и как favicon
- **Glassmorphism**: полупрозрачные панели `rgba(255,255,255,0.04)` + backdrop-blur + красная подсветка по границе
- Все токены — в `src/styles.css` через `@theme inline` (oklch)

## Стек технологий

- TanStack Start (уже настроен)
- **Three.js + @react-three/fiber + @react-three/drei** — 3D hero (buckyball + частицы + mouse-follow)
- **framer-motion** — scroll/reveal/parallax/cinematic переходы
- **lenis** — smooth scrolling
- Tailwind v4 + shadcn компоненты (минимально, кастомизированные)

## Структура маршрутов

Один длинный landing — все 9 секций на `/` (соответствует ТЗ — single immersive scroll experience). Отдельные роуты создавать не нужно, но добавим SEO-метаданные в `head()`.

```
src/routes/
  index.tsx              — главная (композиция секций)
src/components/sections/
  Hero.tsx               — 3D hero
  Services.tsx           — 7 услуг
  Portfolio.tsx          — masonry + filter + lightbox
  Process.tsx            — futuristic timeline (6 этапов)
  Materials.tsx          — 6 интерактивных карточек
  WhyUs.tsx              — animated counters
  Testimonials.tsx       — floating cards карусель
  FinalCTA.tsx
  Footer.tsx
src/components/three/
  HeroScene.tsx          — Canvas + Buckyball + Particles + Lighting
  Buckyball.tsx          — анимированная hex-сфера (бренд)
src/components/ui/
  Navbar.tsx             — sticky glass nav
  GlowButton.tsx         — премиум CTA с красным glow
  GridBackground.tsx     — animated mesh/grid
  Reveal.tsx             — wrapper для scroll reveal
src/hooks/
  useMousePosition.ts
  useSmoothScroll.ts     — lenis init
```

## Ключевые визуальные элементы

**Hero**
- Полноэкранный `<Canvas>` с вращающейся wireframe hex-сферой (логотип в 3D), instanced particles, красный rim light, mouse-parallax камеры
- Поверх: layered glass card с заголовком, плавный fade-in по словам
- Animated mesh-grid на фоне (SVG + CSS-анимация линий), радиальный красный glow снизу
- Floating UI-чипы ("FDM · SLA · Industrial") с легкой левитацией

**Cinematic UI повсюду**
- Glass-панели с тонкой красной 1px границей + inset glow
- Reveal-анимации (clip-path + translateY) на scroll
- 3D hover на карточках услуг/материалов (`rotateX/Y` по позиции курсора, depth shadow)
- Анимированные счётчики (intersection observer)
- Cinematic переходы между секциями (parallax background layers)

**Portfolio**
- Masonry grid, hover zoom + красный overlay, фильтрация по категориям с layout animation, fullscreen lightbox

**Process**
- Вертикальный/горизонтальный timeline с движущимся красным glow по линии при scroll, 6 этапов в glass-капсулах

**Materials**
- 6 карточек (PLA/PETG/ABS/Resin/Nylon/Carbon Fiber) с reveal-текстурой материала при hover, animated property bars

## Изображения

- AI-генерация для портфолио (6–8 кейсов 3D-печати: industrial prototype, jewelry resin, automotive part, architectural model, custom figurine, carbon fiber drone part) — `premium` quality
- Текстуры материалов — генерация
- Логотип-сфера — копируем в `src/assets/logo.png` для nav и favicon
- 3D-модель buckyball — генерируем процедурно в Three.js (icosahedron + wireframe), цвет `#db1125`

## Контент (RU, плейсхолдеры)

Реалистичные русскоязычные тексты для всех секций, демо-метрики (1200+ проектов, 50 000+ часов печати, 18 принтеров, 98% довольных клиентов), 3 отзыва, кейсы с описанием материала/срока.

## CTA → форма заявки

"Рассчитать стоимость" открывает modal с шагами: тип услуги → материал → объём/файл → контакт. Без бэкенда (toast "Заявка отправлена"), задел под Cloud позже.

## Адаптивность

- Mobile-first проверка: 3D-сцена с пониженным DPR на mobile, masonry → 1 колонка, timeline → вертикальный
- Touch-friendly hover-альтернативы
- `prefers-reduced-motion` отключает heavy анимации

## Технические детали

- `bun add three @react-three/fiber @react-three/drei framer-motion lenis` (все совместимы с Vite/edge SSR при динамическом импорте Canvas)
- Three.js Canvas рендерится client-only через `useEffect` mount-флаг чтобы не падал SSR
- SEO: `head()` на index — title, description, og:image (рендер hero), JSON-LD `LocalBusiness`
- Шрифты: **Space Grotesk** (heading) + **Inter** (body) — premium tech vibe; цифры через `tabular-nums`

## Порядок реализации

1. Токены дизайн-системы + базовые UI primitives (Navbar, GlowButton, GridBackground, Reveal)
2. Three.js hero scene (Buckyball + particles + lights)
3. Index композиция + smooth scroll (Lenis)
4. Секции по порядку: Services → Portfolio → Process → Materials → WhyUs → Testimonials → FinalCTA → Footer
5. Modal-калькулятор заявки
6. Генерация изображений портфолио/материалов
7. QA: mobile viewport, reduced-motion, Lighthouse

Готов реализовать — нажмите Approve.