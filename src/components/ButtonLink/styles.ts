import styled from "styled-components";
import styles from "@/styles";

export default styled.button`
  border: 0;
  background: transparent;
  color: ${styles.colors.brown};
  cursor: pointer;
  font-family: ${styles.fonts.fontFamily.title};
  font-size: 0.875rem;
  transition: transform ${styles.transitions.default};
  transform: scaleX(1);

  &:hover {
    transform: scaleX(1.1);
  }

  @media (min-width: 1400px) {
    font-size: 1.25rem;
  }
`;
