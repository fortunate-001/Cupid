import {
  FaImage,
  FaMicrophone,
  FaPaperPlane,
} from "react-icons/fa";


function MessageInput() {
  return (
    <div className="message-input">

      <button>
        <FaImage />
      </button>

      <button>
        <FaMicrophone />
      </button>

      <input
        type="text"
        placeholder="Message Cupid..."
      />

      <button className="send-btn">
        <FaPaperPlane />
      </button>

    </div>
  );
}

export default MessageInput;