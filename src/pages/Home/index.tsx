import { useSelector } from "react-redux";
import { gameSelector } from "@/store/slices/game";
import Battlefield from "@/components/Battlefield";
import Welcome from "@/components/Welcome";
import { HomeContainer } from "./styles";
import GlobalStyle from "@/styles/global";

const Home = () => {
  const { isPlaying } = useSelector(gameSelector);

  return (
    <HomeContainer>
      <GlobalStyle />

      {isPlaying ? <Battlefield /> : <Welcome />}
    </HomeContainer>
  );
};

export default Home;
