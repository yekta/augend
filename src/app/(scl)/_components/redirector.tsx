"use client";

import { sc, TScOption } from "@/lib/constants";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  platform: TScOption;
};

export default function Redirector({ children, platform }: Props) {
  const redirect = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    window.location.href = sc[platform].href;
  };
  useEffect(() => {
    redirect();
  }, []);

  return children;
}
