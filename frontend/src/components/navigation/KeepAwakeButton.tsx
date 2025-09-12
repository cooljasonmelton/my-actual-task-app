import Button from "../design-system-components/button/Button";
import useKeepAwakeApi from "./useKeepAwakeApi";

const KeepAwakeButton = () => {
  const { requestWakeLock, releaseWakeLock, isActive } = useKeepAwakeApi();

  const handleKeepAwake = () => {
    if (!isActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  };
  return (
    <>
      <Button
        variant={isActive ? "danger" : "secondary"}
        size="small"
        onClick={handleKeepAwake}
        className="keep-awake-btn"
      >
        {isActive ? "Stay Awake: ON" : "Keep Awake"}
      </Button>
    </>
  );
};

export default KeepAwakeButton;
