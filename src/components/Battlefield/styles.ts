import styled from "styled-components";
import BackgroundImage from "@assets/bg.png";
import styles from "@/styles";

export const BattlefieldContainer = styled.section`
  background: url(${BackgroundImage}) center / cover no-repeat;
  height: 100%;
  position: relative;
`;

export const Field = styled.div`
  display: grid;
  height: 100%;
  padding: 18vh 10vw;
  grid-template-columns: 80px 80px 80px;
  gap: 50px 50px;
  justify-content: center;
  cursor: url('/src/assets/hammer.png'), auto;

  @media (min-width: 1400px) {
    grid-template-columns: 180px 180px 180px;
    gap: 50px 150px;
    padding: 10vh 10vw;
  }
`;

export const Score = styled.div`
  border: 2px solid white;
  border-radius: 4px;
  
  font-size: 0.875rem;
  padding: 8px 16px;
  text-align: center;
  width: 90px;

  @media (min-width: 1400px) {
    font-size: 1.25rem;
    width: 140px;
  }
`;
