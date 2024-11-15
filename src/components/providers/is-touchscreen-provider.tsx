"use client";

import { ReactNode, useEffect, useState } from "react";
import React, { createContext, useContext } from "react";

function detectTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(detectTouchDevice());

  useEffect(() => {
    function onResize() {
      const isTouch = detectTouchDevice();
      if (document && document.body) {
        document.body.classList.toggle("not-touch", !isTouch);
      }
      setIsTouchDevice(isTouch);
    }

    // Add a small debounce to avoid excessive state updates on rapid resizes
    const debounceTimeout = 200;
    let timeoutId: NodeJS.Timeout | null = null;

    const debouncedResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(onResize, debounceTimeout);
    };

    window.addEventListener("resize", debouncedResize);
    onResize();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedResize);
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
