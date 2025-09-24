import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface WalletContextType {
  wallet: WalletInfo | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

interface WalletInfo {
  address: string;
  publicKey: string;
  local: string;
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Extend Window interface to include Aptos
declare global {
  interface Window {
    aptos: any;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      if (!window.aptos) {
        throw new Error("Petra wallet is not installed");
      }
      const response = await window.aptos.connect("petra");
      setWallet(response);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await window.aptos.disconnect();
      setWallet(null);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      throw error;
    }
  }, []);

  const value = {
    wallet,
    isConnecting,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// Custom hook to use the wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
