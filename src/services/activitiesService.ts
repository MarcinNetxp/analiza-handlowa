import { DATA_SOURCE } from "@/config/dataSource";
import * as api from "./api/repository";
import * as mock from "./mock/repository";

const repo = DATA_SOURCE === "api" ? api : mock;

export const activitiesService = {
  list: () => repo.listActivities(),
  getById: (id: string) => repo.getActivity(id),
  getReferenceDate: () => repo.getReferenceDate(),
};
