/**
 * T-C3 / T-C7 of the intl SEO plan: the EN articles that compete with the
 * industry pages for the same queries now point to them from the first
 * paragraph, with the query as the anchor («healthcare website design»,
 * «law firm website design», «web design for accountants»). The same bodies
 * still quoted the August terms (2–3 weeks for a landing page, 4–8 weeks for
 * a firm site); those follow src/constants/pricing.ts now: landing 3 working
 * days, business from 7, industry 14–21.
 *
 *   node scripts/intl-uk-2026-09/blog-links.mjs           # dry run
 *   node scripts/intl-uk-2026-09/blog-links.mjs --write
 */
import { randomBytes } from "node:crypto";
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const WRITE = process.argv.includes("--write");
const MED = "/en/sites-for/medicine";
const LEGAL = "/en/sites-for/legal";
const FIN = "/en/sites-for/finance";
const key = () => randomBytes(6).toString("hex");

/**
 * append: text parts added to the first normal paragraph; [anchor, href] is a link.
 * lead: a new paragraph placed right after the TL;DR box instead.
 * linkPhrase: [phrase, href] — link the phrase already in the first paragraph.
 * sub: [from, to] inside any string of the body; exact: whole-string (table cells).
 */
const POSTS = {
  "medical-website-speed": {
    append: [" Speed is part of our ", ["healthcare website design", MED], " from the first line of code, not a fix added later."],
  },
  "medical-website-design-trust": {
    append: [" That filter is where our ", ["medical website design", MED], " work starts."],
  },
  "clinic-website-cost-uk-2026": {
    append: [" Below is the quote behind our ", ["healthcare website design", MED], " package, line by line."],
  },
  "15-clinic-website-mistakes": {
    lead: ["These are the mistakes we check first when a clinic asks us for ", ["healthcare website design", MED], ". Each one sends patients to a competitor, and most can be fixed without a rebuild."],
  },
  "clinic-website-development-process": {
    append: [" This is how our ", ["medical website design", MED], " projects run, week by week."],
  },
  "medical-website-seo-guide": {
    append: [" That's why search is built into our ", ["healthcare website design", MED], " rather than sold as an afterthought."],
  },
  "hospital-vs-private-practice-website": {
    append: [" Our ", ["healthcare website design", MED], " packages follow the same three formats."],
    sub: [["It's the fastest start: 1–2 weeks and you can be found and booked.", "It's the fastest start: 3 working days and you can be found and booked."]],
    exact: [["1–2 weeks", "3 working days"], ["4 weeks", "14–21 working days"]],
  },
  "attorney-website-essentials": {
    append: [" The full package is on our ", ["law firm website design", LEGAL], " page."],
    sub: [
      [" and launches in 2–3 weeks, while ", " and launches in 3 working days, while "],
      [" and takes 4–8 weeks. The rest", " and takes 14–21 working days. The rest"],
    ],
    exact: [["2–3 weeks", "3 working days"], ["4–8 weeks", "14–21 working days"]],
  },
  "websites-for-solicitors": {
    append: [" Our ", ["law firm website design", LEGAL], " work starts from exactly that problem."],
  },
  "web-design-for-accountants": {
    // The paragraph already ends on the query — link that phrase instead of repeating it.
    linkPhrase: ["web design for accountants", FIN],
    sub: [
      ["€1,200, one to two weeks.", "€1,200, three working days."],
      ["€2,500, four to eight weeks.", "€2,500, from seven working days."],
    ],
  },
  "accounting-firm-website": {
    sub: [
      [", 2–3 weeks.", ", 3 working days."],
      [", 4–8 weeks.", ", from 7 working days."],
      ["Delivery from 2 weeks.", "Delivery from 3 working days."],
    ],
    exact: [["2–3 weeks", "3 working days"], ["4–8 weeks", "from 7 working days"]],
  },
};

function spansFor(parts, markDefs) {
  return parts.map((part) => {
    if (typeof part === "string") return { _type: "span", _key: key(), text: part, marks: [] };
    const [text, href] = part;
    const mk = key();
    markDefs.push({ _type: "link", _key: mk, href, newTab: false });
    return { _type: "span", _key: key(), text, marks: [mk] };
  });
}

