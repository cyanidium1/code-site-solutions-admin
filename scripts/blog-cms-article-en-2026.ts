/**
 * Add the EN (en-GB) version of the CMS-explainer article
 * «Як працює адмін-панель сайту…» (doc b5728991-…, published 2026-07-22).
 *
 * Patches the published doc with titleEn/slugEn/bodyEn/faqEn/meta*En —
 * setting titleEn + slugEn is what surfaces the post on /en/blog and
 * turns on the en-GB hreflang pair on the UA page.
 *
 * EN body mirrors the UA structure block-for-block: tldr, video (ID left
 * empty until the screencast exists — hidden on the site meanwhile),
 * modalDemo CTA (leadSource blog-cms-demo-en) and final modal CTA
 * (blog-cms-final-en). Copy is en-GB for the UK-market /en site.
 *
 * Dry-run:  npx sanity exec scripts/blog-cms-article-en-2026.ts --with-user-token
 * Apply:    npx sanity exec scripts/blog-cms-article-en-2026.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const DOC_ID = 'b5728991-81b4-4240-8729-8c8798481123'

/* ── portable-text builders (same shape as blog-cms-article-2026.ts) ─────── */
type Part = string | {text: string; bold?: boolean; href?: string}

function builders(prefix: string) {
  let n = 0
  const key = () => `${prefix}-${(++n).toString(36)}`
  const norm = (parts: Part[] | string): Part[] => (typeof parts === 'string' ? [parts] : parts)

  function rich(style: string, parts: Part[] | string, listItem?: 'bullet' | 'number') {
    const markDefs: any[] = []
    const children = norm(parts).map((pt) => {
      if (typeof pt === 'string') return {_type: 'span', _key: key(), text: pt, marks: []}
      const marks: string[] = []
      if (pt.bold) marks.push('strong')
      if (pt.href) {
        const lk = key()
        markDefs.push({_key: lk, _type: 'link', href: pt.href, newTab: false})
        marks.push(lk)
      }
      return {_type: 'span', _key: key(), text: pt.text, marks}
    })
    const block: any = {_type: 'block', _key: key(), style, markDefs, children}
    if (listItem) {
      block.listItem = listItem
      block.level = 1
    }
    return block
  }

  return {
    p: (parts: Part[] | string) => rich('normal', parts),
    h2: (text: string) => rich('h2', text),
    bullet: (parts: Part[] | string) => rich('normal', parts, 'bullet'),
    num: (parts: Part[] | string) => rich('normal', parts, 'number'),
    tldr: (title: string, items: string[]) => ({_type: 'tldrBox', _key: key(), title, items}),
    video: (v: Record<string, string>) => ({_type: 'blogVideo', _key: key(), ...v}),
    cta: (c: Record<string, string>) => ({_type: 'ctaCallout', _key: key(), ...c}),
  }
}

/* ── EN body ─────────────────────────────────────────────────────────────── */
const b = builders('cmsen')

