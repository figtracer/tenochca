"use client";

import { Wallet } from "@aztec/aztec.js/wallet";
import { AztecAddress } from "@aztec/aztec.js/addresses";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";

import { usePXE } from "./usePXE";

type WalletContextType = {
  wallet: Wallet | null;
  walletAddress: AztecAddress | null;
  isConnected: boolean;
  connecting: boolean;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  walletAddress: null,
  isConnected: false,
  connecting: false,
  balance: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { pxe, isConnected: isPXEConnected, error: pxeError } = usePXE();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletAddress, setWalletAddress] = useState<AztecAddress | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (pxeError) {
      toast.error(pxeError);
    }
  }, [pxeError]);

  const connectWallet = useCallback(async () => {
    if (!pxe) {
      toast.error("PXE service not connected yet.");
      return;
    }

    setConnecting(true);
    try {
      // Check if browser has wallet extension (MetaMask, etc.)
      if (typeof window !== "undefined" && (window as any).ethereum) {
        // Request account access
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length === 0) {
          throw new Error("No accounts found");
        }

        // Convert Ethereum address to Aztec address format
        // Ethereum addresses are 20 bytes, Aztec addresses are 32 bytes
        // We'll pad the Ethereum address to create a valid Aztec address
        const ethAddress = accounts[0];
        const paddedAddress = ethAddress.padEnd(66, "0"); // Pad to 32 bytes (64 hex chars + 0x)

        // For now, create a mock wallet with the browser account
        // This would need to be replaced with proper Aztec wallet integration
        const mockWallet = {
          getAddress: () => AztecAddress.fromString(paddedAddress),
          // Add other required wallet methods as needed
        } as any;

        const address = mockWallet.getAddress();

        setWallet(mockWallet);
        setWalletAddress(address);
        setBalance("0");
        setIsConnected(true);
        localStorage.setItem("tenochca.walletConnected", "true");
        toast.success("Wallet connected");
      } else {
        throw new Error(
          "No wallet extension found. Please install MetaMask or another Ethereum wallet."
        );
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to connect wallet"
      );
    } finally {
      setConnecting(false);
    }
  }, [pxe]);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
    setWalletAddress(null);
    setIsConnected(false);
    setBalance(null);
    localStorage.removeItem("tenochca.walletConnected");
    toast.info("Wallet disconnected");
  }, []);

  // Removed auto-connection - wallet will only connect when user clicks connect button
  // useEffect(() => {
  //   const stored = localStorage.getItem("tenochca.walletConnected");
  //   if (stored === "true" && isPXEConnected && !wallet) {
  //     connectWallet();
  //   }
  // }, [connectWallet, isPXEConnected, wallet]);

  const value = useMemo(
    () => ({
      wallet,
      walletAddress,
      isConnected,
      connecting,
      balance,
      connectWallet,
      disconnectWallet,
    }),
    [
      wallet,
      walletAddress,
      isConnected,
      connecting,
      balance,
      connectWallet,
      disconnectWallet,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
