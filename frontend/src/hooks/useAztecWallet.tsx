"use client";

import { AztecWalletSdk, obsidion } from "@nemi-fi/wallet-sdk";
import type { Eip6963ProviderInfo } from "@nemi-fi/wallet-sdk";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface AztecWalletContextType {
  sdk: AztecWalletSdk | null;
  account: any;
  isConnected: boolean;
  connecting: boolean;
  error: string | null;
  connectors: Eip6963ProviderInfo[];
  connectWallet: (providerUuid?: string) => Promise<void>;
  disconnectWallet: () => void;
}

const AztecWalletContext = createContext<AztecWalletContextType>({
  sdk: null,
  account: null,
  isConnected: false,
  connecting: false,
  error: null,
  connectors: [],
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
  const [connectors, setConnectors] = useState<Eip6963ProviderInfo[]>([]);

  // Initialize SDK on mount
  useEffect(() => {
    let isActive = true;

    const initSdk = async () => {
      try {
        const walletSdk = new AztecWalletSdk({
          aztecNode: process.env.NEXT_PUBLIC_PXE_URL || "http://localhost:8080",
          connectors: [obsidion()],
        });

        if (!isActive) {
          return;
        }

        setSdk(walletSdk);
        setConnectors([...walletSdk.connectors]);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize wallet SDK:", err);
        if (!isActive) {
          return;
        }
        setError(
          `Failed to initialize wallet SDK: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setConnectors([]);
      }
    };

    initSdk();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!sdk) {
      return;
    }

    const syncConnectors = () => {
      const next = [...sdk.connectors];
      setConnectors((prev) => {
        if (
          prev.length === next.length &&
          prev.every(
            (connector, index) =>
              connector.uuid === next[index]?.uuid &&
              connector.name === next[index]?.name &&
              connector.icon === next[index]?.icon
          )
        ) {
          return prev;
        }
        return next;
      });
    };

    syncConnectors();
    const interval = window.setInterval(syncConnectors, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [sdk]);

  const connectWallet = async (preferredProvider?: string) => {
    if (!sdk) {
      toast.error("Wallet SDK not initialized");
      return;
    }

    setConnecting(true);
    try {
      const waitForConnector = async (
        uuid: string,
        timeoutMs = 4000,
        intervalMs = 200
      ) => {
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
          const available = [...sdk.connectors];
          setConnectors(available);
          if (available.some((connector) => connector.uuid === uuid)) {
            return true;
          }
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }

        return false;
      };

      setConnectors([...sdk.connectors]);

      const candidates = Array.from(
        new Set(
          [
            preferredProvider,
            "azguard",
            "obsidion",
            ...sdk.connectors.map((connector) => connector.uuid),
          ].filter(Boolean) as string[]
        )
      );

      if (candidates.length === 0) {
        throw new Error("No wallet connectors available.");
      }

      let lastError: unknown;

      for (const providerUuid of candidates) {
        const hasConnector = sdk.connectors.some(
          (connector) => connector.uuid === providerUuid
        );

        if (!hasConnector) {
          const shouldWait = providerUuid === "azguard";
          const found = shouldWait
            ? await waitForConnector(providerUuid)
            : false;
          if (!found) {
            continue;
          }
        }

        try {
          await sdk.connect(providerUuid);
          const connectedAccount = await sdk.getAccount();
          setAccount(connectedAccount);
          setIsConnected(true);
          setError(null);
          const connectorName =
            sdk.connectors.find((connector) => connector.uuid === providerUuid)
              ?.name ?? providerUuid;
          toast.success(`Wallet connected via ${connectorName}`);
          return;
        } catch (err) {
          console.error(`Failed to connect wallet using ${providerUuid}:`, err);
          lastError = err;
        }
      }

      if (lastError instanceof Error) {
        throw lastError;
      }

      throw new Error(
        "No supported wallet connectors are available right now."
      );
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
    if (sdk) {
      void sdk
        .disconnect()
        .catch((err) => console.error("Failed to disconnect wallet:", err));
    }
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
        connectors,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </AztecWalletContext.Provider>
  );
};
