/**
 * One-shot migration: append `portableText` translations to each affected
 * translation JSON. Each entry is `<shadow-path>: [<block>, ...]`, where
 * each block is an array of spans. Strings = unmarked, `{em}` / `{strong}`
 * = marked. Driver's `buildPtBlock` converts to Sanity's `_type:'block'`
 * shape on apply.
 *
 * Idempotent — re-running rewrites the same entries.
 *
 * Authored 2026-05-30 to close the last ~4% of EN gaps that the string-
 * lookup driver couldn't reach (reasonsBlock.textEn, faqBlock.answerEn,
 * imageTextBlock.bodyEn).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type PtSpan = string | { em: string } | { strong: string };
type PtBlock = PtSpan[];

type DocSpec = { file: string; portableText: Record<string, PtBlock[]> };

const SPECS: DocSpec[] = [
  /* ─── INDUSTRY: renovation ─── */
  {
    file: "industryPage.renovation.json",
    portableText: {
      /* 3 reasons (sec7.reasons[].textEn) */
      'sections[_key=="sec7"].reasons[_key=="r8"].textEn': [
        [
          "Clients can't tell if the renovation fits their budget — so they go to a competitor that shows ",
          { em: "price per sq ft" },
          ". 70% of leads drop off at \"call us for pricing.\"",
        ],
      ],
      'sections[_key=="sec7"].reasons[_key=="rd"].textEn': [
        [
          "A services page with stock-photo art. Not a single real project with an address. Clients think \"do you actually do renovations, or are you a ",
          { em: "middleman" },
          "?\" Without real cases, there's no trust.",
        ],
      ],
      'sections[_key=="sec7"].reasons[_key=="ri"].textEn': [
        [
          "A catch-all \"all renovation types\" page with no breakdown by neighborhood or work type. Competitors with landing pages like \"",
          { em: "apartment renovation Pechersk" },
          "\" pick up all the local traffic.",
        ],
      ],
      /* 8 FAQ answers (sec1i.items[].answerEn) */
      'sections[_key=="sec1i"].items[_key=="faq1j"].answerEn': [
        [
          "Starter — ",
          { em: "4 weeks" },
          " from brief to launch. Pro — 6 weeks. Enterprise with a 3D visualizer — 8–10 weeks. Deadlines are written into the contract. If we miss them on our end, we pay a ",
          { em: "30% penalty" },
          ".",
        ],
      ],
      'sections[_key=="sec1i"].items[_key=="faq1q"].answerEn': [
        [
          "We migrate without losing SEO history. Old URLs auto-redirect to the new ones via ",
          { em: "301 redirects" },
          ". Google rankings hold. We audit every failure point before the domain cuts over. Portfolio: 47 migrations with ",
          { em: "zero SEO drops" },
          ".",
        ],
      ],
      'sections[_key=="sec1i"].items[_key=="faq1x"].answerEn': [
        [
          "You give us a table of \"",
          { em: "renovation type × work type × price per sq ft" },
          "\" for your region. We turn it into the calculator. You edit prices yourself through the admin — no developer — and the formula recomputes automatically.",
        ],
      ],
      'sections[_key=="sec1i"].items[_key=="faq22"].answerEn': [
        [
          "Only with the client's ",
          { em: "written consent" },
          ". We provide a consent template. You can also anonymize — neighborhood instead of exact address, photos without identifying details. Plenty of clients let you mention the building or neighborhood.",
        ],
      ],
      'sections[_key=="sec1i"].items[_key=="faq27"].answerEn': [
        [
          "CRM (Bitrix24 / AmoCRM / KeyCRM): from ",
          { em: "$300" },
          " each. Calendly or a custom estimate-booking calendar: $200. 3D visualizer (Planoplan): $500–1,000. Client portal: $1,500. ERP / accounting integration — separate quote after a technical audit.",
        ],
      ],
      'sections[_key=="sec1i"].items[_key=="faq2c"].answerEn': [
        [
          "Yes. WayForPay, LiqPay, Mono Pay (UA), Stripe (for international clients), USDT. A ",
          { em: "30–50%" },
          " deposit is standard in construction. We can wire up milestone payments (30% on start + 35% after design + 35% at handover).",
        ],
      ],
      'sections[_key=="sec1i"].items[_key=="faq2h"].answerEn': [
        [
          "At launch — we do (",
          { em: "3–5 ready cases" },
          " from your archive). After that, your content manager or your foreman from a phone. The admin lets you upload photos in batches and auto-pair them into before/after sets. We train your team in an hour.",
        ],
      ],
      'sections[_key=="sec1i"].items[_key=="faq2m"].answerEn': [
        [
          "Yes. ",
          { em: "Houzz portfolio sync" },
          " auto-pulls projects from your Houzz profile onto the site. Pinterest — via embed or API. Instagram — embed block with your last 9–12 posts.",
        ],
      ],
      'sections[_key=="sec1i"].items[_key=="faq2r"].answerEn': [
        [
          "Traffic encryption (",
          { em: "TLS 1.3" },
          "), file encryption at rest in the cloud (AES-256), regular backups. GDPR-compliant. Client portal login with 2FA. Cookie consent with opt-in.",
        ],
      ],
      'sections[_key=="sec1i"].items[_key=="faq2w"].answerEn': [
        [
          "Pro tier — UA + RU. Enterprise — ",
          { em: "UA + RU + EN" },
          ". For specific markets (FR for France or DA for Denmark) — additional language for $1,500. We have real client projects shipping in Ukraine, France, and Denmark.",
        ],
      ],
    },
  },

  /* ─── CASES ─── */
  {
    file: "c133cc2a-b795-4437-a4de-e6731d9e5e57.json", // bravo
    portableText: {
      'sections[_key=="sec6"].bodyEn': [
        [
          "For a food business, just showing dishes isn't enough. The user has to quickly grasp what's on offer, why it's convenient, how delivery works, and where to tap to place an order. The brand also needed more than a website — a menu design that holds the same visual language.",
        ],
      ],
      'sections[_key=="sec9"].bodyEn': [
        [
          "We built the site and the menu design for the food-delivery brand. The site is structured as a conversion path where every block points the user toward the menu or an order. The menu design carries the same visual language as the site.",
        ],
      ],
      'sections[_key=="sech"].bodyEn': [
        [
          "Bravo got more than a website — full digital packaging for a food business. The site shows the brand's offering, deals, and benefits up front, then walks the user to the menu and the order. The menu design holds the same visual language and makes the brand's communication feel coherent — online and offline.",
        ],
      ],
    },
  },
  {
    file: "caseStudy.efedra-clinic.json",
    portableText: {
      'sections[_key=="sec6"].bodyEn': [
        [
          "The client had a legacy Tilda site from 2021. It didn't support online booking, the marketing was weak, and 60%+ of prospective patients dropped off because of poor UX and missing conversion tools.",
        ],
      ],
      'sections[_key=="sec9"].bodyEn': [
        [
          "We built a new site from scratch on Next.js + Sanity CMS. Structured the services (dental and aesthetic), tightened the UX, and put a real conversion system in place with proper SEO and multilingual architecture.",
        ],
      ],
      'sections[_key=="sech"].bodyEn': [
        [
          "Three months after launch, the new site was bringing in 3.2× more inquiries per month. Mobile traffic grew 4× thanks to local SEO. The clinic's office manager spends 5× less time updating content — all self-serve through Sanity.",
        ],
        [
          "The site's overall ROI paid back in 4 months on additional inquiries alone.",
        ],
      ],
    },
  },
  {
    file: "71bf3d68-ea3f-48ff-a79a-4cb01841580c.json", // glimmer
    portableText: {
      'sections[_key=="sec6"].bodyEn': [
        [
          "Glimmer is a publisher with a new book line and a social-media audience that needed a real place to buy. Without a full e-commerce site, audience interest wasn't converting into orders — the catalog, structure, and pre-order mechanics were all missing.",
        ],
      ],
      'sections[_key=="sec9"].bodyEn': [
        [
          "We built an e-commerce site on Next.js + Sanity CMS with a conversion-driven marketing structure. Every block on the homepage solves a commercial job — not just showing books, but pushing specific titles and walking the user toward checkout.\n",
        ],
      ],
      'sections[_key=="sech"].bodyEn': [
        [
          "After launch the site immediately started working as a sales channel. The right marketing structure on the homepage — banners, curated lists, deals, new releases — converted the audience's existing interest into real orders. The client recouped the site investment in roughly 1 week after launch — that's the headline result of this case.",
        ],
      ],
    },
  },
  {
    file: "a5311634-9a57-4de9-ab72-ec42fcfcc270.json", // kondor-device
    portableText: {
      'sections[_key=="sec6"].bodyEn': [
        [
          "Kondor Device is a product brand with its own device lineup and an audience that compares models, reads specs, and looks for specific solutions. Without a real e-commerce site, the brand couldn't convert that interest into sales.",
        ],
      ],
      'sections[_key=="sec9"].bodyEn': [
        [
          "We built an e-commerce site on Next.js + Sanity CMS with a full storefront structure. Every block does one job: help the user find a product, compare options, and place an order.",
        ],
      ],
      'sections[_key=="sech"].bodyEn': [
        [
          "After launch the site became a real sales channel for Kondor Device. The brand got more than a storefront — an e-commerce tool that walks the user from first contact with the product to a placed order. With a clear catalog structure, detailed product cards, and a short path to purchase, sales rose noticeably — the site directly moved the brand's commercial numbers. The relationship grew past the site: the brand continues working with us on packaging for new products, which is a signal of trust in our approach and design quality overall.",
        ],
      ],
    },
  },
  {
    file: "dbf63d07-e6b1-4e66-a74c-6a2b046410a7.json", // le-muse-nature
    portableText: {
      'sections[_key=="sec6"].bodyEn': [
        [
          "Le'Muse Nature sells a considered product: users don't buy a serum or a supplement on impulse. They need to understand the formulation, the mechanism of action, who the product is for, and why this brand specifically. Without the right site structure, that value is lost and the sale doesn't happen.",
        ],
      ],
      'sections[_key=="sec9"].bodyEn': [
        [
          "We built an e-commerce site for a premium dermatocosmetic brand, focused on trust, a guided selection flow, and a clear path to purchase or consultation. Every block does one job — explains the product's value, removes a doubt, or drives an action.",
        ],
      ],
      'sections[_key=="sech"].bodyEn': [
        [
          "Le'Muse Nature got a full e-commerce platform where every site element works to sell through trust. A user can land, grasp what the brand stands for, find the right category, study the ingredients, browse bestsellers, then move on to a purchase or a free specialist consultation — all in one place, no extra steps. The structure supports not just today's sales but the brand's long-term positioning as expert and premium.",
        ],
      ],
    },
  },
  {
    file: "a2b52844-f284-4114-8a4d-61204b18b498.json", // mono-pools
    portableText: {
      'sections[_key=="sec6"].bodyEn': [
        [
          "A pool is an expensive purchase. The buyer takes their time — comparing options, looking up prices, reading about warranties, reviewing past projects. Without the right structure, a site can't sell in this niche.",
        ],
      ],
      'sections[_key=="sec9"].bodyEn': [
        [
          "We built the site from scratch on Next.js with a structure that walks the user from the first screen to an inquiry. Every block does one job — sales, trust, or SEO.",
        ],
      ],
      'sections[_key=="sech"].bodyEn': [
        [
          "The site became a full client-acquisition channel — not just a business card. The user gets answers to the key questions before the first call.",
        ],
      ],
    },
  },
  {
    file: "be23bea1-7127-4e1c-bddc-27b29a8d7b44.json", // right-cars
    portableText: {
      'sections[_key=="sec6"].bodyEn': [
        [
          "A vehicle dealer with a large inventory can't sell effectively through a plain business-card site. Buyers take their time — comparing specs, searching by parameters, checking prices and finance terms. Without the right system, that process either happens offline or gets lost entirely.",
        ],
      ],
      'sections[_key=="sec9"].bodyEn': [
        [
          "We built a custom platform for the dealer from scratch — with a catalog, filters, several inquiry flows, and an admin panel for self-serve management. Every section solves a separate piece of the business.",
        ],
      ],
      'sections[_key=="sech"].bodyEn': [
        [
          "Right Cars got more than a refreshed site — a full digital platform for working with online demand. A buyer can now find a vehicle through the filtered catalog, study every spec on the card, reserve a vehicle, apply for finance, or book a test drive — without a phone call and without a salesperson on the first step. The dealer's team got a custom admin panel for managing the inventory and the content themselves, no developer required. The platform covers every key customer touchpoint in one system and gives the business a tool that scales with the inventory.",
        ],
      ],
    },
  },
  {
    file: "caseStudy.rich-tour.json",
    portableText: {
      'sections[_key=="sec6"].bodyEn': [
        [
          "For a travel agency, showing destinations isn't enough — you need a system that actually sells tours. Without a catalog, search, and separate agent access, even a strong offer gets lost — clients compare fast and expect a quick response.",
        ],
      ],
      'sections[_key=="sec9"].bodyEn': [
        [
          "We built the Rich Tour site as a travel platform with a catalog, filters, an agent portal, and CRM integration.",
        ],
        [
          "On the homepage the user can jump straight into tour search by country and month. From there the site walks them through categories, destinations, benefits, reviews, FAQ, and an inquiry form. We also built a separate agent portal — the site serves end clients and partners who sell tours.",
        ],
      ],
      'sections[_key=="fd187ec9f59b"].bodyEn': [
        [
          "We built an admin panel so the Rich Tour team can update tours, categories, copy, reviews, FAQ, and other site sections themselves. CRM integration keeps inquiries from getting lost and routes them to managers faster. That matters in travel — clients often pick a trip quickly, compare options, and expect a fast reply. The agent portal makes the site useful for partners selling tours through the system, not just end clients.",
        ],
      ],
      'sections[_key=="sech"].bodyEn': [
        [
          "Rich Tour got more than a website — a full platform for selling tours and working with agents. Users can find a trip fast, browse categories, read the terms, check the FAQ, and submit an inquiry. Managers receive leads through the CRM; agents have their own system access. The site structures sales, simplifies the team's work, and makes choosing a tour clearer for clients.",
        ],
      ],
    },
  },
  {
    file: "caseStudy.sytnykov.json",
    portableText: {
      'sections[_key=="sec6"].bodyEn': [
        [
          "This project wasn't about selling legal services alone — it was about selling trust in an expert with a strong professional background. Clients and students weigh experience, status, and how content is organized before the first inquiry. Without the right architecture, even a strong practitioner stays invisible in search.",
        ],
      ],
      'sections[_key=="sec9"].bodyEn': [
        [
          "We built the site around Oleksandr Sytnykov's personal brand: his experience, status, legal expertise, and training programs. Every block does one job: show authority, explain services and courses, and drive the user to an inquiry.",
        ],
      ],
      'sections[_key=="fd187ec9f59b"].bodyEn': [
        [
          "We set the client up with a Sanity CMS admin panel they can run themselves without constantly reaching out to a developer. The interface works on a phone, so changes happen fast: update copy, add an article or course, or reorder blocks.\n\nIn the admin you can:",
        ],
      ],
      'sections[_key=="sech"].bodyEn': [
        [
          "Oleksandr Sytnykov got a site that works as a personal-brand platform, legal-services hub, and advocacy-courses storefront. The site underscores his standing as a former judge, shows his expertise, presents the training programs, and drives users to an inquiry. The bilingual structure and SEO lay the groundwork for organic growth on legal and education queries.",
        ],
      ],
    },
  },
  {
    file: "24ac5799-3754-49a3-ac77-4904124d6be6.json", // solide-renovation
    portableText: {
      'sections[_key=="sec6"].bodyEn': [
        [
          "For a high-ticket renovation firm, a plain business-card site doesn't work. The client doesn't decide on impulse — they look for proof of the work's quality, study the approach, and want to see real projects before the first call. Without the right structure, even a strong team stays invisible to the prospective client.",
        ],
      ],
      'sections[_key=="sec9"].bodyEn': [
        [
          "We built the site for a turnkey designer-led renovation firm, focused on trust, portfolio, and a clear path to inquiry. Every block does one job: show the level of work, explain the services, pull the user into interaction, and drive them to a consultation.",
        ],
      ],
      'sections[_key=="fd187ec9f59b"].bodyEn': [
        [
          "We set the client up with a Sanity-CMS admin panel they can run themselves without constantly reaching out to a developer. The interface works on a phone, so changes happen fast: update copy, swap an image, add a new page, or reorder blocks.\n\nIn the admin you can:",
        ],
      ],
      'sections[_key=="sech"].bodyEn': [
        [
          "Solide Renovation got a full digital tool that matches the level of the firm and the niche. The site shows the scale and quality of the work through the portfolio up front, explains the services and the approach, pulls the user in through the calculator, and drives them to an inquiry through the form or a messenger. The multilingual setup covers the firm's different client audiences in France, and the SEO structure lays the groundwork for local search promotion.",
        ],
      ],
    },
  },
];

function main() {
  const root = join(process.cwd(), "translations");
  for (const spec of SPECS) {
    const p = join(root, spec.file);
    const json = JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
    (json as { portableText?: unknown }).portableText = spec.portableText;
    writeFileSync(p, JSON.stringify(json, null, 2) + "\n", "utf8");
    console.log(
      `${spec.file}  ←  ${Object.keys(spec.portableText).length} portable-text paths`,
    );
  }
}

main();
