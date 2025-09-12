import KeepAwakeButton from "./KeepAwakeButton";
import "./Navbar.css";

const HEADING_TEXT = "task app";

const Navbar = () => {
  return (
    <div className="nav-container">
      <h1>{HEADING_TEXT}</h1>
      <KeepAwakeButton />
    </div>
  );
};

export default Navbar;
