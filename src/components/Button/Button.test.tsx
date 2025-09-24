import { renderWithProviders } from "@/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import Button from ".";

describe("Battlefield", () => {
  it("Renders the correct amount of moles", () => {
    const mockFn = jest.fn();
    renderWithProviders(<Button onClick={mockFn} />);

    const button = screen.getByRole("button");

    act(() => {
      fireEvent.click(button);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
