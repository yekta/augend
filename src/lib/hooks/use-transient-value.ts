import { useState, useEffect, useCallback } from "react";

type Props<T> = [T, (newValue: T) => void];

const useTransientValue = <T>(defaultValue: T, duration: number): Props<T> => {
  const [value, setValue] = useState<T>(defaultValue);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const setTransientValue = useCallback(
    (newValue: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setValue(newValue);

      const id = window.setTimeout(() => {
        setValue(defaultValue);
        setTimeoutId(null);
      }, duration);

      setTimeoutId(id);
    },
    [defaultValue, duration, timeoutId]
  );

  return [value, setTransientValue];
};

export default useTransientValue;
