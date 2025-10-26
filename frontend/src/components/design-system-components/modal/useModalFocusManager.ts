import { useEffect, useRef } from "react";

type UseModalFocusManagerOptions = {
  isOpen: boolean;
  onDismiss: () => void;
  disableBackdropClose?: boolean;
  isDismissDisabled?: boolean;
};

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const useModalFocusManager = ({
  isOpen,
  onDismiss,
  disableBackdropClose = false,
  isDismissDisabled = false,
}: UseModalFocusManagerOptions) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedElementRef = useRef<
    (HTMLElement | SVGElement) | null
  >(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !disableBackdropClose &&
        !isDismissDisabled
      ) {
        onDismiss();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const modalElement = modalRef.current;
      if (!modalElement) {
        return;
      }

      const focusableElements = Array.from(
        modalElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");

      if (focusableElements.length === 0) {
        event.preventDefault();
        modalElement.focus({ preventScroll: true });
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      const activeElement = document.activeElement as HTMLElement | null;

      if (!lastElement) {
        return;
      }

      if (event.shiftKey) {
        if (!activeElement || !modalElement.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus({ preventScroll: true });
          return;
        }

        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus({ preventScroll: true });
        }
        return;
      }

      if (!activeElement || !modalElement.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus({ preventScroll: true });
        return;
      }

      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, disableBackdropClose, isDismissDisabled, onDismiss]);

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

    const modalElement = modalRef.current;
    const closeButton = closeButtonRef.current;

    (closeButton ?? modalElement)?.focus({ preventScroll: true });

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

  return { modalRef, closeButtonRef };
};

export default useModalFocusManager;
