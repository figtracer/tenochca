export const SANDBOX_URL =
  process.env.NEXT_PUBLIC_PXE_URL ?? "http://localhost:8080";

export const TENOCHCA_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_TENOCHCA_CONTRACT ?? "";

export const DEFAULT_DELAY_SECONDS = Number.parseInt(
  process.env.NEXT_PUBLIC_DEFAULT_DELAY_SECONDS ?? "300",
  10,
);

