// Minimal test version to debug the white screen
import React from "react";

function TestApp() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "red",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "2rem",
      }}
    >
      Test Stack App - If you see this, React is working!
    </div>
  );
}

export default TestApp;