const bodyEn = [
  b.tldr('In 60 seconds', [
    'The admin panel is a private area for managing your site content — **no coding needed**',
    'Edit copy, photos, prices, services and articles yourself — **from a computer or phone**',
    'You cannot break the design: you only work with pre-configured fields',
    'Drafts: visitors see nothing until you press publish',
    'Several team members can have access — each to their own sections',
  ]),
  b.p(
    'We set every site up with a friendly admin panel built on Sanity. It runs in the browser on desktop and mobile, needs no coding knowledge, and is configured specifically for your site.',
  ),
  b.h2('See the admin panel in action'),
  b.p(
    'In the video we walk through the admin panel interface and show how to update your site content yourself.',
  ),
  // youtubeId intentionally empty — the block stays hidden until the video is ready.
  b.video({title: 'How the website admin panel works — video walkthrough'}),
  b.p("In the video you'll see:"),
  b.bullet('how to sign in to the admin panel;'),
  b.bullet('where the site pages and sections live;'),
  b.bullet('how to change copy and photos;'),
  b.bullet('how to add new content;'),
  b.bullet('how to save and publish changes.'),
  b.cta({
    eyebrow: 'Try it yourself',
    heading: 'Want to try it yourself?',
    sub:
      'Get access to a demo admin panel and see how easy it is to work with. ' +
      'Open the sections, change some content and see the whole editing flow from the inside.',
    ctaLabel: 'Get demo access',
    ctaMode: 'modalDemo',
    leadSource: 'blog-cms-demo-en',
  }),
  b.h2('What an admin panel is'),
  b.p(
    'The admin panel is a separate, private area for managing your website. Regular visitors never see it. Only the site owner — and any team members they invite — can access it.',
  ),
  b.p('Inside, everything is organised into clear sections. For example:'),
  b.bullet('pages;'),
  b.bullet('services;'),
  b.bullet('products;'),
  b.bullet('projects;'),
  b.bullet('articles;'),
  b.bullet('team members;'),
  b.bullet('reviews;'),
  b.bullet('contact details.'),
  b.p(
    "The exact list depends on how your site is structured. We don't add features for the sake of it — the admin panel contains only what you actually need to run your site.",
  ),
  b.h2('What you can change yourself'),
  b.p('The admin panel lets you manage all the core content of your site:'),
  b.bullet('edit headings and copy;'),
  b.bullet('upload and replace photos;'),
  b.bullet('add new services or products;'),
  b.bullet('update prices;'),
  b.bullet('publish projects and case studies;'),
  b.bullet('add blog articles;'),
  b.bullet('change phone numbers, addresses and other contact details;'),
  b.bullet('add team members and reviews;'),
  b.bullet('fill in SEO titles and page descriptions;'),
  b.bullet('create new pages from ready-made templates.'),
  b.p(
    "Before development starts, we agree exactly which information you'll need to update, and set up the right sections and fields for it.",
  ),
  b.h2('Manage your site from your phone'),
  b.p(
    "You don't need to be at a computer to work with the admin panel. It works just as well on a smartphone, in a regular browser.",
  ),
  b.p('Straight from your phone you can:'),
  b.bullet('change a copy line or a price;'),
  b.bullet('add a photo from your gallery;'),
  b.bullet('publish a news item, article or project;'),
  b.bullet('update contact details;'),
  b.bullet('quickly fix a mistake on a page;'),
  b.bullet('save content as a draft or publish it straight away.'),
  b.p(
    "There's no separate app to install. Just open the admin panel link and sign in to your account.",
  ),
  b.p(
    "It's especially handy when something on the site needs an urgent update and there's no computer around.",
  ),
  b.h2('How editing works'),
  b.p('Working with the admin panel comes down to a few simple steps:'),
  b.num('You sign in with your account.'),
  b.num('You open the section or page you need.'),
  b.num('You change the copy, photo or other information.'),
  b.num('You review your changes.'),
  b.num('You press publish.'),
  b.p(
    'Once published, the updated information appears on the site. No extra software, no digging through code, no sending every small edit to a developer.',
  ),
  b.h2('Example: adding a new service'),
  b.p('Say your company launches a new service.'),
  b.p('You open the Services section, create a new entry and fill in the prepared fields:'),
  b.bullet('service name;'),
  b.bullet('short description;'),
  b.bullet('main copy;'),
  b.bullet('photo;'),
  b.bullet("price, if it's shown on the site;"),
  b.bullet('SEO title and description.'),
  b.p(
    'After publishing, the new service automatically appears in the right section of the site, styled exactly like every other page.',
  ),
  b.h2('Can you accidentally break the design?'),
  b.p(
    'No. The admin panel lets you change content, but not the design or the technical structure of the site.',
  ),
  b.p(
    "You only ever work with pre-configured fields. You can swap a heading, a paragraph or a photo — but you can't accidentally delete the menu, change the fonts or knock the layout out of place.",
  ),
  b.p(
    "New content is styled automatically to match the site design. You never have to set colours, spacing or font sizes yourself.",
  ),
  b.h2('Drafts and publishing'),
  b.p(
    "Changes can be saved as a draft first. That's useful when the content isn't ready yet, or a colleague needs to review it.",
  ),
  b.p(
    'Until you publish, visitors see none of your changes — so an unfinished text or a wrong price never slips onto the site.',
  ),
  b.p('When the content is ready, one click on publish puts it live.'),
  b.h2('Access for your team'),
  b.p(
    'If needed, several team members can have admin panel access. A manager can add new projects, while a marketer publishes articles.',
  ),
  b.p(
    "Only the people you've invited can get in. Outsiders can't sign in or change anything on your site.",
  ),
  b.p('The number of users, their roles and any restrictions depend on what your project needs.'),
  b.h2('Do you need to install anything?'),
  b.p('No. The admin panel is connected while the site is being built and works entirely online.'),
  b.p('To sign in, you simply:'),
  b.bullet('open your admin panel link;'),
  b.bullet('log in;'),
  b.bullet('pick the section you need;'),
  b.bullet('make and publish your changes.'),
  b.p('The admin panel works in a regular browser on a computer, tablet or phone.'),
  b.h2("We'll show you how everything works"),
  b.p(
    'When development wraps up, we hand over the admin panel access and walk you through using it.',
  ),
  b.p(
    'You get a clear system configured for your site — no dozens of mystery features, just the sections and fields you need.',
  ),
  b.p(
    'If you later need a new content type or extra admin panel capabilities, that can be added separately.',
  ),
  b.cta({
    heading: 'Run your site without depending on a developer',
    sub:
      "A website should stay up to date after launch. That's why we build not just a set of static pages, but a tool your team can use every day. " +
      'You update the content from a computer or phone, while the design and structure of the site stay clean and intact.',
    ctaLabel: 'Discuss your website project',
    ctaMode: 'modal',
    leadSource: 'blog-cms-final-en',
  }),
]

