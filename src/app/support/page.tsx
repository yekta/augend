import ScIcon from "@/components/icons/sc-icon";
import Logo from "@/components/navigation/logo";
import { LinkButton } from "@/components/ui/button";
import { sc, siteTitle, TScOption } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Support | ${siteTitle}`,
  description: "Reach out to us.",
};

type Props = {};

export default function Page({}: Props) {
  const platforms = (Object.keys(sc) as TScOption[]).map((s) => sc[s]);
  return (
    <div className="w-full px-4 flex-1 flex flex-col items-center justify-center pt-6 pb-[calc(6vh+2rem)]">
      <div className="flex flex-col rounded-xl max-w-[22rem] border p-5 pt-4.5 gap-5">
        <div className="w-full flex flex-col gap-1 text-center">
          <div className="w-full flex items-center justify-center pb-2">
            <Logo className="size-6" />
          </div>
          <h1 className="text-2xl font-bold leading-tight">Support</h1>
          <p className="text-muted-foreground leading-snug text-base text-balance">
            Reach out using the platforms below. We'll get back as soon as
            possible.
          </p>
        </div>
        <div className="w-full flex flex-col items-center gap-2">
          {platforms.map((platform) => (
            <LinkButton
              // @ts-ignore
              variant={platform.slug}
              className="w-full px-12"
              key={platform.slug}
              href={platform.siteHref}
              target="_blank"
            >
              <ScIcon
                className="size-6 absolute left-2.25 top-1/2 -translate-y-1/2"
                slug={platform.slug}
              />
              {platform.name}
            </LinkButton>
          ))}
        </div>
      </div>
    </div>
  );
}
