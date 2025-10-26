import { useCallback } from "react";
import useKeyboardActivation from "./useKeyboardActivation";

type UseEditableActivationOptions = {
  isDisabled?: boolean;
};

type InteractionProps =
  | {
      role: "button";
      tabIndex: 0;
    }
  | {
      role?: undefined;
      tabIndex: -1;
    };

const useEditableActivation = (
  onStartEditing: () => void,
  { isDisabled = false }: UseEditableActivationOptions = {}
) => {
  const { handleKeyDown } = useKeyboardActivation(onStartEditing, {
    isDisabled,
  });

  const handleDoubleClick = useCallback(() => {
    if (isDisabled) {
      return;
    }

    onStartEditing();
  }, [isDisabled, onStartEditing]);

  const interactionProps: InteractionProps = isDisabled
    ? { role: undefined, tabIndex: -1 }
    : { role: "button", tabIndex: 0 };

  return { handleDoubleClick, handleKeyDown, interactionProps };
};

export default useEditableActivation;
