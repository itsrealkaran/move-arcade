import { MoveUpRight } from "lucide-react";
import { motion } from "motion/react";

interface GameCardProps {
  game: {
    id: string;
    title: string;
    image: string;
    path: string;
  };
  index: number;
  navigate: (path: string) => void;
}

const GameCard = ({ game, index, navigate }: GameCardProps) => {
  return (
    <motion.div
      key={game.id}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: "backOut",
      }}
      onClick={() => navigate(game.path)}
      className="relative p-2 group rounded-3xl shadow-lg cursor-pointer group hover:scale-101 hover:shadow-xl transition-all duration-300 ease-in-out"
    >
      <div className="relative">
        <img
          src={"https://placehold.co/350x250"}
          alt={game.title}
          className="w-full h-full object-cover rounded-2xl"
          loading="lazy"
        />

        <motion.div
          className="p-3 bg-white/90 flex items-center justify-between"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800">{game.title}</h3>
          <div className="bg-orange-200 group-hover:bg-orange-400 rounded-full p-2 transition-all duration-300 ease-in-out">
            <MoveUpRight className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GameCard;
