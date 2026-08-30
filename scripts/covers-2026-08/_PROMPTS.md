# Обложки блога — промпты для генерации

**Статус: сделано 30.08.2026 — обложки есть у всех 59 постов.**

59 постов, из них 57 с украинскими слагами и 2 только на английском
(`web-design-for-accountants`, `websites-for-solicitors`).
На 30.08.2026 обложек нет ни у одного: две существовавшие (`vartist-rozrobky-saytu-2026`,
`tilda-vs-kastomnyy-sayt-2026`) были старыми картинками с текстом, вшитым прямо в
изображение, и подлежат замене.

Генерим в ChatGPT (аккаунт владельца), скачиваем, заливаем через
`upload-cover.mjs` — он сам жмёт в WebP 1600px (обычно 1.8 МБ → ~30 КБ, картинки
почти плоские и сжимаются отлично) и проставляет alt на трёх языках.

## Два правила, от которых не отступаем

**Никакого текста на изображении.** Одна обложка обслуживает uk, ru и en. Любая
надпись сразу делает её пригодной только для одного языка — именно на этом
и погорели две старые картинки.

**Общая арт-дирекция одна на все 59.** Меняется только мотив. Иначе получится
не блог, а свалка разных стилей.

## Общий блок промпта (копировать без изменений)

> Generate a wide 16:9 abstract editorial header image for a web studio blog article.
> Art direction, follow exactly: near-black background #0B0B0B, not grey and not navy.
> One violet light source around #7C4DD0 producing a soft radial bloom — depth must
> come from glow only, never from drop shadows. Thin luminous hairlines and a faint
> technical grid. Generous negative space, matte finish, very fine film grain.
> Absolutely no text, no letters, no numbers, no logos, no UI mockups, no people,
> no hands. Restrained Swiss editorial poster meets dark-mode product design.
> Calm, not busy. No lens flares, no chrome 3D, no neon cyberpunk cliches.
> **Focal motif: `<мотив из таблицы>`**

Фиолетовый — сознательное исключение из анти-слоп правила «никакого violet»:
это брендовый акцент всего сайта, см. `site-types-design-language` в памяти.

## Мотивы

### Словарь терминов

| Слаг | Focal motif |
|---|---|
| `shcho-take-api` | two separate geometric systems joined by a single luminous bridge, data passing across it as dashes |
| `shcho-take-cms` | a stack of identical content blocks with one being lifted and rearranged by an invisible hand |
| `shcho-take-core-web-vitals` | three vertical light gauges of different heights, one clearly falling short of a threshold line |
| `shcho-take-cta` | many faint parallel paths converging into one bright decisive arrow-like form |
| `shcho-take-domen` | a single luminous address plate anchoring a web of thin radiating connection lines |
| `shcho-take-favicon` | one very small bright square holding its own against a vast dark field, magnified by concentric rings |
| `shcho-take-hosting` | a horizontal server-like slab of stacked light bars, a building resting on it as a silhouette of lines |
| `shcho-take-lending` | one single tall vertical panel, isolated and lit, where a multi-panel grid would normally be |
| `shcho-take-seo` | a magnifier-like circular lens over a field of ranked horizontal bars, top ones brighter |
| `shcho-take-yuzabiliti` | a path through a geometric maze, the shortest route glowing, dead ends left dark |

### Города

| Слаг | Focal motif |
|---|---|
| `rozrobka-saitu-lviv` | dense cluster of overlapping luminous rings, crowded and competitive, centre hard to reach |
| `rozrobka-saitu-kyiv` | one large radial hub with many spokes of very different thicknesses fanning out |
| `rozrobka-saitu-vinnytsia` | a wide sparse field with one lone bright marker and a lot of unclaimed dark space |

### Цены и выбор подрядчика

| Слаг | Focal motif |
|---|---|
| `vartist-rozrobky-saytu-2026` | measured segments of very different lengths aligned to a single baseline |
| `shcho-vkhodyt-u-vartist-rozrobky-saitu` | stacked layers rising as steps |
| `skilky-koshtuye-sait-dlia-kliniky-2026` | a medical cross dissolving into a column of price-tier bars |
| `prosuvannia-saitu-tsina-2026` | a slow ascending curve climbing across months marked as faint vertical ticks |
| `tilda-vs-kastomnyy-sayt-2026` | one rigid prefabricated block beside one freely assembled structure of the same volume |
| `nextjs-proty-wordpress-ta-konstruktoriv` | three parallel columns of differing internal density, the lightest one glowing brightest |

### SEO и техника

| Слаг | Focal motif |
|---|---|
| `seo-audyt-svoimy-rukamy` | a checklist rendered as a column of small geometric marks, some lit, some unlit |
| `seo-dlia-medychnykh-saitiv` | a district map abstraction with one glowing catchment area around a cross-shaped node |
| `lokalne-seo-top-3-google-maps` | three luminous map pins on a podium of unequal heights |
| `lokalni-storinky-chy-dorveii` | a row of near-identical panels, the copies fading into flatness away from the original |
| `geo-seo-dlia-ukrainskoho-biznesu` | concentric coverage rings expanding from one bright point across a subtle grid |
| `biznes-u-kilkokh-mistakh-storinky` | several bright nodes connected by hairlines, each with its own small halo |
| `yak-chytaty-google-search-console` | a dashboard abstraction: one line chart, one bar column, one sparkline, all hairline-thin |
| `ai-poshuk-yak-potrapyty-u-vidpovidi` | a question-shaped void being filled by converging beams of light from many sources |
| `redyzain-bez-vtraty-seo` | an old structure dissolving into a new one while a continuous line runs unbroken through both |
| `shvydkist-medychnoho-saitu` | a timeline of light where each passing second visibly dims the signal |
| `yak-pratsyuye-admin-panel-saytu` | a control surface of sliders and toggles reduced to pure luminous geometry |

