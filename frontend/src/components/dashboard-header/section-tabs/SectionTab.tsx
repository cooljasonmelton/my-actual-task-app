import "./SectionTab.css";

const SectionTab = ({ text, count = 0 }: { text: string; count?: number }) => {
  return (
    <span className="section-tab-button">
      {text} <div className="section-tab-button-count">{count}</div>
    </span>
  );
};

export default SectionTab;
