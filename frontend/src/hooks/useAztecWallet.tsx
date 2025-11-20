"use client";

import { AztecWalletSdk, obsidion } from "@nemi-fi/wallet-sdk";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface AztecWalletContextType {
  sdk: AztecWalletSdk | null;
  account: any;
  isConnected: boolean;
  connecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const AztecWalletContext = createContext<AztecWalletContextType>({
  sdk: null,
  account: null,
  isConnected: false,
  connecting: false,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useAztecWallet = () => useContext(AztecWalletContext);

export const AztecWalletProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sdk, setSdk] = useState<AztecWalletSdk | null>(null);
  const [account, setAccount] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK on mount
  useEffect(() => {
    const initSdk = async () => {
      try {
        const walletSdk = new AztecWalletSdk({
          aztecNode: process.env.NEXT_PUBLIC_PXE_URL || "http://localhost:8080",
          connectors: [obsidion()],
        });
        setSdk(walletSdk);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize wallet SDK:", err);
        setError(
          `Failed to initialize wallet SDK: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    };

    initSdk();
  }, []);

  const connectWallet = async () => {
    if (!sdk) {
      toast.error("Wallet SDK not initialized");
      return;
    }

    setConnecting(true);
    try {
      await sdk.connect("obsidion");
      const connectedAccount = await sdk.getAccount();
      setAccount(connectedAccount);
      setIsConnected(true);
      setError(null);
      toast.success("Wallet connected");
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    // SDK disconnect logic would go here
    setAccount(null);
    setIsConnected(false);
    setError(null);
    toast.info("Wallet disconnected");
  };

  return (
    <AztecWalletContext.Provider
      value={{
        sdk,
        account,
        isConnected,
        connecting,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </AztecWalletContext.Provider>
  );
};
