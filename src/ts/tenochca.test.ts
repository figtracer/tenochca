import { TenochcaContract } from "../artifacts/Tenochca.js";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TestWallet } from "@aztec/test-wallet/server";
import { createAztecNodeClient } from "@aztec/aztec.js/node";
import { TxStatus } from "@aztec/stdlib/tx";
import { AztecAddress } from "@aztec/stdlib/aztec-address";
import {
  INITIAL_TEST_ACCOUNT_SALTS,
  INITIAL_TEST_ENCRYPTION_KEYS,
  INITIAL_TEST_SECRET_KEYS,
} from "@aztec/accounts/testing";
import { deployTenochca } from "./utils.js";

const SANDBOX_URL = "http://localhost:8080";
const DONATION_AMOUNT = 100n;
const ADDITIONAL_DONATION = 45n;
const ZERO_AMOUNT = 0n;
const TEST_TIMEOUT = 120_000;

describe(
  "Tenochca Contract",
  () => {
    let wallet: TestWallet;
    let ownerAddress: AztecAddress;
    let primaryArtist: AztecAddress;
    let donor: AztecAddress;
    let tenochca: TenochcaContract;

    const registerArtist = async (artist: AztecAddress) =>
      tenochca.methods.register_profile().send({ from: artist }).wait();

    const donate = async (artist: AztecAddress, amount: bigint) =>
      tenochca.methods.donate(artist, amount).send({ from: donor }).wait();

    const readTotal = async (artist: AztecAddress) =>
      tenochca.methods
        .get_total_received(artist)
        .simulate({ from: donor })
        .then((result) =>
          Array.isArray(result) ? (result[0] as bigint) : (result as bigint),
        );

    const isRegistered = async (artist: AztecAddress) =>
      tenochca.methods.is_registered(artist).simulate({ from: donor });

    beforeAll(async () => {
      const aztecNode = await createAztecNodeClient(SANDBOX_URL, {});
      wallet = await TestWallet.create(
        aztecNode,
        {
          dataDirectory: "pxe-test",
          proverEnabled: false,
        },
        {},
      );

      const baseManagers = await Promise.all(
        INITIAL_TEST_SECRET_KEYS.slice(0, 3).map(async (secret, index) =>
          wallet.createSchnorrAccount(
            secret,
            INITIAL_TEST_ACCOUNT_SALTS[index],
            INITIAL_TEST_ENCRYPTION_KEYS[index],
          ),
        ),
      );

      const [ownerManager, primaryManager, donorManager] = baseManagers;
      ownerAddress = ownerManager.address;
      primaryArtist = primaryManager.address;
      donor = donorManager.address;
    }, TEST_TIMEOUT);

    beforeEach(async () => {
      tenochca = await deployTenochca(wallet, ownerAddress);
    });

    it(
      "deploys with the expected owner",
      async () => {
        const ownerOnChain = await tenochca.methods
          .get_owner()
          .simulate({ from: donor });
        expect(ownerOnChain).toStrictEqual(ownerAddress);
      },
      TEST_TIMEOUT,
    );

    it(
      "allows a registered artist to receive donations",
      async () => {
        const registrationReceipt = await registerArtist(primaryArtist);
        expect(registrationReceipt.status).toBe(TxStatus.SUCCESS);

        const donationReceipt = await donate(primaryArtist, DONATION_AMOUNT);
        expect(donationReceipt.status).toBe(TxStatus.SUCCESS);

        const total = await readTotal(primaryArtist);
        expect(total).toBe(DONATION_AMOUNT);
      },
      TEST_TIMEOUT,
    );
    it(
      "rejects duplicate artist registrations",
      async () => {
        await registerArtist(primaryArtist);
        await expect(registerArtist(primaryArtist)).rejects.toThrowError();

        const registrationStatus = await isRegistered(primaryArtist);
        expect(registrationStatus).toBe(true);
      },
      TEST_TIMEOUT,
    );

    it(
      "prevents donations to unregistered artists",
      async () => {
        const randomArtist = await AztecAddress.random();
        await expect(
          donate(randomArtist, DONATION_AMOUNT),
        ).rejects.toThrowError();

        const total = await readTotal(randomArtist);
        expect(total).toBe(0n);
      },
      TEST_TIMEOUT,
    );

    it(
      "accumulates multiple donations for the same artist",
      async () => {
        await registerArtist(primaryArtist);
        await donate(primaryArtist, DONATION_AMOUNT);
        await donate(primaryArtist, ADDITIONAL_DONATION);

        const total = await readTotal(primaryArtist);
        expect(total).toBe(DONATION_AMOUNT + ADDITIONAL_DONATION);
      },
      TEST_TIMEOUT,
    );

    it(
      "rejects zero-value donations",
      async () => {
        await registerArtist(primaryArtist);
        await expect(donate(primaryArtist, ZERO_AMOUNT)).rejects.toThrowError();

        const total = await readTotal(primaryArtist);
        expect(total).toBe(0n);
      },
      TEST_TIMEOUT,
    );

    it(
      "exposes artist registration status via view",
      async () => {
        const before = await isRegistered(primaryArtist);
        expect(before).toBe(false);

        await registerArtist(primaryArtist);

        const after = await isRegistered(primaryArtist);
        expect(after).toBe(true);
      },
      TEST_TIMEOUT,
    );
  },
  TEST_TIMEOUT,
);
