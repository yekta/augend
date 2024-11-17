import UniswapPositionCard from "@/components/cards/uniswap-position-card";
import {
  TUniswapNetwork,
  UniswapNetworkSchema,
} from "@/trpc/api/routers/uniswap/types";
import React from "react";

const items: { id: number; network: TUniswapNetwork }[] = (
  process.env.UNISWAP_POSITIONS || ""
)
  .split(",")
  .map((i) => {
    const [network, id] = i.split(":");
    return {
      id: Number(id),
      network: UniswapNetworkSchema.parse(network),
    };
  });

export default function UniswapPositions() {
  return (
    <div className="w-full flex flex-col">
      {items.map((item, index) => (
        <UniswapPositionCard
          key={`${item.id}-${item.network}-${index}`}
          id={item.id}
          network={item.network}
        />
      ))}
    </div>
  );
}