### Дизайн

| Слаг | Focal motif |
|---|---|
| `9-dyzain-pryiomiv-dlia-konversii` | a funnel of narrowing luminous bands with measurable widths |
| `trendy-veb-dyzainu-2026` | fashionable ornate forms fading out while one plain geometric form stays sharp |
| `temna-chy-svitla-tema-saitu` | a single vertical seam splitting the frame into deep dark and soft light |
| `ukrainskyi-biznes-za-kordonom` | two coordinate grids at different scales overlapping and aligning at one point |

### Медицина

| Слаг | Focal motif |
|---|---|
| `15-pomylok-na-saitakh-klinik` | a grid of small squares where several are conspicuously missing or misaligned |
| `dyzain-saitu-medychnoho-tsentru` | a calm symmetrical composition built around a soft cross-shaped negative space |
| `rozrobka-saitu-medychnoho-tsentru-pid-kliuch` | four sequential luminous phases along a horizontal timeline |
| `sait-dlia-likarni-vs-pryvatnyi-kabinet` | one very large structure beside one very small one, both lit with equal care |

### Магазины

| Слаг | Focal motif |
|---|---|
| `internet-mahazyn-odiahu` | a rail of hanging rectangular forms, one pulled forward into the light |
| `internet-mahazyn-kosmetyky` | soft concentric gradients suggesting a droplet, cool and clinical rather than glossy |
| `internet-mahazyn-avtozapchastyn` | interlocking mechanical geometry, one part isolated and highlighted from an exploded view |

### Ниши

| Слаг | Focal motif |
|---|---|
| `sait-dlia-advokata` | perfectly balanced horizontal beam resting on a single luminous fulcrum |
| `sait-dlia-ahentsii-nerukhomosti` | a grid of building-like blocks with filter-style bands narrowing the selection |
| `sait-dlia-avtoservisu` | a circular gauge with a lifted platform silhouette beneath it |
| `sait-dlia-budivelnoi-kompanii-2026` | scaffolding hairlines rising around a solid glowing volume |
| `sait-dlia-bukhhalterskykh-posluh` | neat repeating rows of ledger-like bands, one row subtly brighter |
| `sait-dlia-fitnes-klubu` | a weekly grid where certain slots pulse brighter than the rest |
| `sait-dlia-fotohrafa` | a frame within a frame within a frame, receding into glow |
| `sait-dlia-hotelyu-z-bronyuvannyam` | a calendar grid where a contiguous run of nights lights up |
| `sait-dlia-kondytera` | soft stacked discs of decreasing size, delicate rather than sugary |
| `sait-dlia-meblevoi-kompanii` | flat geometric planes assembling into a volumetric form |
| `sait-dlia-psykholoha` | two facing curved forms meeting in a soft protected space between them |
| `sait-dlia-restoranu-kafe-dostavky` | a route line from a lit interior point to a distant marker |
| `sait-dlia-salonu-krasy` | an elegant single continuous curve enclosing a calm reserved space |
| `sait-dlia-shkoly` | ascending steps of light with a wide open horizon beyond them |
| `sait-dlia-turahentstva` | a great-circle arc across a sparse coordinate field between two lit points |
| `sait-dlia-vantazhoperevezen` | a routed path through waypoints, cargo shown as uniform luminous blocks |

## Порядок работы

1. Промпт в ChatGPT → дождаться картинки → открыть её (клик по иконке на карточке)
   → скачать (иконка вверху справа).
2. Файл падает в `C:/Users/User/Downloads/ChatGPT Image ….png`.
3. Залить:

```
SANITY_WRITE_TOKEN=… node scripts/covers-2026-08/upload-cover.mjs \
  --file "<путь>" --post <uk-slug> \
  --alt-uk "…" --alt-ru "…" --alt-en "…"
```

Alt описывает, что на картинке, а не повторяет заголовок статьи — это разная
работа: заголовок уже есть рядом в разметке, alt нужен тем, кто картинку не видит.

## Что вышло

Стиль разведён по кластерам — так решил владелец, посмотрев первые две пробы:

- **словарь, SEO, цены, дизайн — строгая абстракция.** В промпт добавляется строка
  «Keep it strictly abstract: pure geometry only, no recognisable real-world objects».
- **города, ниши, медицина, магазины — предметные образы.** Вместо неё идёт
  «One recognisable subject rendered as a delicate luminous wireframe, everything
  around it abstract».

Остальной блок арт-дирекции одинаковый во всех 59 промптах — это и держит серию.

Технически: все обложки 1600×900 WebP, alt на трёх языках у всех 59.
Исходники ChatGPT весят 1.2–2.1 МБ, после сжатия — 26–314 КБ.

Скачивание через UI редактора картинок один раз отдало посторонний файл, поэтому
рабочий способ другой: забирать блоб прямо со страницы с нужным именем файла.
В консоли вкладки ChatGPT:

```js
const g = [...document.querySelectorAll('img')].filter(i => /^Generated image:/.test(i.alt || ''));
const img = g[g.length - 1];
const b = await (await fetch(img.currentSrc || img.src)).blob();
const a = document.createElement('a');
a.href = URL.createObjectURL(b);
a.download = 'cover-<slug>.png';
a.click();
```
