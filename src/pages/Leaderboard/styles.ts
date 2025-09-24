import styles from "@/styles";
import styled from "styled-components";

export const Title = styled.h2`
  color: ${styles.colors.brown};
  
  font-size: 3rem;
  text-shadow: 5px 4px 2px ${styles.colors["yellow-400"]};
  margin-bottom: 2rem;

  @media (min-width: 1400px) {
    font-size: 4rem;
  }
`;

export const LeaderboardContainer = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  padding: 80px;
  flex-direction: column;
`;

export const RecordList = styled.ul`
  list-style: auto;
  margin-bottom: 5rem;
`;

export const Record = styled.li`
  justify-content: center;
  font-size: 1.625rem;
  margin-bottom: 1.25rem;

  p {
    display: inline-block;
    margin-right: 1.25rem;
  }

  span {
    color: ${styles.colors.brown};
  }

  &:first-child {
    font-size: 2.5rem;

    span {
      color: ${styles.colors.red};
    }
  }

  @media (min-width: 1400px) {
    &:first-child {
      font-size: 2.75rem;
    }
  }
`;

export const NoResult = styled.p`
  font-size: 1rem;
  margin-bottom: 5rem;

  @media (min-width: 1400px) {
    font-size: 1.375rem;
  }
`;
