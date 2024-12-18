import Redirector from "@/app/(sc)/_components/redirector";
import ScIcon from "@/components/icons/sc-icon";
import { sc, siteTitle, TScOption } from "@/lib/constants";

import { LoaderIcon } from "lucide-react";
import { Metadata } from "next";

function getScMetadata(platform: TScOption): Metadata {
  const data = sc[platform];
  return {
    title: `${data.name} | ${siteTitle}`,
    description: `Join us on ${data.name}.`,
  };
}

type Props = {
  platform: TScOption;
};

function ScPage({ platform }: Props) {
  const data = sc[platform];

  return (
    <Redirector platform={platform}>
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        <div className="w-full flex flex-col max-w-7xl px-5 md:px-10 gap-2 pt-4 pb-[calc(8vh+2rem)] items-center justify-center text-muted-foreground">
          <LoaderIcon className="size-8 animate-spin" />
          <h1 className="w-full flex flex-col gap-1 text-sm md:text-base font-medium text-center leading-tight">
            <span>Redirecting to</span>
            <span className="shrink min-w-0 inline-flex items-center justify-center text-foreground gap-2">
              <ScIcon
                slug={platform}
                className="size-7 md:size-9 shrink-0 -my-2"
              />
              <span className="font-bold shrink min-w-0 text-2xl md:text-3xl text-left">
                {data.name}
              </span>
            </span>
          </h1>
        </div>
      </div>
    </Redirector>
  );
}

const generateScPage = (platform: TScOption) => {
  return {
    meta: getScMetadata(platform),
    Page: () => <ScPage platform={platform} />,
  };
};

export default generateScPage;
