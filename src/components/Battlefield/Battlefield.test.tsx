import { renderWithProviders } from "@/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import gameConfig from "@gameconfig/index";
import Battlefield from ".";
import { act } from "react-dom/test-utils";

describe("Battlefield", () => {
  it("Renders the correct amount of moles", () => {
    renderWithProviders(<Battlefield />);

    const moles = screen.getAllByTestId("mole");
    expect(moles.length).toBe(gameConfig.MOLES_COUNT);
  });

  it("Increment score on mole click", async () => {
    renderWithProviders(<Battlefield />);
    const mole = screen.getAllByTestId("mole")[2];

    act(() => {
      fireEvent.click(mole);
    });

    await waitFor(() => {
      expect(screen.getByText(/score: 10/i)).toBeInTheDocument();
    });
  });
});
