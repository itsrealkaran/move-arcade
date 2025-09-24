import { fetchRecords, leaderboardSelector } from "@/store/slices/leaderboard";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Title,
  LeaderboardContainer,
  Record,
  NoResult,
  RecordList,
} from "./styles";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch } from "@/store";

const Leaderboard = () => {
  const { leaderboard } = useSelector(leaderboardSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchRecords());
  }, []);

  return (
    <LeaderboardContainer>
      <Title>Leaderboard</Title>
      {leaderboard.length > 0 ? (
        <RecordList>
          {leaderboard.map(record => (
            <Record key={uuidv4()}>
              <p>{record.playerName}</p>
              <span>{record.score}</span>
            </Record>
          ))}
        </RecordList>
      ) : (
        <>
          <NoResult>There's nothing here!</NoResult>
        </>
      )}
      <Link to="/">go back</Link>
    </LeaderboardContainer>
  );
};

export default Leaderboard;
