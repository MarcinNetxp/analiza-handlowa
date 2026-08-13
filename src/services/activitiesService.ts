import { readDataSource } from "@/config/dataSource";
import * as api from "./api/repository";
import * as mock from "./mock/repository";

function repo() {
  return readDataSource() === "api" ? api : mock;
}

export const activitiesService = {
  list: () => repo().listActivities(),
  getById: (id: string) => repo().getActivity(id),
  getReferenceDate: () => repo().getReferenceDate(),
};
