"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useWindowSize } from "@uidotdev/usehooks";
import { useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  classNameFullScreenImage?: string;
};

const padding = 0;

export default function ImageWithFullscreen({
  className,
  classNameFullScreenImage,
  children,
  width,
  height,
  alt,
  ...rest
}: Props) {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [open, setOpen] = useState(false);
  const aspectRatio = width && height ? Number(width) / Number(height) : 1;
  const screenAspectRatio =
    windowWidth && windowHeight ? windowWidth / windowHeight : 1;

  let finalWidth: number | undefined = undefined;
  let finalHeight: number | undefined = undefined;

  if (windowWidth && windowHeight) {
    if (aspectRatio >= screenAspectRatio) {
      finalWidth = windowWidth - padding * 2;
      finalHeight = finalWidth / aspectRatio;
    } else {
      finalHeight = windowHeight - padding * 2;
      finalWidth = finalHeight * aspectRatio;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <img
          width={width}
          height={height}
          alt={alt}
          {...rest}
          className={cn("w-full h-auto cursor-zoom-in outline-none", className)}
        />
      </DialogTrigger>
      <DialogContent noYPadding noXPadding variant="styleless">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <img
          onClick={() => setOpen(false)}
          width={width}
          height={height}
          alt={alt}
          {...rest}
          style={{
            width: finalWidth,
            height: finalHeight,
          }}
          className={cn(
            "shadow-2xl shadow-shadow/[var(--opacity-shadow)] cursor-zoom-out",
            classNameFullScreenImage
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
