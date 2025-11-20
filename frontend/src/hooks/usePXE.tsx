"use client";

import { createAztecNodeClient, type AztecNode } from "@aztec/aztec.js/node";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface PXEContextType {
  pxe: AztecNode | null;
  isConnected: boolean;
  connecting: boolean;
  accounts: string[];
  error: string | null;
  chainId: number | null;
  refreshAccounts: () => Promise<void>;
}

const PXEContext = createContext<PXEContextType>({
  pxe: null,
  isConnected: false,
  connecting: false,
  accounts: [],
  error: null,
  chainId: null,
  refreshAccounts: async () => {},
});

export const usePXE = () => useContext(PXEContext);

export const PXEProvider = ({ children }: { children: React.ReactNode }) => {
  const [pxe, setPXE] = useState<AztecNode | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  // Connect to PXE on component mount
  useEffect(() => {
    const connectToPXE = async () => {
      setConnecting(true);
      try {
        const pxeUrl =
          process.env.NEXT_PUBLIC_PXE_URL || "http://localhost:8080";
        const pxeClient = createAztecNodeClient(pxeUrl);

        // Get chain ID to confirm connection
        const nodeInfo = await pxeClient.getNodeInfo();
        console.log(`Connected to Aztec Node on chain ${nodeInfo.l1ChainId}`);

        setPXE(pxeClient);
        setChainId(Number(nodeInfo.l1ChainId));
        setIsConnected(true);

        // For now, skip loading accounts since the API has changed
        // This would need to be implemented based on the current Aztec.js version
        setAccounts([]);
        console.log(
          "Account loading skipped - API needs to be updated for current version"
        );

        setError(null);
      } catch (err) {
        console.error("Failed to connect to Aztec Node:", err);
        setError(
          `Failed to connect to Aztec Node: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        toast.error(
          "Failed to connect to Aztec Node service. Make sure Sandbox is running."
        );
      } finally {
        setConnecting(false);
      }
    };

    connectToPXE();
  }, []);

  const refreshAccounts = async () => {
    // Skip for now - API needs to be updated
    console.log(
      "refreshAccounts skipped - API needs to be updated for current version"
    );
  };

  return (
    <PXEContext.Provider
      value={{
        pxe,
        isConnected,
        connecting,
        accounts,
        error,
        chainId,
        refreshAccounts,
      }}
    >
      {children}
    </PXEContext.Provider>
  );
};
