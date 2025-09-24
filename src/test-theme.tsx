// Test ThemeContext in isolation
import React from "react";
import { ThemeInitializer } from "./contexts/ThemeContext";

function TestTheme() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "blue",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "2rem",
      }}
    >
      <ThemeInitializer>
        <div>ThemeContext is working!</div>
      </ThemeInitializer>
    </div>
  );
}

export default TestTheme;
