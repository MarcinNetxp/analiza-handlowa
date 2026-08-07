import type { MockDataset } from "@/types/domain";
import { generateMockDataset } from "./generate";

let cache: MockDataset | null = null;

/** Deterministic mock dataset (seed fixed). Swap DATA_SOURCE to "api" later. */
export function getMockDataset(): MockDataset {
  if (!cache) {
    cache = generateMockDataset(20260807);
  }
  return cache;
}
