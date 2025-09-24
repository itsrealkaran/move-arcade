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
      className="relative group bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
    >
      <div className="aspect-square relative">
        <img
          src={"https://placehold.co/600x400"}
          // src={game.image}
          alt={game.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        <motion.div
          className="absolute bottom-0 left-0 right-0 text-center p-3 bg-white/90"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800">
            {game.title}
          </h3>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GameCard;
