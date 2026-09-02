# Обложки блога: как генерить и заливать

Рабочая инструкция для агента. Всё, что ниже, проверено на 67 обложках
(59 в батче 30.08.2026 + 8 добавленных позже).

Скрипт заливки: `scripts/covers-2026-08/upload-cover.mjs`.
Реестр мотивов: `scripts/covers-2026-08/_PROMPTS.md` — туда дописывается строка
на каждый новый пост.

---

## 1. Найти, у кого нет обложки

Поле называется `cover`, а ассет лежит в `cover.image.asset` — **не**
`coverImage` и не `cover.asset`. Ошибка в пути даёт «нет обложки ни у кого»,
что выглядит как настоящая находка. Проверяй путь, прежде чем верить результату.

```bash
cd ../code-site-solutions
node --input-type=commonjs -e "
const {createClient}=require('@sanity/client');
const c=createClient({projectId:'4lk0x7o9',dataset:'production',apiVersion:'2024-10-01',useCdn:false,perspective:'published'});
c.fetch('*[_type==\"blogPost\"]{\"slug\":slugs.uk.current,\"ref\":cover.image.asset._ref,\"a\":cover.alt.uk,\"b\":cover.alt.ru,\"e\":cover.alt.en}').then(r=>{
 console.log('без обложки:', r.filter(x=>!x.ref).map(x=>x.slug));
 console.log('без alt на 3 языках:', r.filter(x=>x.ref&&!(x.a&&x.b&&x.e)).map(x=>x.slug));
})"
```

---

## 2. Два правила, от которых не отступаем

**Никакого текста на изображении.** Одна обложка обслуживает uk, ru и en.
Любая надпись делает её пригодной только для одного языка. Две самые первые
картинки блога погорели именно на этом и были заменены.

**Арт-дирекция одна на все обложки.** Меняется только мотив. Иначе блог
превращается в свалку стилей. Не «улучшай» палитру под настроение статьи.

---

## 3. Промпт

Базовый блок копируется **дословно**, без переформулировок:

> Generate a wide 16:9 abstract editorial header image for a web studio blog article.
> Art direction, follow exactly: near-black background #0B0B0B, not grey and not navy.
> One violet light source around #7C4DD0 producing a soft radial bloom — depth must
> come from glow only, never from drop shadows. Thin luminous hairlines and a faint
> technical grid. Generous negative space, matte finish, very fine film grain.
> Absolutely no text, no letters, no numbers, no logos, no UI mockups, no people,
> no hands. Restrained Swiss editorial poster meets dark-mode product design.
> Calm, not busy. No lens flares, no chrome 3D, no neon cyberpunk cliches.

Фиолетовый — сознательное исключение из общего анти-слоп правила «никакого
violet». Это брендовый акцент сайта, см. память `site-types-design-language`.

### Строка кластера

Дальше ровно одна строка из двух — от неё зависит, будет картинка чистой
геометрией или узнаваемым предметом:

| Кластер | Строка |
|---|---|
| словарь терминов, SEO, цены, дизайн, процессы | `Keep it strictly abstract: pure geometry only, no recognisable real-world objects.` |
| **города**, ниши, медицина, магазины | `One recognisable subject rendered as a delicate luminous wireframe, everything around it abstract.` |

**Города — предметные.** Это неочевидно, потому что в реестре мотивов у городов
записаны абстрактные формулировки («dense cluster of luminous rings»), и по ним
легко решить, что города абстрактные. Смотри на результат, а не на мотив: у
Львова на обложке крыши и башни старого города, у Киева — круглая площадь
сверху. Если сделать город абстракцией, он выпадет из серии.

Самый дешёвый способ свериться — прочитать alt уже готовых обложек соседних
постов того же кластера: alt описывает, что реально на картинке.

### Мотив

Последняя строка промпта:

> **Focal motif: `<мотив>`**

Мотив должен быть про **тезис статьи**, а не про её тему. «Розробка сайту в
Дніпрі» — тема; «скорость решает больше, чем дизайн» — тезис, и именно он даёт
мотив «одна линия моста ярче и длиннее остальных».

---

## 4. Генерация в ChatGPT через браузер

Аккаунт владельца, вкладка `chatgpt.com`. Инструменты `claude-in-chrome`.

1. Клик по строке ввода, затем `type` промптом целиком, затем `Return`.
   Промпт длинный — это нормально, вставляется одним `type`.
2. Одна картинка ≈ 40–70 секунд. Ждать циклами `wait` по 5 секунд.
3. Готовность проверять **не по скриншоту**, а по DOM:

