/**
 * Optional: print mock dataset stats (same seed as runtime).
 * Runtime uses generateMockDataset() directly — no snapshot required.
 */
import { generateMockDataset } from "../src/data/mock/generate";

const dataset = generateMockDataset(20260807);
console.log(
  JSON.stringify(
    {
      salespeople: dataset.salespeople.length,
      leads: dataset.leads.length,
      activities: dataset.activities.length,
      referenceDate: dataset.referenceDate,
    },
    null,
    2,
  ),
);
