import { combineReducers } from "@reduxjs/toolkit";
import gameReducer from "./game";
import leaderboardReducer from "./leaderboard";

const rootReducer = combineReducers({
  gameReducer,
  leaderboardReducer,
});
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
