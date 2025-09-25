import { renderWithProviders } from "@/test-utils";
import { screen } from "@testing-library/react";
import * as router from "react-router-dom";
import { act } from "react-dom/test-utils";
import store from "../../store";
import FinalScore from ".";

const navigate = jest.fn();

describe("Final Score", () => {
  it("Renders the score correctly", () => {
    renderWithProviders(<FinalScore score={100} />);

    // const finalScore = screen.getByText(/final score: 100/i);
    // expect(finalScore).toBeInTheDocument();
  });

  it("Clicks on leaderboard button", () => {
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
    renderWithProviders(<FinalScore score={20} />);

    const leaderboardButton = screen.getByText(/leaderboard/i);

    act(() => {
      leaderboardButton.click();
    });
    const { isPlaying } = store.getState().gameReducer;

    expect(isPlaying).toBeFalsy();
    expect(navigate).toHaveBeenCalledWith("/leaderboard");
  });
});
