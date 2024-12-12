import Redirector from "@/app/(scl)/_components/redirector";
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
        <div className="w-full flex flex-col max-w-7xl px-5 md:px-10 gap-2 pt-6 pb-[calc(6vh+2rem)] items-center justify-center text-muted-foreground">
          <LoaderIcon className="size-10 animate-spin" />
          <h1 className="w-full text-base font-medium text-center leading-relaxed">
            Redirecting to
            <br />
            <span className="font-bold text-foreground text-4xl">
              {data.name}
            </span>
          </h1>
        </div>
      </div>
    </Redirector>
  );
}

const generateSclPage = (platform: TScOption) => {
  return {
    meta: getScMetadata(platform),
    Page: () => <ScPage platform={platform} />,
  };
};

export default generateSclPage;
