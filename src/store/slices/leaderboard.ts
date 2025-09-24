import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import { RecordsService } from "@/services/records";

export interface Record {
  score: number;
  playerName: string;
}

export interface LeaderboardState {
  leaderboard: Record[];
}

const initialState: LeaderboardState = {
  leaderboard: [],
};

export const fetchRecords = createAsyncThunk(
  "leaderboard/fetchRecords",
  async () => {
    const response = await RecordsService.getRecords();
    return response.data;
  }
);

export const addRecord = createAsyncThunk(
  "leaderboard/addRecord",
  async (record: Record) => {
    const response = await RecordsService.addRecord(record);
    return response.data;
  }
);

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchRecords.fulfilled, (state, action) => {
      state.leaderboard = action.payload;
    });
  },
});

export const leaderboardSelector = (state: RootState) =>
  state.leaderboardReducer;

const leaderboardReducer = leaderboardSlice.reducer;
export default leaderboardReducer;
