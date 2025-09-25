import styled from "styled-components";
import styles from "@/styles";
import BackgroundImage from "@assets/bg.png";
import PenguinHole from "@assets/pengu-hidden.png";

export const WelcomeContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  background: url(${BackgroundImage}) center / cover no-repeat;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  > * {
    position: relative;
    z-index: 2;
  }

  h1 {
    color: white;
    
    font-size: 3rem;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
    margin-bottom: 2rem;
    text-align: center;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: -20px;
      left: -60px;
      width: 40px;
      height: 30px;
      background: url(${PenguinHole}) center / contain no-repeat;
      z-index: 1;
    }

    &::after {
      content: "";
      position: absolute;
      top: -20px;
      right: -60px;
      width: 40px;
      height: 30px;
      background: url(${PenguinHole}) center / contain no-repeat;
      z-index: 1;
    }

    @media (min-width: 1400px) {
      font-size: 6rem;

      &::before {
        top: -40px;
        left: -120px;
        width: 80px;
        height: 60px;
      }

      &::after {
        top: -40px;
        right: -120px;
        width: 80px;
        height: 60px;
      }
    }
  }
`;

export const StartButton = styled.button`
  background: ${styles.colors["yellow-400"]};
  border: 3px solid white;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.6) 2px 4px 14px 4px;
  color: ${styles.colors.brown};
  cursor: pointer;
  
  font-size: 1.125rem;
  letter-spacing: 0.0625rem;
  margin-bottom: 5rem;
  padding: 0.75rem 1.625rem;
  transform: skew(8deg, 4deg) scale(1);
  transition: box-shadow ${styles.transitions.default},
    transform ${styles.transitions.default};

  span {
    transform: skew(-4deg, -2deg);
  }

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.6) 1px 1px 14px 1px;
    transform: skew(8deg, 4deg) scale(1.05);
  }

  @media (min-width: 1400px) {
    font-size: 1.375rem;
    padding: 1rem 2rem;
  }
`;

export const NameInput = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 70px;
  margin-bottom: 4.5rem;

  input {
    border: 2px solid ${styles.colors.brown};
    border-radius: 4px;
    box-shadow: none;
    
    font-size: 18px;
    align-self: flex-start;
    height: 50px;
    outline: none;
    padding: 8px 16px;
    transition: border-color ${styles.transitions.default};

    &:focus {
      border-color: ${styles.colors["yellow-400"]};
    }
  }

  button {
    height: 50px;
    width: 100%;

    &:first-child {
      &:hover {
        background-color: ${styles.colors.red};
        transform: skew(-8deg, -4deg);
      }
    }

    &:last-child {
      &:hover {
        background-color: ${styles.colors.blue};
        transform: skew(8deg, 4deg);
      }
    }
  }

  &.error {
    input {
      border-color: ${styles.colors.red};
    }
  }

  @media (min-width: 1400px) {
    flex-direction: row;
    align-items: baseline;

    button {
      width: 80px;
    }
  }
`;