```js
const g = [...document.querySelectorAll('img')].filter(i => /^Generated image/i.test(i.alt || ''));
({ count: g.length, streaming: !!document.querySelector('[data-testid="stop-button"]') })
```

`count` — сколько картинок в чате всего. Для N-й картинки жди `count >= N`
**и** `streaming === false`. Без проверки `streaming` заберёшь недорисованную.

### Скачивание

**Не кликай по картинке.** Клик открывает редактор изображений, и дальше
промпты уходят в поле «Describe edits» вместо чата. Один раз скачивание через
UI редактора отдало вообще посторонний файл.

Рабочий способ — забрать блоб прямо со страницы и сразу задать имя файла:

```js
const g = [...document.querySelectorAll('img')].filter(i => /^Generated image/i.test(i.alt || ''));
const img = g[g.length - 1];
const b = await (await fetch(img.currentSrc || img.src)).blob();
const a = document.createElement('a');
a.href = URL.createObjectURL(b);
a.download = 'cover-<uk-slug>.png';
document.body.appendChild(a); a.click(); a.remove();
({ size: b.size, type: b.type });
```

Файл падает в `C:/Users/User/Downloads/cover-<uk-slug>.png`. Имя по слагу —
иначе в папке будет десяток `ChatGPT Image ….png` и перепутать их легко.

Chrome при серии скачиваний спрашивает разрешение на «несколько файлов» —
это разрешает владелец, руками.

`img.src` в результатах инструмента может быть отрезан как «BLOCKED:
Cookie/query string data» — это нормально, JS всё равно получает настоящий URL.

### Проверить, что картинка не пустая

Фон почти чёрный, и пустой кадр от нормального на глаз не отличить.

```python
from PIL import Image, ImageStat
im = Image.open(p).convert('RGB'); st = ImageStat.Stat(im)
print(im.size, [round(x) for x in st.mean], [round(x,1) for x in st.stddev])
```

Норма: размер ≈ 1672×941 (16:9), среднее около `[15, 10, 22]` — синий канал
выше красного, это и есть фиолетовый. `stddev` около нуля = пустой кадр,
перегенерировать.

Смотреть глазами всё равно нужно. Быстрее всего склеить контактный лист из
всех новых обложек в один PNG и открыть его одним `Read`.

---

## 5. Заливка

```bash
cd code-site-solutions-admin
node scripts/covers-2026-08/upload-cover.mjs \
  --file "C:/Users/User/Downloads/cover-<uk-slug>.png" \
  --post <uk-slug> \
  --alt-uk "…" --alt-ru "…" --alt-en "…"
```

`--dry` показывает степень сжатия и ничего не пишет. Скрипт сам жмёт в WebP
1600×900 (1.5–1.9 МБ → 14–80 КБ) и проставляет alt на трёх языках.

Токен берётся из `.env` — он зашифрован dotenvx, поэтому скрипт делает
`import "dotenv/config"`. Вытаскивать токен в переменную окружения руками
**не надо**: значение приходит невалидным и падает с `ERR_INVALID_CHAR`.

### Alt

Alt описывает, **что изображено**, и не повторяет заголовок статьи. Заголовок
уже стоит рядом в разметке; alt нужен тому, кто картинку не видит.

Плохо: «Розробка сайту в Одесі — ціни і терміни».
Хорошо: «Порт із довгими сходами та портовими кранами, над ними хвиляста
світлова смуга».

---

## 6. После заливки

- Перепроверить запросом из раздела 1: `без обложки: []` и `без alt: []`.
- Дописать строку мотива в `scripts/covers-2026-08/_PROMPTS.md`.
- Коммит не нужен: обложки живут в Sanity, а не в репозитории.
- Блог на ISR `revalidate = 300`. Первый запрос после TTL отдаёт **старое**
  и только запускает перегенерацию — чтобы увидеть новую обложку, нужны два
  запроса с паузой.

---

## 7. Грабли, коротко

| Симптом | Причина |
|---|---|
| «Нет обложки ни у одного поста» | путь `coverImage` вместо `cover.image.asset` |
| Промпт ушёл в «Describe edits» | кликнули по картинке и открыли редактор |
| Скачался чужой файл | скачивание через UI редактора, а не через блоб |
| `ERR_INVALID_CHAR` при заливке | токен вытащили из dotenvx-шифрованного `.env` руками |
| Картинка выпадает из серии | забыли строку кластера или переписали базовый блок |
| Обложка есть, на сайте старая | ISR: нужен второй запрос после TTL |
