// Test Game component in isolation
import React from "react";
import { Leva, useControls } from "leva";
import { ThemeInitializer } from "./contexts/ThemeContext";
import { Game } from "./components/Game";

function TestGame() {
  const [{ autoplay }, set] = useControls(() => ({
    autoplay: false,
  }));

  return (
    <div style={{ width: "100vw", height: "100vh", background: "purple" }}>
      <Leva
        collapsed
        neverHide
        hideCopyButton
        hidden={false} // Always show for testing
      />
      <ThemeInitializer>
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "white",
            fontSize: "1rem",
            zIndex: 1000,
            background: "rgba(0,0,0,0.5)",
            padding: "10px",
          }}
        >
          Testing Game Component...
        </div>
        <Game autoplay={autoplay} />
      </ThemeInitializer>
    </div>
  );
}

export default TestGame;
