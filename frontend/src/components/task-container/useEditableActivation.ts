import { useCallback, type KeyboardEvent } from "react";

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
  const handleDoubleClick = useCallback(() => {
    if (isDisabled) {
      return;
    }

    onStartEditing();
  }, [isDisabled, onStartEditing]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (isDisabled) {
        return;
      }

      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      onStartEditing();
    },
    [isDisabled, onStartEditing]
  );

  const interactionProps: InteractionProps = isDisabled
    ? { role: undefined, tabIndex: -1 }
    : { role: "button", tabIndex: 0 };

  return { handleDoubleClick, handleKeyDown, interactionProps };
};

export default useEditableActivation;
