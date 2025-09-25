import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, User, Wallet } from "lucide-react";
import { useWallet } from "@/lib/context/wallet-context";

interface WalletPopupProps {
  onDisconnect: () => void;
}

export default function WalletPopup({ onDisconnect }: WalletPopupProps) {
  const { wallet } = useWallet();
  const [isHovered, setIsHovered] = useState(false);

  if (!wallet) return null;

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Mock balance - you can replace this with actual balance fetching logic
  const mockBalance = "1,234.56 APT";

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Default Button State */}
      <AnimatePresence>
        {!isHovered && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="px-4 py-2 text-sm border-gray-300 rounded-md shadow-sm bg-orange-100 text-orange-500 cursor-pointer"
          >
            <Wallet />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Popup State */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[240px] z-20"
          >
            {/* Username */}
            <motion.div
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <User className="w-4 h-4 text-gray-600" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Username</span>
                <span className="text-sm font-medium text-gray-800">
                  {formatAddress(wallet.address)}
                </span>
              </div>
            </motion.div>

            {/* Balance */}
            <motion.div
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Wallet className="w-4 h-4 text-gray-600" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">My Balance</span>
                <span className="text-sm font-medium text-gray-800">
                  {mockBalance}
                </span>
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="border-t border-gray-200 my-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            />

            {/* Disconnect Button */}
            <motion.button
              onClick={onDisconnect}
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-red-50 transition-colors w-full text-left text-orange-500"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
