import { Record } from "@/store/slices/leaderboard";
import { API } from "./api";
import { AxiosResponse } from "axios";

export const RecordsService = {
  async getRecords(): Promise<AxiosResponse<Record[]>> {
    const response = await API.get<Record[]>("records");
    return response;
  },
  async addRecord(record: Record) {
    const response = await API.post("record", record);
    return response;
  },
};
