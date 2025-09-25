import { GAMES } from "@/lib/constants";
import GameCard from "./GameCard";
import { useNavigate } from "react-router-dom";

const GameTray = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
      {GAMES.map((game, index) => (
        <GameCard game={game} index={index} navigate={navigate} />
      ))}
    </div>
  );
};

export default GameTray;
