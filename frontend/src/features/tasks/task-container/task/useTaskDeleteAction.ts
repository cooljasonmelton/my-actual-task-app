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
  const [shouldDelete, setShouldDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!shouldDelete) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShouldDelete(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [shouldDelete]);

  useEffect(() => {
    if (isSoftDeleted) {
      setShouldDelete(false);
      setIsDeleting(false);
    }
  }, [isSoftDeleted]);

  const handleDeleteRequest = useCallback(async () => {
    if (isDeleting || isSoftDeleted) {
      return;
    }

    if (!shouldDelete) {
      setShouldDelete(true);
      return;
    }

    setIsDeleting(true);

    try {
      await onDelete(taskId);
    } catch (error) {
      console.error("Failed to delete task", error);
      setShouldDelete(false);
      setIsDeleting(false);
    }
  }, [isDeleting, isSoftDeleted, onDelete, shouldDelete, taskId]);

  return {
    shouldDelete,
    isDeleting,
    handleDeleteRequest,
  };
};

export default useTaskDeleteAction;
