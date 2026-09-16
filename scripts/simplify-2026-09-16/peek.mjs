import { client } from "./lib.mjs";
const q = process.argv[2];
const r = await client.fetch(q);
console.log(JSON.stringify(r, null, 1));
