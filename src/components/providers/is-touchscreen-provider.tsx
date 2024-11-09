"use client";

import { ReactNode, useEffect, useState } from "react";
import React, { createContext, useContext } from "react";

export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    function onResize() {
      const isTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.maxTouchPoints > 0;
      if (document && document.body) {
        document.body.classList.toggle("not-touch", !isTouch);
      }
      setIsTouchDevice(isTouch);
    }

    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return isTouchDevice;
}

const IsTouchscreenContext = createContext(false);

export const IsTouchscreenProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const isTouchDevice = useIsTouchDevice();
  return (
    <IsTouchscreenContext.Provider value={isTouchDevice}>
      {children}
    </IsTouchscreenContext.Provider>
  );
};

export const useIsTouchscreen = () => useContext(IsTouchscreenContext);
