import store from "@/store";
import { setIsPlaying, setNewGame } from "./game";

describe("Game store", () => {
  it("checks the initial state", async () => {
    const { gameReducer } = store.getState();

    expect(gameReducer).toEqual({
      isPlaying: false,
      startedDate: null,
      playerName: "",
      score: 0,
    });
  });

  it("set isPlaying value as true", async () => {
    store.dispatch(setIsPlaying(true));

    const { isPlaying } = store.getState().gameReducer;

    expect(isPlaying).toBe(true);
  });

  it("sets correct value on store when starting a new game", async () => {
    const mockDate = new Date(2023, 5, 14, 15);
    jest.useFakeTimers().setSystemTime(mockDate);

    const nickName = "gaming1";
    store.dispatch(
      setNewGame({
        playerName: nickName,
      })
    );

    const { isPlaying, startedDate, playerName } = store.getState().gameReducer;

    expect(isPlaying).toBe(true);
    expect(startedDate).toEqual(mockDate.toISOString());
    expect(playerName).toEqual(nickName);
  });
});
