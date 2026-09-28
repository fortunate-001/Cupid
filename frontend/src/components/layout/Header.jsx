// src/components/layout/Header.jsx
import { FaRobot } from "react-icons/fa";

export default function Header() {
  return (
    <header className="chat-header">
      <div className="logo">
        <FaRobot />
        <h2>Cupid AI</h2>
      </div>
    </header>
  );
}