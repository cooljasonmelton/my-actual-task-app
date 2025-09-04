import { useState } from "react";
import "./Navbar.css";

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
    // <div className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
    <div className="nav-container">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-100">Tasks</h1>
          <div className="flex items-center gap-4">
            {/* TODO: move button to own comp */}
            <button
              onClick={handleKeepAwake}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                keepAwake
                  ? "bg-teal-400/20 text-teal-300 border border-teal-400/30"
                  : "bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500"
              }`}
            >
              {keepAwake ? "Stay Awake: ON" : "Keep Awake"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
