import {
  useState,
  useRef,
  useEffect,
} from "react";

import { useChat } from "../../context/ChatContext";

import {
  FiPlus,
  FiFile,
  FiX,
} from "react-icons/fi";

import {
  LuImagePlus,
} from "react-icons/lu";

import {
  HiOutlineMicrophone,
} from "react-icons/hi2";

import {
  IoArrowUp,
} from "react-icons/io5";

import api from "../../api/client";

import "../../styles/input.css";


export default function MessageInput({
  disabled,
}) {

  const {
    sendMessage,
    isSending,
  } = useChat();


  // =========================================
  // STATES
  // =========================================

  const [
    message,
    setMessage,
  ] = useState("");


  const [
    showMenu,
    setShowMenu,
  ] = useState(false);


  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);


  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);


  const [
    isRecording,
    setIsRecording,
  ] = useState(false);


  const [
    isTranscribing,
    setIsTranscribing,
  ] = useState(false);


  const [
    isUploading,
    setIsUploading,
  ] = useState(false);


  const [
    isGeneratingImage,
    setIsGeneratingImage,
  ] = useState(false);


  const [
    isEditingImage,
    setIsEditingImage,
  ] = useState(false);


  const [
    isUploadingFile,
    setIsUploadingFile,
  ] = useState(false);


  // =========================================
  // REFS
  // =========================================

  const imageInputRef =
    useRef(null);


  const fileInputRef =
    useRef(null);


  const textareaRef =
    useRef(null);


  const mediaRecorderRef =
    useRef(null);


  const audioChunksRef =
    useRef([]);


  const imagePreviewRef =
    useRef(null);


  // =========================================
  // CLEANUP IMAGE PREVIEW
  // =========================================

  useEffect(() => {

    return () => {

      if (
        imagePreviewRef.current
      ) {

        URL.revokeObjectURL(
          imagePreviewRef.current
        );

      }

    };

  }, []);


  // =========================================
  // IMAGE GENERATION DETECTION
  // =========================================

  const isImageGenerationRequest =
    (text) => {

      const generationKeywords = [

        "generate image",

        "generate an image",

        "generate a picture",

        "create image",

        "create an image",

        "create a picture",

        "draw",

        "draw me",

        "draw an",

        "draw a",

        "make an image",

        "make a picture",

        "imagine",

        "generate",

        "create a photo",

        "create an illustration",

      ];


      const lowerText =
        text.toLowerCase();


      return generationKeywords.some(
        (keyword) =>
          lowerText.includes(
            keyword
          )
      );

    };


  // =========================================
  // IMAGE EDIT DETECTION
  // =========================================

  const isImageEditRequest =
    (text) => {

      const editKeywords = [

        "edit",

        "change",

        "remove",

        "add",

        "replace",

        "modify",

        "make the",

        "turn this",

        "transform",

      ];


      const lowerText =
        text.toLowerCase();


      return editKeywords.some(
        (keyword) =>
          lowerText.includes(
            keyword
          )
      );

    };


  // =========================================
  // TEXTAREA RESIZE
  // =========================================

  const autoResize =
    (e) => {

      const textarea =
        e.target;


      textarea.style.height =
        "auto";


      const newHeight =
        Math.min(
          textarea.scrollHeight,
          180
        );


      textarea.style.height =
        `${newHeight}px`;


      setMessage(
        textarea.value
      );

    };


  // =========================================
  // RESET INPUT
  // =========================================

  const resetInput =
    () => {

      setMessage("");

      setSelectedImage(null);

      setSelectedFile(null);

      setShowMenu(false);


      if (
        textareaRef.current
      ) {

        textareaRef.current.style.height =
          "24px";

      }

    };


  // =========================================
  // GENERATE IMAGE
  // =========================================

  const generateImage =
    async (
      prompt
    ) => {

      try {

        setIsGeneratingImage(
          true
        );


        console.log(
          "🎨 Generating image..."
        );


        const response =
          await api.post(
            "/image/generate",
            {
              prompt,

              sessionId:
                `session_${Date.now()}`,
            }
          );


        console.log(
          "🎨 Image generation response:",
          response.data
        );


        if (
          !response.data?.success
        ) {

          throw new Error(
            response.data?.message ||
            "Image generation failed"
          );

        }


        const imageUrl =
          response.data.imageUrl;


        if (
          !imageUrl
        ) {

          throw new Error(
            "No image was returned."
          );

        }


        // =====================================
        // SEND GENERATED IMAGE TO CHAT
        // =====================================

        await sendMessage(
          prompt,
          null,
          true,
          imageUrl
        );


        resetInput();


      } catch (error) {

        console.error(
          "❌ Image generation failed:",
          error.response?.data ||
          error.message
        );


        alert(
          error.response?.data?.message ||
          error.message ||
          "Image generation failed."
        );

      } finally {

        setIsGeneratingImage(
          false
        );

      }

    };


  // =========================================
  // EDIT IMAGE
  // =========================================

  const editImage =
    async (
      imageFile,
      prompt
    ) => {

      try {

        setIsEditingImage(
          true
        );


        const formData =
          new FormData();


        formData.append(
          "image",
          imageFile
        );


        formData.append(
          "prompt",
          prompt
        );


        formData.append(
          "sessionId",
          `session_${Date.now()}`
        );


        console.log(
          "✏️ Sending image for editing..."
        );


        const response =
          await api.post(
            "/image/edit",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );


        console.log(
          "✏️ Image edit response:",
          response.data
        );


        if (
          !response.data?.success
        ) {

          throw new Error(
            response.data?.message ||
            "Image editing failed"
          );

        }


        const imageUrl =
          response.data.imageUrl;


        if (
          !imageUrl
        ) {

          throw new Error(
            "No edited image was returned."
          );

        }


        await sendMessage(
          prompt,
          null,
          true,
          imageUrl
        );


        resetInput();


      } catch (error) {

        console.error(
          "❌ Image editing failed:",
          error.response?.data ||
          error.message
        );


        alert(
          error.response?.data?.message ||
          error.message ||
          "Image editing failed."
        );

      } finally {

        setIsEditingImage(
          false
        );

      }

    };


  // =========================================
  // UPLOAD IMAGE
  // =========================================

  const uploadImageToBackend =
    async (
      imageFile,
      caption
    ) => {

      try {

        setIsUploading(
          true
        );


        const formData =
          new FormData();


        formData.append(
          "image",
          imageFile
        );


        formData.append(
          "message",
          caption ||
          "📷 Image"
        );


        formData.append(
          "sessionId",
          `session_${Date.now()}`
        );


        console.log(
          "📤 Uploading image..."
        );


        const response =
          await api.post(
            "/image/upload",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );


        console.log(
          "✅ Image upload response:",
          response.data
        );


        if (
          !response.data?.success
        ) {

          throw new Error(
            response.data?.message ||
            "Image upload failed"
          );

        }


        return response.data;


      } catch (error) {

        console.error(
          "❌ Image upload failed:",
          error.response?.data ||
          error.message
        );


        throw error;


      } finally {

        setIsUploading(
          false
        );

      }

    };


  // =========================================
  // UPLOAD FILE
  // =========================================

  const uploadFileToBackend =
    async (
      file
    ) => {

      try {

        setIsUploadingFile(
          true
        );


        const formData =
          new FormData();


        formData.append(
          "file",
          file
        );


        formData.append(
          "sessionId",
          `session_${Date.now()}`
        );


        console.log(
          "📤 Uploading file:",
          file.name
        );


        const response =
          await api.post(
            "/file/upload",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );


        console.log(
          "✅ File upload response:",
          response.data
        );


        return response.data;


      } catch (error) {

        console.error(
          "❌ File upload failed:",
          error.response?.data ||
          error.message
        );


        throw error;


      } finally {

        setIsUploadingFile(
          false
        );

      }

    };


  // =========================================
  // SEND MESSAGE
  // =========================================

  const handleSend =
    async () => {

      const text =
        message.trim();


      if (

        (!text &&
          !selectedImage &&
          !selectedFile)

        ||

        disabled ||

        isRecording ||

        isTranscribing ||

        isSending ||

        isUploading ||

        isGeneratingImage ||

        isEditingImage ||

        isUploadingFile

      ) {

        return;

      }


      try {

        // =====================================
        // IMAGE SELECTED
        // =====================================

        if (
          selectedImage
        ) {

          // ===============================
          // EDIT IMAGE
          // ===============================

          if (
            text &&
            isImageEditRequest(
              text
            )
          ) {

            await editImage(
              selectedImage,
              text
            );

            return;

          }


          // ===============================
          // NORMAL IMAGE UPLOAD
          // ===============================

          const data =
            await uploadImageToBackend(
              selectedImage,
              text
            );


          await sendMessage(
            text ||
            "📷 Image uploaded",
            null,
            false,
            data.imageUrl
          );


          resetInput();

          return;

        }


        // =====================================
        // FILE SELECTED
        // =====================================

        if (
          selectedFile
        ) {

          const data =
            await uploadFileToBackend(
              selectedFile
            );


          await sendMessage(
            text ||
            `📎 ${selectedFile.name}`,
            null,
            false,
            data.fileUrl ||
            data.url ||
            null
          );


          resetInput();

          return;

        }


        // =====================================
        // IMAGE GENERATION
        // =====================================

        if (
          text &&
          isImageGenerationRequest(
            text
          )
        ) {

          await generateImage(
            text
          );

          return;

        }


        // =====================================
        // NORMAL TEXT MESSAGE
        // =====================================

        if (
          text
        ) {

          await sendMessage(
            text
          );


          resetInput();

        }


      } catch (error) {

        console.error(
          "❌ Failed to send:",
          error.response?.data ||
          error.message
        );


        alert(
          error.response?.data?.message ||
          error.message ||
          "Failed to send. Please try again."
        );

      }

    };


  // =========================================
  // ENTER TO SEND
  // =========================================

  const handleKeyDown =
    (e) => {

      if (

        e.key === "Enter" &&

        !e.shiftKey

      ) {

        e.preventDefault();

        handleSend();

      }

    };


  // =========================================
  // START RECORDING
  // =========================================

  const startRecording =
    async () => {

      try {

        if (

          disabled ||

          isTranscribing ||

          isSending ||

          isUploading

        ) {

          return;

        }


        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({
              audio: true,
            });


        const mediaRecorder =
          new MediaRecorder(
            stream
          );


        mediaRecorderRef.current =
          mediaRecorder;


        audioChunksRef.current =
          [];


        mediaRecorder.ondataavailable =
          (event) => {

            if (
              event.data.size > 0
            ) {

              audioChunksRef.current.push(
                event.data
              );

            }

          };


        mediaRecorder.onstop =
          async () => {

            stream
              .getTracks()
              .forEach(
                (track) =>
                  track.stop()
              );


            const audioBlob =
              new Blob(
                audioChunksRef.current,
                {
                  type:
                    mediaRecorder.mimeType ||
                    "audio/webm",
                }
              );


            if (
              audioBlob.size === 0
            ) {

              alert(
                "No audio was recorded."
              );

              return;

            }


            await transcribeAudio(
              audioBlob
            );

          };


        mediaRecorder.onerror =
          (event) => {

            console.error(
              "❌ Recording error:",
              event
            );


            setIsRecording(
              false
            );

          };


        mediaRecorder.start();


        setIsRecording(
          true
        );


        console.log(
          "🎤 Recording started"
        );


      } catch (error) {

        console.error(
          "❌ Microphone error:",
          error
        );


        alert(
          "Cupid needs microphone permission."
        );

      }

    };


  // =========================================
  // STOP RECORDING
  // =========================================

  const stopRecording =
    () => {

      const recorder =
        mediaRecorderRef.current;


      if (

        !recorder ||

        !isRecording

      ) {

        return;

      }


      if (
        recorder.state ===
        "recording"
      ) {

        recorder.stop();

      }


      setIsRecording(
        false
      );


      console.log(
        "🛑 Recording stopped"
      );

    };


  // =========================================
  // TOGGLE RECORDING
  // =========================================

  const toggleRecording =
    () => {

      if (
        isRecording
      ) {

        stopRecording();

      } else {

        startRecording();

      }

    };


  // =========================================
  // TRANSCRIBE AUDIO
  // =========================================

  const transcribeAudio =
    async (
      audioBlob
    ) => {

      try {

        setIsTranscribing(
          true
        );


        const formData =
          new FormData();


        formData.append(
          "audio",
          audioBlob,
          "voice-message.webm"
        );


        console.log(
          "📤 Sending audio..."
        );


        const response =
          await api.post(
            "/voice/transcribe",
            formData
          );


        const text =
          response.data?.text ||
          response.data?.transcript ||
          "";


        if (
          text.trim()
        ) {

          setMessage(
            text.trim()
          );


          setTimeout(
            () => {

              if (
                textareaRef.current
              ) {

                textareaRef.current.focus();


                textareaRef.current.style.height =
                  "auto";


                textareaRef.current.style.height =
                  `${Math.min(
                    textareaRef.current.scrollHeight,
                    180
                  )}px`;

              }

            },
            50
          );


        } else {

          alert(
            "Cupid couldn't understand the recording."
          );

        }


      } catch (error) {

        console.error(
          "❌ Transcription failed:",
          error.response?.data ||
          error.message
        );


        alert(
          error.response?.data?.message ||
          "Transcription failed."
        );

      } finally {

        setIsTranscribing(
          false
        );

      }

    };


  // =========================================
  // SELECT IMAGE
  // =========================================

  const handleImageUpload =
    (e) => {

      const file =
        e.target.files?.[0];


      if (
        !file
      ) {

        return;

      }


      if (

        !file.type.startsWith(
          "image/"
        )

      ) {

        alert(
          "Please select an image."
        );

        return;

      }


      if (

        file.size >

        10 * 1024 * 1024

      ) {

        alert(
          "Image must be smaller than 10MB."
        );

        return;

      }


      // Cleanup old preview

      if (
        imagePreviewRef.current
      ) {

        URL.revokeObjectURL(
          imagePreviewRef.current
        );

      }


      setSelectedImage(
        file
      );


      setSelectedFile(
        null
      );


      setShowMenu(
        false
      );


      e.target.value =
        "";

    };


  // =========================================
  // REMOVE IMAGE
  // =========================================

  const removeSelectedImage =
    () => {

      setSelectedImage(
        null
      );


      if (
        imagePreviewRef.current
      ) {

        URL.revokeObjectURL(
          imagePreviewRef.current
        );


        imagePreviewRef.current =
          null;

      }

    };


  // =========================================
  // SELECT FILE
  // =========================================

  const handleFileUpload =
    (e) => {

      const file =
        e.target.files?.[0];


      if (
        !file
      ) {

        return;

      }


      // 20MB frontend limit

      if (

        file.size >

        20 * 1024 * 1024

      ) {

        alert(
          "File must be smaller than 20MB."
        );

        return;

      }


      console.log(
        "📎 Selected file:",
        file
      );


      setSelectedFile(
        file
      );


      setSelectedImage(
        null
      );


      setShowMenu(
        false
      );


      e.target.value =
        "";

    };


  // =========================================
  // REMOVE FILE
  // =========================================

  const removeSelectedFile =
    () => {

      setSelectedFile(
        null
      );

    };


  // =========================================
  // IMAGE PREVIEW
  // =========================================

  let imagePreview =
    null;


  if (
    selectedImage
  ) {

    imagePreview =
      URL.createObjectURL(
        selectedImage
      );


    imagePreviewRef.current =
      imagePreview;

  }


  // =========================================
  // GLOBAL LOADING STATE
  // =========================================

  const isBusy =

    disabled ||

    isRecording ||

    isTranscribing ||

    isSending ||

    isUploading ||

    isGeneratingImage ||

    isEditingImage ||

    isUploadingFile;


  return (

    <div className="message-input-wrapper">


      {/* =====================================
          IMAGE PREVIEW
      ===================================== */}

      {selectedImage && (

        <div className="image-preview-inline">

          <div className="image-preview-thumb">

            <img
              src={imagePreview}
              alt="Selected"
            />


            <button
              type="button"
              onClick={
                removeSelectedImage
              }
              className="remove-image-btn"
            >

              <FiX />

            </button>

          </div>


          <div className="image-preview-text">

            <span>

              {message.trim()
                ? "Cupid will use your instructions with this image."
                : "Ask Cupid about or edit this image..."}

            </span>

          </div>

        </div>

      )}


      {/* =====================================
          FILE PREVIEW
      ===================================== */}

      {selectedFile && (

        <div className="image-preview-inline">

          <div className="image-preview-thumb">

            <FiFile />


            <button
              type="button"
              onClick={
                removeSelectedFile
              }
              className="remove-image-btn"
            >

              <FiX />

            </button>

          </div>


          <div className="image-preview-text">

            <span>

              📎 {selectedFile.name}

            </span>

          </div>

        </div>

      )}


      {/* =====================================
          INPUT BAR
      ===================================== */}

      <div className="message-input">


        {/* ATTACHMENT */}

        <div className="attachment-wrapper">

          <button
            type="button"
            className="input-icon"
            disabled={
              isBusy
            }
            onClick={() =>
              setShowMenu(
                (prev) =>
                  !prev
              )
            }
          >

            <FiPlus />

          </button>


          {showMenu &&

            !isBusy && (

              <div className="attachment-menu">


                <button
                  type="button"
                  onClick={() =>
                    imageInputRef.current?.click()
                  }
                >

                  <LuImagePlus />

                  <span>
                    Upload Image
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >

                  <FiFile />

                  <span>
                    Upload File
                  </span>

                </button>

              </div>

            )}

        </div>


        {/* TEXTAREA */}

        <textarea
          ref={textareaRef}
          className="message-textarea"
          rows="1"
          value={message}
          disabled={isBusy}
          placeholder={
            isRecording
              ? "Listening..."

              : isTranscribing
              ? "Transcribing..."

              : isUploading
              ? "Uploading image..."

              : isGeneratingImage
              ? "Generating image..."

              : isEditingImage
              ? "Editing image..."

              : isUploadingFile
              ? "Uploading file..."

              : selectedImage
              ? "Describe what Cupid should do with this image..."

              : selectedFile
              ? "Ask Cupid about this file..."

              : "Message Cupid..."
          }
          onChange={
            autoResize
          }
          onKeyDown={
            handleKeyDown
          }
        />


        {/* MICROPHONE */}

        <button
          type="button"
          className={
            isRecording
              ? "input-icon microphone-btn recording"
              : "input-icon microphone-btn"
          }
          disabled={
            isBusy &&
            !isRecording
          }
          title={
            isRecording
              ? "Stop recording"
              : "Voice message"
          }
          onClick={
            toggleRecording
          }
        >

          <HiOutlineMicrophone />

        </button>


        {/* SEND */}

        <button
          type="button"
          className={
            (
              message.trim() ||

              selectedImage ||

              selectedFile

            )

              ? "send-btn active"

              : "send-btn"
          }
          disabled={

            (

              !message.trim() &&

              !selectedImage &&

              !selectedFile

            )

            ||

            isBusy
          }
          onClick={
            handleSend
          }
        >

          <IoArrowUp />

        </button>


        {/* =====================================
            HIDDEN IMAGE INPUT
        ===================================== */}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={
            handleImageUpload
          }
        />


        {/* =====================================
            HIDDEN FILE INPUT
        ===================================== */}

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={
            handleFileUpload
          }
        />

      </div>

    </div>

  );

}