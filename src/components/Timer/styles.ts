import styles from "@/styles";
import styled from "styled-components";

export const Countdown = styled.div`
  border: 2px solid white;
  border-radius: 4px;
  
  font-size: 0.875rem;
  padding: 8px 16px;
  text-align: center;
  width: 150px;

  @media (min-width: 1400px) {
    font-size: 1.25rem;
    width: 200px;
  }
`;
