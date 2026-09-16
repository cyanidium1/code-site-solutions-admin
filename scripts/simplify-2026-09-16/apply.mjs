// Simplification plan 2026-09-16 — CMS half.
// code-site-solutions/docs/simplification-plan-2026-09-16.md, stage 0 + §6.
//
//   node scripts/simplify-2026-09-16/apply.mjs --dry-run   # prints what changes
//   node scripts/simplify-2026-09-16/apply.mjs             # backs up touched docs, one transaction
//
// A. One set of NBYG numbers everywhere. Source of truth is the case study:
//    3 enquiries a month before (WordPress 2018), 300+ in the first year
//    (≈24 a month, ×8), 1 100 Google clicks in six months against 677 before,
//    302 000 impressions. "×6 organic traffic", "×4.8", "3–5 a month",
//    "Top-1" and "LCP 0.8s" on the renovation page had no source and
//    contradicted each other (1 100 vs 677 is ×1.6, not ×6).
// B. Water in the GSC / analytics blocks (renovation page + NBYG case):
//    90 words explaining that more impressions mean more clicks → one line.
// C. English left in uk/ru pricing plan bullets.
import { randomUUID } from "node:crypto";
import { client, backup } from "./lib.mjs";

const DRY = process.argv.includes("--dry-run");
const k = () => randomUUID().replace(/-/g, "").slice(0, 12);
const block = (text) => [
  { _type: "block", _key: k(), style: "normal", markDefs: [], children: [{ _type: "span", _key: k(), text, marks: [] }] },
];

const RENOVATION_ID = "lOTgaDd8FU4wgJ8F4KCHn9";
const NBYG_CASE_ID = "lOTgaDd8FU4wgJ8F4K9wE8";
const NBYG_TESTIMONIAL_ID = "DHIwRDN3sEoI638qoYQ1Yx";
const PLAN_CUSTOM_ID = "DHIwRDN3sEoI638qoYRuPt";
const PLAN_CORPORATE_ID = "lOTgaDd8FU4wgJ8F4KCFIY";

const GSC_TEXT = {
  uk: "1 100 переходів з Google за пів року — за попередні пів року було 677. Сайт показувався в пошуку 302 000 разів.",
  ru: "1 100 переходов из Google за полгода — за предыдущие полгода было 677. Сайт показывался в поиске 302 000 раз.",
  en: "1,100 clicks from Google in six months, up from 677 in the six months before. The site appeared in search 302,000 times.",
};
const ACTIONS_TEXT = {
  uk: "За рік відвідувачі 166 разів натиснули «Contact us» і 50 разів відправили форму заявки.",
  ru: "За год посетители 166 раз нажали «Contact us» и 50 раз отправили форму заявки.",
  en: "In a year, visitors clicked “Contact us” 166 times and sent the enquiry form 50 times.",
};
const ACTIONS_LEAD = {
  uk: "За 360 днів на сайті:",
  ru: "За 360 дней на сайте:",
  en: "Over 360 days on the site:",
};

const l3 = (uk, ru, en) => ({ uk, ru, en });

