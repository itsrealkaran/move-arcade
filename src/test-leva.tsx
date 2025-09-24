// Test Leva controls in isolation
import React from "react";
import { Leva, useControls } from "leva";
import { ThemeInitializer } from "./contexts/ThemeContext";

function TestLeva() {
  const [{ autoplay }, set] = useControls(() => ({
    autoplay: false,
  }));

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "green",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "2rem",
      }}
    >
      <Leva
        collapsed
        neverHide
        hideCopyButton
        hidden={false} // Always show for testing
      />
      <ThemeInitializer>
        <div>Leva is working! Autoplay: {autoplay ? "ON" : "OFF"}</div>
      </ThemeInitializer>
    </div>
  );
}

export default TestLeva;
