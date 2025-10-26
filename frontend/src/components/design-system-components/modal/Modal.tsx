import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import useModalFocusManager from "./useModalFocusManager";
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
  const { modalRef, closeButtonRef } = useModalFocusManager({
    isOpen,
    onDismiss,
    disableBackdropClose,
    isDismissDisabled,
  });

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
        tabIndex={-1}
        ref={modalRef}
      >
        <button
          type="button"
          className="modal__close-button"
          onClick={onDismiss}
          aria-label="Close dialog"
          ref={closeButtonRef}
        >
          <X aria-hidden="true" focusable="false" />
        </button>
        {children}
      </div>
    </div>
  );
};
export default Modal;
