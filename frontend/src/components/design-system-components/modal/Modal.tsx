import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
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
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<(HTMLElement | SVGElement) | null>(
    null
  );
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

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

  // focus on X button on open and return to previous element on close
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLElement ||
      activeElement instanceof SVGElement
    ) {
      previouslyFocusedElementRef.current = activeElement;
    } else {
      previouslyFocusedElementRef.current = null;
    }

    const explicitCloseButton = closeButtonRef.current;
    if (explicitCloseButton) {
      explicitCloseButton.focus({ preventScroll: true });
    } else {
      const modalElement = modalRef.current;
      modalElement?.focus({ preventScroll: true });
    }

    return () => {
      const previouslyFocusedElement = previouslyFocusedElementRef.current;
      previouslyFocusedElementRef.current = null;
      if (!previouslyFocusedElement) {
        return;
      }
      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus({ preventScroll: true });
        return;
      }
      previouslyFocusedElement.focus();
    };
  }, [isOpen]);

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
