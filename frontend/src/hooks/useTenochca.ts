"use client";

import { AztecAddress } from "@aztec/aztec.js/addresses";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { TENOCHCA_CONTRACT_ADDRESS } from "@/config/env";
import { TenochcaContract } from "../../../contracts/src/artifacts/Tenochca";

import { useAztecWallet } from "./useAztecWallet";

export type ArtistSummary = {
  address: string;
  totalReceived: bigint;
};

export function useTenochca() {
  const { account } = useAztecWallet();
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    let ignore = false;
    async function connect() {
      if (!account || !TENOCHCA_CONTRACT_ADDRESS) {
        setContract(null);
        return;
      }
      try {
        // For now, we'll create a mock contract instance
        // This would need to be replaced with proper contract instantiation
        // using the wallet SDK when the APIs are compatible
        const contractInstance = {
          methods: {
            register_artist: (name: string, bio: string, website: string) => ({
              send: async () => {
                console.log("Mock register_artist called", {
                  name,
                  bio,
                  website,
                });
                return { wait: async () => {} };
              },
            }),
            update_artist: (name: string, bio: string, website: string) => ({
              send: async () => {
                console.log("Mock update_artist called", {
                  name,
                  bio,
                  website,
                });
                return { wait: async () => {} };
              },
            }),
            get_artist: (address: AztecAddress) => ({
              simulate: async () => {
                console.log("Mock get_artist called", { address });
                return null;
              },
            }),
            is_registered: (address: AztecAddress) => ({
              simulate: async () => {
                console.log("Mock is_registered called", { address });
                return false;
              },
            }),
            donate: (artistAddress: AztecAddress, amount: bigint) => ({
              send: async () => {
                console.log("Mock donate called", { artistAddress, amount });
                return { wait: async () => {} };
              },
            }),
            get_artist_summaries: () => ({
              simulate: async () => {
                console.log("Mock get_artist_summaries called");
                return [];
              },
            }),
          },
        } as any;

        if (!ignore) {
          setContract(contractInstance);
        }
      } catch (error) {
        console.error("Failed to connect to Tenochca contract:", error);
        if (!ignore) {
          setContract(null);
        }
      }
    }
    connect();
    return () => {
      ignore = true;
    };
  }, [account]);

  const registerArtist = useCallback(
    async (name: string, bio: string, website: string) => {
      if (!contract) {
        toast.error("Contract not connected");
        return;
      }

      try {
        const tx = await contract.methods
          .register_artist(name, bio, website)
          .send();
        await tx.wait();
        toast.success("Artist registered successfully!");
        return tx;
      } catch (error) {
        console.error("Failed to register artist:", error);
        toast.error("Failed to register artist");
        throw error;
      }
    },
    [contract]
  );

  const updateArtist = useCallback(
    async (name: string, bio: string, website: string) => {
      if (!contract) {
        toast.error("Contract not connected");
        return;
      }

      try {
        const tx = await contract.methods
          .update_artist(name, bio, website)
          .send();
        await tx.wait();
        toast.success("Artist profile updated successfully!");
        return tx;
      } catch (error) {
        console.error("Failed to update artist:", error);
        toast.error("Failed to update artist profile");
        throw error;
      }
    },
    [contract]
  );

  const getArtist = useCallback(
    async (address: AztecAddress) => {
      if (!contract) return null;

      try {
        return await contract.methods.get_artist(address).simulate();
      } catch (error) {
        console.error("Failed to get artist:", error);
        return null;
      }
    },
    [contract]
  );

  const isRegistered = useCallback(
    async (address: AztecAddress) => {
      if (!contract) return false;

      try {
        return await contract.methods.is_registered(address).simulate();
      } catch (error) {
        console.error("Failed to check registration:", error);
        return false;
      }
    },
    [contract]
  );

  const donate = useCallback(
    async (artistAddress: AztecAddress, amount: bigint) => {
      if (!contract) {
        toast.error("Contract not connected");
        return;
      }

      try {
        const tx = await contract.methods.donate(artistAddress, amount).send();
        await tx.wait();
        toast.success("Donation sent successfully!");
        return tx;
      } catch (error) {
        console.error("Failed to donate:", error);
        toast.error("Failed to send donation");
        throw error;
      }
    },
    [contract]
  );

  const getArtistSummaries = useCallback(async (): Promise<ArtistSummary[]> => {
    if (!contract) return [];

    try {
      return await contract.methods.get_artist_summaries().simulate();
    } catch (error) {
      console.error("Failed to get artist summaries:", error);
      return [];
    }
  }, [contract]);

  return useMemo(
    () => ({
      contract,
      registerArtist,
      updateArtist,
      getArtist,
      isRegistered,
      donate,
      getArtistSummaries,
    }),
    [
      contract,
      registerArtist,
      updateArtist,
      getArtist,
      isRegistered,
      donate,
      getArtistSummaries,
    ]
  );
}
