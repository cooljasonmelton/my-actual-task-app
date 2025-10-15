import Button from "../../design-system-components/button/Button";
import "./ConfirmationModalContent.css";

type ConfirmationModalContentProps = {
  titleId?: string;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoadingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
};

const ConfirmationModalContent = ({
  titleId,
  title,
  confirmLabel = "yes",
  cancelLabel = "no",
  confirmLoadingLabel,
  onConfirm,
  onCancel,
  isConfirming = false,
}: ConfirmationModalContentProps) => {
  const effectiveConfirmLabel =
    isConfirming && confirmLoadingLabel ? confirmLoadingLabel : confirmLabel;

  return (
    <div className="card">
      <div className="confirmation-modal">
        <h2 id={titleId} className="confirmation-modal__title">
          {title}
        </h2>
        <div className="confirmation-modal__actions">
          <Button
            type="button"
            size="small"
            variant="secondary"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {effectiveConfirmLabel}
          </Button>
          <Button
            type="button"
            size="small"
            variant="dark"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModalContent;
