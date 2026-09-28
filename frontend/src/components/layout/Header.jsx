import { FaRobot } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";


export default function Header({ onMenuClick }) {
  return (
    <header className="chat-header">
      <button
        className="chat-menu-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <FiMenu />
      </button>

      <div className="logo">
        <FaRobot />
        <h2>Cupid AI</h2>
      </div>
    </header>
  );
}