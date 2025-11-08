import { useCallback, useEffect, useState } from "react";

type UseTaskDeleteActionOptions = {
  taskId: number;
  onDelete: (taskId: number) => Promise<void>;
  isSoftDeleted: boolean;
};

const useTaskDeleteAction = ({
  taskId,
  onDelete,
  isSoftDeleted,
}: UseTaskDeleteActionOptions) => {
  const [confirmations, setConfirmations] = useState({
    checkbox: false,
    icon: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!confirmations.checkbox && !confirmations.icon) {
      return;
    }

    const timer = window.setTimeout(() => {
      setConfirmations({ checkbox: false, icon: false });
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [confirmations.checkbox, confirmations.icon]);

  useEffect(() => {
    if (isSoftDeleted) {
      setConfirmations({ checkbox: false, icon: false });
      setIsDeleting(false);
    }
  }, [isSoftDeleted]);

  const requestDelete = useCallback(
    (source: "checkbox" | "icon") => {
      setConfirmations((previous) => {
        const currentConfirmation = previous[source];
        if (currentConfirmation) {
          return previous;
        }
        return {
          ...previous,
          [source]: true,
        };
      });
    },
    []
  );

  const resetConfirmations = useCallback(() => {
    setConfirmations({ checkbox: false, icon: false });
  }, []);

  const executeDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      await onDelete(taskId);
    } catch (error) {
      console.error("Failed to delete task", error);
      resetConfirmations();
      setIsDeleting(false);
    }
  }, [onDelete, resetConfirmations, taskId]);

  const handleDeleteRequest = useCallback(
    async (source: "checkbox" | "icon") => {
      if (isDeleting || isSoftDeleted) {
        return;
      }

      if (!confirmations[source]) {
        requestDelete(source);
        return;
      }

      await executeDelete();
    },
    [confirmations, executeDelete, isDeleting, isSoftDeleted, requestDelete]
  );

  const shouldDeleteFromCheckbox = confirmations.checkbox;
  const shouldDeleteFromIcon = confirmations.icon;

  return {
    shouldDeleteFromCheckbox,
    shouldDeleteFromIcon,
    isDeleting,
    handleDeleteRequest,
  };
};

export default useTaskDeleteAction;
