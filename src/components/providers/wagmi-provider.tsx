"use client";

import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { WagmiProvider as WagmiProviderRaw } from "wagmi";
import { injected } from "@wagmi/connectors";

const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export default function WagmiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WagmiProviderRaw config={config}>{children}</WagmiProviderRaw>;
}
