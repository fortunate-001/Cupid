import { FaRobot, FaUserCircle } from "react-icons/fa";
import { useState } from "react";



export default function Header() {

  const [openSettings, setOpenSettings] =
    useState(false);

  return (

    <>

      <header className="chat-header">

        <div className="logo">

          <FaRobot />

          <h2>Cupid AI</h2>

        </div>

      

      </header>


    </>

  );

}