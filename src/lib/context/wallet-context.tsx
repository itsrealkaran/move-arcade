import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

interface WalletContextType {
  wallet: WalletInfo | null;
  isConnecting: boolean;
  isInitialized: boolean;
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
interface AptosWallet {
  connect: (walletName: string) => Promise<WalletInfo>;
  disconnect: () => Promise<void>;
  isConnected: () => Promise<boolean>;
  account: () => Promise<WalletInfo>;
}

declare global {
  interface Window {
    aptos: AptosWallet;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        if (window.aptos) {
          // Check if wallet is already connected
          const isConnected = await window.aptos.isConnected();
          if (isConnected) {
            const response = await window.aptos.account();
            if (response) {
              setWallet(response);
            }
          }
        }
      } catch (error) {
        console.log("No existing wallet connection found");
      } finally {
        setIsInitialized(true);
      }
    };

    checkExistingConnection();
  }, []);

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
    isInitialized,
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
