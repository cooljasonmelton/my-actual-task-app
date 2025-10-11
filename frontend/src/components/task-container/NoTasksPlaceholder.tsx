import "./NoTasksPlaceholder.css";

const NoTasksPlaceholder = () => {
  return (
    <div className="card">
      <section className="task-empty-placeholder" aria-live="polite">
        <span className="task-empty-placeholder__icon" aria-hidden="true">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            role="img"
            focusable="false"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M8 4h8a2 2 0 0 1 1.995 1.85L18 6v2h1a1 1 0 0 1 .993.883L20 9v9a2 2 0 0 1-1.85 1.995L18 20H6a2 2 0 0 1-1.995-1.85L4 18V9a1 1 0 0 1 .883-.993L5 8h1V6a2 2 0 0 1 1.85-1.995L8 4Zm10 5H6v9h12V9ZM9 2h6a2 2 0 0 1 2 2v1H7V4a2 2 0 0 1 2-2Zm2 12v2H9v-2h2Zm4 0v2h-2v-2h2Zm-4-4v2H9v-2h2Zm4 0v2h-2v-2h2Z"
            />
          </svg>
        </span>
        <h3 className="empty-empty-placeholder__title">no tasks</h3>
      </section>
    </div>
  );
};

export default NoTasksPlaceholder;
