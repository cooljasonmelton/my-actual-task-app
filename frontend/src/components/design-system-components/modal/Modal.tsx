import {
  useEffect,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import "./Modal.css";

type ModalProps = {
  isOpen: boolean;
  onDismiss: () => void;
  children: ReactNode;
  disableBackdropClose?: boolean;
  isDismissDisabled?: boolean;
  labelledBy?: string;
  describedBy?: string;
};

const Modal = ({
  isOpen,
  onDismiss,
  children,
  disableBackdropClose = false,
  isDismissDisabled = false,
  labelledBy,
  describedBy,
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // TODO: move keydown logic to shared util or hook
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !disableBackdropClose &&
        !isDismissDisabled
      ) {
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, disableBackdropClose, isDismissDisabled, onDismiss]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      !disableBackdropClose &&
      !isDismissDisabled
    ) {
      onDismiss();
    }
  };

  return (
    <div
      className="modal__backdrop"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
