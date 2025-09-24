import { useWallet } from "@/lib/context/wallet-context";
import { toast } from "sonner";
import GameCard from "../../components/landing/GameCard";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Footer from "@/components/landing/footer";
import { GAMES } from "@/lib/constants";

export default function LandingGridNav() {
  const navigate = useNavigate();
  const { wallet, isConnecting, connect, disconnect } = useWallet();

  const handleWalletAction = async () => {
    try {
      if (wallet) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error: unknown) {
      console.error("Wallet action failed:", error);
      if (error instanceof Error) {
        if (error.message === "Petra wallet is not installed") {
          toast.error("Please install Petra wallet to continue");
        } else {
          toast.error(error.message);
        }
      }
    }
  };

  return (
    <div className="text-orange-50 min-h-screen w-full relative bg-gradient-to-b from-orange-400 to-orange-50 text-[#2E2E2E] flex flex-col items-center justify-between">
      <div className="absolute top-4 right-4 z-10">
        {wallet && (
          <motion.button
            onClick={handleWalletAction}
            className="px-4 py-2 text-sm border-gray-300 rounded-md shadow-sm bg-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Disconnect ({wallet.address.slice(0, 6)}...
            {wallet.address.slice(-4)})
          </motion.button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-4 flex-grow justify-center w-full max-w-7xl px-4">
        <motion.div
          layout
          className="custom-font mt-8 text-center p-2 flex justify-center items-center"
          animate={{
            width: wallet ? "40vw" : "60vw",
            height: wallet ? "20vh" : "40vh",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="space-y-4.5" >
            <h5 className="text-2xl custom-font font-bold">Move Arcade</h5>
            <h1 className="text-8xl font-extrabold">Gamifying Aptos</h1>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key="games-grid"
            className="border rounded-lg flex item-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              width: wallet ? "80vw" : "auto",
            }}
            transition={{ duration: 0.5 }}
          >
            {!wallet ? (
              <motion.button
                key="connect-button"
                onClick={handleWalletAction}
                disabled={isConnecting}
                className={`px-6 py-3 text-white rounded-lg ${
                  isConnecting
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#2E2E2E] hover:bg-gray-800"
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </motion.button>
            ) : (
              // game-tray
              <motion.div className="grid grid-cols-3 md:grid-cols-3 gap-6">
                {GAMES.map((game, index) => (
                  <GameCard game={game} index={index} navigate={navigate} />
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
