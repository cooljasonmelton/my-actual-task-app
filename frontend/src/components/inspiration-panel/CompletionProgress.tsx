import "./CompletionProgress.css";

type CompletionProgressProps = {
  count: number;
};

const CompletionProgress = ({ count }: CompletionProgressProps) => {
  return (
    <div className="completion-progress" aria-live="polite">
      <p className="completion-progress__label">COMPLETED</p>
      <p className="completion-progress__count">{count}</p>
    </div>
  );
};

export default CompletionProgress;
