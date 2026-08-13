import { readDataSource } from "@/config/dataSource";
import * as api from "./api/repository";
import * as mock from "./mock/repository";

function repo() {
  return readDataSource() === "api" ? api : mock;
}

export const salespeopleService = {
  list: () => repo().listSalespeople(),
  getById: (id: string) => repo().getSalesperson(id),
};
