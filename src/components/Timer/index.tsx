import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { differenceInSeconds, parseISO } from "date-fns";
import { gameSelector } from "@/store/slices/game";
import { Countdown } from "./styles";

interface TimerProps {
  onTimesUp: () => void;
  gameTime: number;
}

const Timer = ({ onTimesUp, gameTime }: TimerProps) => {
  const { isPlaying, startedDate } = useSelector(gameSelector);
  const [timeLeft, setTimeLeft] = useState(gameTime);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const date = parseISO(startedDate!);
        const secondsPassed = differenceInSeconds(new Date(), date);
        const secondsLeft = gameTime - secondsPassed;

        if (secondsLeft <= 0) {
          clearInterval(interval);
          onTimesUp();
        }

        setTimeLeft(secondsLeft);

        return () => clearInterval(interval);
      }, 1000);
    }
  }, []);

  return <Countdown>time left: {timeLeft} seconds</Countdown>;
};

export default Timer;