async function main() {
  const [renovation, nbyg, testimonial, planCustom, planCorporate] = await Promise.all(
    [RENOVATION_ID, NBYG_CASE_ID, NBYG_TESTIMONIAL_ID, PLAN_CUSTOM_ID, PLAN_CORPORATE_ID].map((id) =>
      client.getDocument(id),
    ),
  );
  for (const [name, d] of Object.entries({ renovation, nbyg, testimonial, planCustom, planCorporate })) {
    if (!d) throw new Error(`missing ${name}`);
  }
  const tx = client.transaction();
  const log = [];

  // ── A/B: renovation industry page
  {
    const set = {};
    const stats = renovation.hero.stats;
    const st2 = stats.findIndex((s) => s._key === "st2");
    if (st2 > -1) {
      set[`hero.stats[_key=="st2"].value`] = l3("300+", "300+", "300+");
      set[`hero.stats[_key=="st2"].label`] = l3("заявок за перший рік", "заявок за первый год", "enquiries in year one");
      log.push("renovation hero stat ×6 → 300+ enquiries in year one");
    }
    const sections = renovation.sections;
    const caseSec = sections.find((s) => s._type === "caseBlock");
    if (caseSec) {
      const p = `sections[_key=="${caseSec._key}"]`;
      set[`${p}.results`] = [
        { _key: k(), value: l3("×8", "×8", "×8"), label: l3("заявок: було 3 на місяць, стало 24", "заявок: было 3 в месяц, стало 24", "enquiries: from 3 a month to 24"), tag: l3("", "", "") },
        { _key: k(), value: l3("300+", "300+", "300+"), label: l3("заявок за перший рік", "заявок за первый год", "enquiries in the first year"), tag: l3("", "", "") },
        { _key: k(), value: l3("1 100", "1 100", "1,100"), label: l3("переходів з Google за 6 місяців (було 677)", "переходов из Google за 6 месяцев (было 677)", "Google clicks in 6 months (was 677)"), tag: l3("", "", "") },
        { _key: k(), value: l3("302 000", "302 000", "302,000"), label: l3("показів у Google за 6 місяців", "показов в Google за 6 месяцев", "Google impressions in 6 months"), tag: l3("", "", "") },
      ];
      set[`${p}.after.foot`] = l3("**Результат:** 24 заявки на місяць замість 3.", "**Результат:** 24 заявки в месяц вместо 3.", "**Result:** 24 enquiries a month instead of 3.");
      set[`${p}.before.foot`] = l3("**Результат:** 3 заявки на місяць.", "**Результат:** 3 заявки в месяц.", "**Result:** 3 enquiries a month.");
      const items = caseSec.after?.items ?? [];
      const topIdx = items.findIndex((it) => /топ-1|top-1/i.test(it.uk ?? ""));
      if (topIdx > -1) {
        set[`${p}.after.items[_key=="${items[topIdx]._key}"]`] = {
          _key: items[topIdx]._key,
          uk: "Локальне SEO під *«nyt tag København»* і райони",
          ru: "Локальное SEO под *«nyt tag København»* и районы",
          en: "Local SEO for *“nyt tag København”* and districts",
        };
      }
      log.push("renovation case results/foots/top-1 item → verified set");
    }
    const gsc = sections.find((s) => s._type === "imageTextBlock" && /рости в Google/i.test(s.heading?.uk ?? ""));
    if (gsc) {
      set[`sections[_key=="${gsc._key}"].body`] = { uk: block(GSC_TEXT.uk), ru: block(GSC_TEXT.ru), en: block(GSC_TEXT.en) };
      log.push("renovation GSC block body → one line");
    }
    const acts = sections.find((s) => s._type === "imageTextBlock" && /робили на сайті/i.test(s.heading?.uk ?? ""));
    if (acts) {
      set[`sections[_key=="${acts._key}"].body`] = { uk: block(ACTIONS_TEXT.uk), ru: block(ACTIONS_TEXT.ru), en: block(ACTIONS_TEXT.en) };
      log.push("renovation analytics block body → real numbers");
    }
    const outcome = sections.find((s) => s._type === "outcomeBlock");
    if (outcome?.benefitHero) {
      const p = `sections[_key=="${outcome._key}"].benefitHero`;
      set[`${p}.value`] = "×8";
      set[`${p}.lede`] = l3("заявок: було 3 на місяць, стало 24", "заявок: было 3 в месяц, стало 24", "enquiries: from 3 a month to 24");
      log.push("renovation outcome ×4,8 → ×8");
    }
    const unset = [];
    const dt6 = renovation.hero.deviceTags?.find((d) => d.mini === "top-1");
    if (dt6) unset.push(`hero.deviceTags[_key=="${dt6._key}"].mini`);
    backup("renovation", renovation);
    tx.patch(RENOVATION_ID, (pt) => {
      let q = pt.set(set);
      if (unset.length) q = q.unset(unset);
      return q;
    });
  }

  // ── B: NBYG case — GSC paragraph and the "analytics showed" paragraph
  {
    const set = {};
    const secs = nbyg.sections ?? [];
    const gsc = secs.find((s) => /677/.test(JSON.stringify(s.body?.uk ?? "")));
    if (gsc) {
      set[`sections[_key=="${gsc._key}"].body`] = { uk: block(GSC_TEXT.uk), ru: block(GSC_TEXT.ru), en: block(GSC_TEXT.en) };
      log.push("nbyg case GSC paragraph → one line");
    }
    const acts = secs.find((s) => /Аналітика показала/.test(JSON.stringify(s.body?.uk ?? "")));
    if (acts) {
      set[`sections[_key=="${acts._key}"].body`] = { uk: block(ACTIONS_LEAD.uk), ru: block(ACTIONS_LEAD.ru), en: block(ACTIONS_LEAD.en) };
      log.push("nbyg case analytics paragraph → lead for the bullet list");
    }
    backup("nbyg-case", nbyg);
    if (Object.keys(set).length) tx.patch(NBYG_CASE_ID, (pt) => pt.set(set));
  }

  // ── A: testimonial quote
  {
    const q = testimonial.quote;
    const next = {
      uk: q.uk.replace("24 за перший місяць", "24 на місяць"),
      ru: q.ru.replace("24 за первый месяц", "24 в месяц"),
      en: q.en.replace("24 in the first month", "24 a month"),
    };
    backup("nbyg-testimonial", testimonial);
    tx.patch(NBYG_TESTIMONIAL_ID, (pt) => pt.set({ quote: { ...q, ...next } }));
    log.push("testimonial: 24 in the first month → 24 a month");
  }

  // ── C: English left in uk/ru plan bullets
  {
    const fix = {
      tYwdV2ldLdzJB4kwq0c3UK: l3("Виділена команда", "Выделенная команда", "Dedicated team"),
      tYwdV2ldLdzJB4kwq0c3Us: l3("Підтримка 24/7 з гарантованим часом відповіді", "Поддержка 24/7 с гарантированным временем ответа", "SLA + 24/7 support"),
      tYwdV2ldLdzJB4kwq0c3VQ: l3("Інтеграції під ваші системи", "Интеграции под ваши системы", "Custom integrations"),
    };
    const set = {};
    for (const [key, v] of Object.entries(fix)) set[`includes[_key=="${key}"]`] = { _key: key, ...v };
    backup("plan-custom", planCustom);
    tx.patch(PLAN_CUSTOM_ID, (pt) => pt.set(set));

    const cset = {
      [`includes[_key=="tYwdV2ldLdzJB4kwq0c3pi"]`]: {
        _key: "tYwdV2ldLdzJB4kwq0c3pi",
        uk: "Відповідність вимогам МОЗ і GDPR",
        ru: "Соответствие требованиям МОЗ и GDPR",
        en: "Compliance: UK GDPR / DPA 2018-ready",
      },
      [`excludes[_key=="tYwdV2ldLdzJB4kwq0c3rM"]`]: {
        _key: "tYwdV2ldLdzJB4kwq0c3rM",
        uk: "Підтримка 24/7 за договором",
        ru: "Поддержка 24/7 по договору",
        en: "24/7 SLA",
      },
    };
    backup("plan-corporate", planCorporate);
    tx.patch(PLAN_CORPORATE_ID, (pt) => pt.set(cset));
    log.push("pricing plans: English bullets translated in uk/ru");
  }

  console.log(log.join("\n"));
  if (DRY) {
    console.log("\n--dry-run: nothing written");
    return;
  }
  const res = await tx.commit({ autoGenerateArrayKeys: true });
  console.log("committed", res.transactionId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