/** Rewrites every plain string in the EN body; counts hits per rule. */
function rewriteStrings(node, rules, hits) {
  if (typeof node === "string") {
    for (const [i, [from, to]] of rules.exact.entries())
      if (node === from) { hits.exact[i] += 1; return to; }
    let s = node;
    for (const [i, [from, to]] of rules.sub.entries())
      if (s.includes(from)) { hits.sub[i] += 1; s = s.split(from).join(to); }
    return s;
  }
  if (Array.isArray(node)) return node.map((x) => rewriteStrings(x, rules, hits));
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node))
      out[k] = k.startsWith("_") || k === "marks" || k === "style" || k === "href" || k === "listItem" ? v : rewriteStrings(v, rules, hits);
    return out;
  }
  return node;
}

const docs = await client.fetch('*[_type=="blogPost" && slugs.en.current in $s]{_id, "slug": slugs.en.current, body}', {
  s: Object.keys(POSTS),
});
let problems = 0;
const plans = [];
for (const d of docs) {
  const spec = POSTS[d.slug];
  const rules = { sub: spec.sub ?? [], exact: spec.exact ?? [] };
  const hits = { sub: rules.sub.map(() => 0), exact: rules.exact.map(() => 0) };
  let body = rewriteStrings(d.body.en, rules, hits);
  const notes = [];
  rules.sub.forEach(([f], i) => { if (!hits.sub[i]) { problems++; notes.push(`✗ sub not found: ${f}`); } else notes.push(`sub ×${hits.sub[i]}: ${f}`); });
  rules.exact.forEach(([f, t], i) => { if (!hits.exact[i]) { problems++; notes.push(`✗ cell not found: ${f}`); } else notes.push(`cell ×${hits.exact[i]}: ${f} → ${t}`); });

  const linkHref = spec.linkPhrase?.[1] ?? (spec.append ?? spec.lead)?.find((p) => Array.isArray(p))?.[1];
  const firstIdx = body.findIndex((b) => b._type === "block" && b.style === "normal" && !b.listItem);
  const alreadyLinked = body[firstIdx]?.markDefs?.some((m) => m.href === linkHref) ||
    (spec.lead && body.some((b) => b._type === "block" && (b.markDefs ?? []).some((m) => m.href === linkHref) && body.indexOf(b) <= 2));
  if (spec.append && !alreadyLinked) {
    const b = structuredClone(body[firstIdx]);
    b.markDefs = b.markDefs ?? [];
    b.children = [...b.children, ...spansFor(spec.append, b.markDefs)];
    body = body.map((x, i) => (i === firstIdx ? b : x));
    notes.push(`append to first paragraph: …${b.children.map((c) => c.text).join("").slice(-140)}`);
  }
  if (spec.linkPhrase && !alreadyLinked) {
    const [phrase, href] = spec.linkPhrase;
    const b = structuredClone(body[firstIdx]);
    const at = b.children.findIndex((c) => !c.marks?.length && c.text.includes(phrase));
    if (at < 0) { problems++; notes.push(`✗ phrase not in first paragraph: ${phrase}`); }
    else {
      const c = b.children[at];
      const i = c.text.lastIndexOf(phrase);
      const mk = key();
      b.markDefs = [...(b.markDefs ?? []), { _type: "link", _key: mk, href, newTab: false }];
      const parts = [
        { ...c, text: c.text.slice(0, i) },
        { _type: "span", _key: key(), text: phrase, marks: [mk] },
        { _type: "span", _key: key(), text: c.text.slice(i + phrase.length), marks: [] },
      ].filter((x) => x.text);
      b.children = [...b.children.slice(0, at), ...parts, ...b.children.slice(at + 1)];
      body = body.map((x, j) => (j === firstIdx ? b : x));
      notes.push(`link phrase «${phrase}» → ${href}`);
    }
  }
  if (spec.lead && !alreadyLinked) {
    const markDefs = [];
    const nb = { _type: "block", _key: key(), style: "normal", markDefs, children: spansFor(spec.lead, markDefs) };
    const at = body.findIndex((x) => x._type === "tldrBox");
    body = [...body.slice(0, at + 1), nb, ...body.slice(at + 1)];
    notes.push(`new paragraph after TL;DR: ${nb.children.map((c) => c.text).join("")}`);
  }
  console.log(`\n## ${d.slug}`);
  for (const n of notes) console.log(`  ${n}`);
  if (JSON.stringify(body) !== JSON.stringify(d.body.en)) plans.push({ d, body });
}
if (problems) { console.error(`\n${problems} rule(s) matched nothing — nothing written.`); process.exit(1); }
if (!WRITE) { console.log(`\nDry run: ${plans.length} posts. Add --write.`); process.exit(0); }
for (const { d, body } of plans) {
  backup(`blog-links-${d._id}`, await client.getDocument(d._id));
  await client.patch(d._id).set({ "body.en": body }).commit();
}
console.log(`\nWROTE ${plans.length} posts`);
