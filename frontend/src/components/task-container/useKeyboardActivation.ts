import { useCallback } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

type UseKeyboardActivationOptions = {
  keys?: string[];
  isDisabled?: boolean;
};

const DEFAULT_KEYS = ["Enter", " "];

const useKeyboardActivation = (
  onActivate: () => void,
  { keys = DEFAULT_KEYS, isDisabled = false }: UseKeyboardActivationOptions = {}
) => {
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<Element>) => {
      if (isDisabled) {
        return;
      }

      if (!keys.includes(event.key)) {
        return;
      }

      event.preventDefault();
      onActivate();
    },
    [isDisabled, keys, onActivate]
  );

  return { handleKeyDown };
};

export default useKeyboardActivation;
