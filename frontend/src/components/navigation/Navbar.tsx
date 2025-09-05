import { useState } from "react";
import Button from "../design-system-components/button/Button";
import "./Navbar.css";

const HEADING_TEXT = "task app";

const Navbar = () => {
  const [keepAwake, setKeepAwake] = useState(false);

  const handleKeepAwake = () => {
    setKeepAwake(!keepAwake);
    // TODO: set up screen wake
    if (!keepAwake) {
      console.log("Requesting wake lock...");
    } else {
      console.log("Releasing wake lock...");
    }
  };
  return (
    <div className="nav-container">
      <h1>{HEADING_TEXT}</h1>
      <Button
        variant={keepAwake ? "danger" : "secondary"}
        size="small"
        onClick={handleKeepAwake}
        className="keep-awake-btn"
      >
        {keepAwake ? "Stay Awake: ON" : "Keep Awake"}
      </Button>
    </div>
  );
};

export default Navbar;
