import { useSelector } from "react-redux";
import { gameSelector } from "@/store/slices/game";
import { LivesContainer, LifeIcon, LivesText } from "./styles";

const Lives = () => {
  const { lives } = useSelector(gameSelector);

  return (
    <LivesContainer>
      <LivesText>Lives: {lives}</LivesText>
      {Array.from({ length: lives }, (_, index) => (
        <LifeIcon key={index}>❤️</LifeIcon>
      ))}
    </LivesContainer>
  );
};

export default Lives;
