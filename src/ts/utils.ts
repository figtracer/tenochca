import { Wallet } from "@aztec/aztec.js/wallet";
import {
  TenochcaContract,
  TenochcaContractArtifact,
} from "../artifacts/Tenochca.js";
import { AztecAddress } from "@aztec/stdlib/aztec-address";
import { Contract } from "@aztec/aztec.js/contracts";

/**
 * Deploys the Counter contract.
 * @param deployer - The wallet to deploy the contract with.
 * @param owner - The address of the owner of the contract.
 * @returns A deployed contract instance.
 */
export async function deployTenochca(
  deployer: Wallet,
  owner: AztecAddress,
): Promise<TenochcaContract> {
  const deployerAddress = (await deployer.getAccounts())[0]!.item;
  const deployMethod = await Contract.deploy(
    deployer,
    TenochcaContractArtifact,
    [owner],
    "constructor",
  );
  const tx = await deployMethod.send({
    from: deployerAddress,
  });
  const contract = await tx.deployed();
  return contract as TenochcaContract;
}
