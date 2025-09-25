import { useWallet } from "@/lib/context/wallet-context";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import Footer from "@/components/landing/footer";
import GameTray from "@/components/landing/game-tray";
import WalletPopup from "@/components/landing/WalletPopup";

export default function LandingGridNav() {
  const { wallet, isConnecting, isInitialized, connect, disconnect } =
    useWallet();

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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <WalletPopup onDisconnect={handleWalletAction} />
          </motion.div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-4 justify-center w-full px-4">
        <motion.div
          layout
          className="custom-font mt-8 text-center p-2 flex justify-center items-center"
          animate={
            isInitialized
              ? {
                  width: wallet ? "40vw" : "60vw",
                  height: wallet ? "20vh" : "40vh",
                }
              : {
                  width: "40vw",
                  height: "20vh",
                }
          }
          transition={{ duration: isInitialized ? 0.5 : 0, ease: "easeInOut" }}
        >
          <div>
            <motion.h5
              animate={
                isInitialized
                  ? {
                      fontSize: wallet ? "1.25rem" : "1.5rem",
                    }
                  : {
                      fontSize: "1.25rem",
                    }
              }
              transition={{
                duration: isInitialized ? 0.5 : 0,
                ease: "easeInOut",
              }}
              className="text-2xl custom-font font-bold"
            >
              Move Arcade
            </motion.h5>
            <motion.h1
              animate={
                isInitialized
                  ? {
                      fontSize: wallet ? "2.5rem" : "5rem",
                    }
                  : {
                      fontSize: "2.5rem",
                    }
              }
              transition={{
                duration: isInitialized ? 0.5 : 0,
                ease: "easeInOut",
              }}
              className="text-2xl custom-font font-bold"
            >
              Gamifying Aptos
            </motion.h1>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key="games-grid"
            className={`border-8 bg-white border-[#FFDFC4]/90 rounded-4xl flex item-center justify-center overflow-y-auto ${
              wallet ? "p-3" : "p-0"
            } game-tray`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={
              isInitialized
                ? {
                    scale: 1,
                    opacity: 1,
                    width: wallet ? "75vw" : "auto",
                    height: wallet ? "60vh" : "auto",
                  }
                : {
                    scale: 1,
                    opacity: 1,
                    width: "auto",
                    height: "auto",
                  }
            }
            transition={{ duration: isInitialized ? 0.5 : 0 }}
          >
            {!wallet ? (
              <motion.button
                key="connect-button"
                onClick={handleWalletAction}
                disabled={isConnecting}
                className={`px-6 py-3 text-orange-400 text-lg font-bold rounded-lg ${
                  isConnecting ? "cursor-not-allowed" : ""
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </motion.button>
            ) : (
              <GameTray />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
