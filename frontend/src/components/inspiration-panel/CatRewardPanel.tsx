type CatRewardPanelProps = {
  catGifUrl: string | null;
  isCatLoading: boolean;
  catError: string | null;
  onRetryCat: () => void;
};

const CatRewardPanel = ({
  catGifUrl,
  isCatLoading,
  catError,
  onRetryCat,
}: CatRewardPanelProps) => {
  if (!catGifUrl && !isCatLoading && !catError) {
    return null;
  }

  return (
    <div className="notes-panel__cat-reward">
      <div className="notes-panel__cat-header">
        <h3>CAT REWARD</h3>
        {catError && (
          <button
            type="button"
            className="notes-panel__cat-retry"
            onClick={onRetryCat}
          >
            Try again
          </button>
        )}
      </div>
      {isCatLoading ? (
        <div className="notes-panel__cat-loading">
          <span className="notes-panel__spinner" aria-hidden="true" />
          <span>loading cat gif…</span>
        </div>
      ) : catGifUrl ? (
        <img
          src={catGifUrl}
          alt="Celebratory cat gif"
          className="notes-panel__cat-image"
        />
      ) : null}
      {catError && (
        <p className="notes-panel__cat-error" role="alert">
          {catError}
        </p>
      )}
    </div>
  );
};

export default CatRewardPanel;
