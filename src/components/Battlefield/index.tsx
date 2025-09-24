import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { BattlefieldContainer, Field, Score } from "./styles";
import Mole from "../Mole";
import { gsap } from "gsap";
import ButtonLink from "../ButtonLink";
import Header from "../Header";
import { incrementScore, loseLife, setIsPlaying } from "@/store/slices/game";
import { useAppDispatch } from "@/store";
import { useSelector } from "react-redux";
import Lives from "../Lives";
import FinalScore from "../FinalScore";
import gameConfig from "@gameconfig/index";

export interface MoleType {
  id: string;
  delay: number;
  speed: number;
}

const Battlefield = () => {
  const dispatch = useAppDispatch();
  const { lives, score } = useSelector((state: any) => state.gameReducer);

  const [molesArray, setMoles] = useState<MoleType[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const onMoleClick = () => {
    dispatch(incrementScore(gameConfig.INCREMENT_SCORE_BY));
  };

  const onEmptyHoleClick = () => {
    dispatch(loseLife());
  };

  useEffect(() => {
    const molesArray = Array.from(Array(gameConfig.MOLES_COUNT).keys()).map(
      () => ({
        delay: gsap.utils.random(0.1, 0.3),
        id: uuidv4(),
        speed: gsap.utils.random(0.05, 0.2),
      })
    );

    setMoles(molesArray);
  }, []);

  const handleGoBack = () => {
    dispatch(setIsPlaying(false));
  };

  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true);
    }
  }, [lives]);

  return (
    <BattlefieldContainer data-testid="battlefield">
      {!gameOver ? (
        <>
          <Header>
            <ButtonLink onClick={handleGoBack}>back</ButtonLink>
            <Lives />
            <Score>score: {score}</Score>
          </Header>
          <Field data-testid="field">
            {molesArray.map((mole, index) => (
              <Mole 
                key={index} 
                mole={mole} 
                onMoleClick={onMoleClick}
                onEmptyHoleClick={onEmptyHoleClick}
              />
            ))}
          </Field>
        </>
      ) : (
        <FinalScore score={score} />
      )}
    </BattlefieldContainer>
  );
};

export default Battlefield;
