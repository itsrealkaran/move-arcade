import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";

export interface NewGame {
  playerName: string;
}

export interface GameState extends NewGame {
  isPlaying: boolean;
  startedDate: string | null;
  score: number;
  lives: number;
}

const initialState: GameState = {
  isPlaying: false,
  startedDate: null,
  playerName: "",
  score: 0,
  lives: 3,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
      state.startedDate = new Date().toISOString();
    },
    resetTime: state => {
      state.startedDate = null;
    },
    setNewGame: (state, action: PayloadAction<NewGame>) => {
      state.isPlaying = true;
      state.startedDate = new Date().toISOString();
      state.playerName = action.payload.playerName;
      state.lives = 3;
      state.score = 0;
    },
    incrementScore: (state, action: PayloadAction<number>) => {
      state.score += action.payload;
    },
    loseLife: (state) => {
      state.lives -= 1;
    },
    resetGame: (state) => {
      state.isPlaying = false;
      state.startedDate = null;
      state.score = 0;
      state.lives = 3;
    },
  },
});

export const { setIsPlaying, resetTime, setNewGame, incrementScore, loseLife, resetGame } = gameSlice.actions;
export const gameSelector = (state: RootState) => state.gameReducer;

const gameReducer = gameSlice.reducer;
export default gameReducer;
