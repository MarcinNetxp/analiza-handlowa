import { randomBytes } from "crypto";
import { PORTAL_SALESPEOPLE } from "../src/lib/portal/config";

const tokens = Object.fromEntries(
  PORTAL_SALESPEOPLE.map((p) => [p.slug, randomBytes(8).toString("hex")]),
);

console.log("HANDLOWY_PORTAL_TOKENS (JSON — wklej do Vercel Environment Variables):\n");
console.log(JSON.stringify(tokens, null, 2));
console.log("\nLinki dla handlowców (produkcja):\n");
const base = "https://analiza-handlowa.vercel.app";
for (const p of PORTAL_SALESPEOPLE) {
  console.log(`${p.firstName} ${p.lastName}:`);
  console.log(`  ${base}/p/${p.slug}/${tokens[p.slug]}\n`);
}
