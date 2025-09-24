import styled from "styled-components";

const Container = styled.div`
  position: relative;
  display: flex;
  height: 100vh;
  width: 100%;
  align-items: center;
  justify-content: center;
  background-color: black;
  font-family: 'Nunito', sans-serif;
`;

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-size: 70px 70px;
  background-image: linear-gradient(to right, #e4e4e7 1px, transparent 1px),
    linear-gradient(to bottom, #e4e4e7 1px, transparent 1px);

  @media (prefers-color-scheme: dark) {
    background-image: linear-gradient(to right, #262626 1px, transparent 1px),
      linear-gradient(to bottom, #262626 1px, transparent 1px);
  }
`;

const RadialMask = styled.div`
  pointer-events: none;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  mask-image: radial-gradient(ellipse at center, transparent 20%, black);

  @media (prefers-color-scheme: dark) {
    background-color: black;
  }
`;

const Text = styled.p`
  position: relative;
  z-index: 20;
  padding-top: 0rem;
  padding-bottom: 2rem;
  font-size: 1rem;
  font-weight: bold;
  background: linear-gradient(to bottom, #e5e5e5, #737373);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;

  @media (min-width: 640px) {
    font-size: 4.5rem;
  }
`;

export {
    Text,
    RadialMask,
    GridOverlay,
    Container
}