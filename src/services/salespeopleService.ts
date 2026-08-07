import { DATA_SOURCE } from "@/config/dataSource";
import * as api from "./api/repository";
import * as mock from "./mock/repository";

const repo = DATA_SOURCE === "api" ? api : mock;

export const salespeopleService = {
  list: () => repo.listSalespeople(),
  getById: (id: string) => repo.getSalesperson(id),
};
