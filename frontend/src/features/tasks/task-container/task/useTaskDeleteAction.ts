import { useCallback, useEffect, useState } from "react";

type DeleteSource = "checkbox" | "icon";

type UseTaskDeleteActionOptions = {
  taskId: number;
  onDelete: (taskId: number) => Promise<void>;
  isSoftDeleted: boolean;
  onDeleteSuccess?: (source: DeleteSource) => void;
};

const useTaskDeleteAction = ({
  taskId,
  onDelete,
  isSoftDeleted,
  onDeleteSuccess,
}: UseTaskDeleteActionOptions) => {
  const [confirmations, setConfirmations] = useState<
    Record<DeleteSource, boolean>
  >({
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

  const requestDelete = useCallback((source: DeleteSource) => {
    setConfirmations((previous) => {
      if (previous[source]) {
        return previous;
      }
      return {
        ...previous,
        [source]: true,
      };
    });
  }, []);

  const resetConfirmations = useCallback(() => {
    setConfirmations({ checkbox: false, icon: false });
  }, []);

  const executeDelete = useCallback(
    async (source: DeleteSource) => {
      setIsDeleting(true);

      try {
        await onDelete(taskId);
        resetConfirmations();
        onDeleteSuccess?.(source);
      } catch (error) {
        console.error("Failed to delete task", error);
        resetConfirmations();
      } finally {
        setIsDeleting(false);
      }
    },
    [onDelete, onDeleteSuccess, resetConfirmations, taskId]
  );

  const handleDeleteRequest = useCallback(
    async (source: DeleteSource) => {
      if (isDeleting || isSoftDeleted) {
        return;
      }

      if (!confirmations[source]) {
        requestDelete(source);
        return;
      }

      await executeDelete(source);
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
