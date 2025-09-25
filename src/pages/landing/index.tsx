import { useWallet } from "@/lib/context/wallet-context";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import Footer from "@/components/landing/footer";
import GameTray from "@/components/landing/game-tray";
import WalletPopup from "@/components/landing/WalletPopup";
import Lottie from "lottie-react";
import { useState, useEffect, useRef } from "react";

export default function LandingGridNav() {
  const { wallet, isConnecting, isInitialized, connect, disconnect } =
    useWallet();
  const [lottieAnimation, setLottieAnimation] = useState(null);
  const [lottieAnimation2, setLottieAnimation2] = useState(null);
  const lottieRef = useRef<any>(null);
  const [isReversed, setIsReversed] = useState(false);

  useEffect(() => {
    fetch("/lottie.json")
      .then((response) => response.json())
      .then((data) => setLottieAnimation(data))
      .catch((error) =>
        console.error("Error loading lottie animation:", error)
      );
    fetch("/console.json")
      .then((response) => response.json())
      .then((data) => setLottieAnimation2(data))
      .catch((error) =>
        console.error("Error loading lottie animation:", error)
      );
  }, []);

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
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        {wallet && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <WalletPopup onDisconnect={handleWalletAction} />
            </motion.div>
          </>
        )}
      </div>

      <div className="flex relative flex-col items-center space-y-4 justify-center w-full px-4">
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
                      fontSize: wallet ? "2.5rem" : "6rem",
                    }
                  : {
                      fontSize: "2.5rem",
                    }
              }
              transition={{
                duration: isInitialized ? 0.5 : 0,
                ease: "easeInOut",
              }}
              className="custom-font font-extrabold"
            >
              Gamifying Aptos
            </motion.h1>
          </div>
        </motion.div>
        <div>
          {/* Lottie Animation 2 - Conditional positioning based on wallet connection */}
          {lottieAnimation2 && (
            <motion.div
              animate={
                wallet
                  ? {
                      position: "fixed",
                      bottom: "20px",
                      right: "20px",
                      scale: 0.8,
                    }
                  : {
                      position: "relative",
                      scale: 1,
                    }
              }
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={`z-30 ${wallet ? "fixed bottom-5 right-5" : "ml-7"}`}
            >
              <Lottie
                animationData={lottieAnimation2}
                loop={true}
                autoplay={true}
                className={`${
                  wallet ? "w-32 h-32" : "w-48 h-48"
                } transition-all duration-500`}
              />
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key="games-grid"
              className={`border-8 relative bg-white border-[#FFDFC4]/90 rounded-4xl flex item-center justify-center overflow-y-auto ${
                wallet ? "p-3" : "p-2"
              } game-tray`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={
                isInitialized
                  ? {
                      scale: 1,
                      opacity: 1,
                      width: wallet ? "75vw" : "auto",
                      height: wallet ? "63vh" : "auto",
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
      </div>
      {lottieAnimation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.0 }}
          className="w-44 h-44 absolute bottom-0 left-0 z-90"
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={lottieAnimation}
            loop={false}
            autoplay={true}
            onComplete={() => {
              if (lottieRef.current) {
                const newDirection = isReversed ? 1 : -1;
                setIsReversed(!isReversed);
                lottieRef.current.setDirection(newDirection);
                lottieRef.current.play();
              }
            }}
            className="w-full h-full"
          />
        </motion.div>
      )}
      <Footer />
    </div>
  );
}
