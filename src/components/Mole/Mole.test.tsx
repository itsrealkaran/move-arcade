// import { renderWithProviders } from "@/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
// import Mole from ".";

describe("Battlefield", () => {
  it("Renders the correct amount of moles", () => {
    const mockFn = jest.fn();
    // const mockMole = { id: "testid", delay: 1, speed: 2 };
    // renderWithProviders(<Mole mole={mockMole} onMoleClick={mockFn} />);

    const mole = screen.getByTestId("mole");

    act(() => {
      fireEvent.click(mole);
    });

    screen.debug();

    expect(mockFn).toHaveBeenCalledTimes(1);
    // expect(mole).toHaveStyle(`transform: translate(0%, 100%);`);
  });
});
