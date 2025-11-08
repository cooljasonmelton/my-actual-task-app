import "./SectionTab.css";

const SectionTab = ({
  text,
  count = 0,
  isDropTarget = false,
  isDragActive = false,
  showCount = true,
}: {
  text: string;
  count?: number;
  isDropTarget?: boolean;
  isDragActive?: boolean;
  showCount?: boolean;
}) => {
  const className = `section-tab-button${
    isDragActive ? " section-tab-button--drag-active" : ""
  }${isDropTarget ? " section-tab-button--drop-target" : ""}`;

  return (
    <span className={className}>
      {text}
      {showCount && (
        <div className="section-tab-button-count">{count}</div>
      )}
    </span>
  );
};

export default SectionTab; 