/* ── EN FAQ ──────────────────────────────────────────────────────────────── */
let fq = 0
const faqKey = () => `cmsenfaq-${(++fq).toString(36)}`
const faqEn = [
  {
    question: 'Do I need to know how to code?',
    answer: 'No. Editing the site requires no technical knowledge or coding experience.',
  },
  {
    question: 'When do changes appear on the site?',
    answer: 'As soon as you press publish. Until then, content can be kept as a draft.',
  },
  {
    question: 'Can I edit the site from my phone?',
    answer:
      'Yes. The admin panel is built to work on a smartphone. You can edit copy, upload photos, add content and publish updates straight from your phone.',
  },
  {
    question: 'Can I add a new page?',
    answer:
      'If a ready-made template exists for it, you can create the page in the admin panel. A page with a brand-new structure and design is built separately.',
  },
  {
    question: 'Can I give access to a colleague?',
    answer:
      'Yes. You can invite other team members and give them access to manage content.',
  },
  {
    question: 'What if I have a question?',
    answer:
      "Just get in touch. We'll point you to the right section and show you how to make the change.",
  },
].map((item) => ({_type: 'blogFaqItemEn', _key: faqKey(), ...item}))

/* ── Patch ───────────────────────────────────────────────────────────────── */
const patch = {
  titleEn: "How your website's admin panel works — and what you can change yourself",
  slugEn: {_type: 'slug', current: 'how-website-admin-panel-works'},
  eyebrowEn: 'Platforms · 6 min read',
  ledeEn:
    "Once your site launches, you won't need to call a developer every time you want to change a line of copy, add a photo, update a price or publish a new service.",
  bodyEn,
  faqHeadingEn: 'Frequently asked questions',
  faqEn,
  metaTitleEn: 'How a Website Admin Panel Works: What You Can Edit Yourself',
  metaDescriptionEn:
    "How a Sanity-based admin panel works: what you can edit without a developer, publishing from your phone, and why you can't break the design. Video walkthrough and demo access.",
}

function main() {
  console.log(`Doc:    ${DOC_ID}`)
  console.log(`slugEn: ${patch.slugEn.current}`)
  console.log(`Body blocks: ${bodyEn.length} · FAQ items: ${faqEn.length}`)
  if (!APPLY) {
    console.log('\nDry-run only. Re-run with `-- --apply` to patch.')
    return Promise.resolve()
  }
  return client
    .patch(DOC_ID)
    .set(patch)
    .commit()
    .then((res) => {
      console.log(`\nPatched ${res._id} (rev ${res._rev}). EN version live after ISR revalidation.`)
    })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
