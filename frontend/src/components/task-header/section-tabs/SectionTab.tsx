import "./SectionTab.css";

const SectionTab = ({ text, count = 0 }: { text: string; count?: number }) => {
  return (
    <span className="section-tab">
      {text} <div className="section-tab-count">{count}</div>
    </span>
  );
};

export default SectionTab;
