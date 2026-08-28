import { randomBytes } from "crypto";
import { PORTAL_SALESPEOPLE } from "../src/lib/portal/config";

const tokens = Object.fromEntries(
  PORTAL_SALESPEOPLE.map((p) => [p.slug, randomBytes(8).toString("hex")]),
);

console.log("HANDLOWY_PORTAL_TOKENS (lokalnie / archiwum — portale Vercel wyłączone):\n");
console.log(JSON.stringify(tokens, null, 2));
console.log("\nProdukcja: https://crm.netxp.pl/ngcrm/handlowy (logowanie sesją CRM).\n");
