import {
  useEffect,
  useRef,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import {
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  LuCopy,
  LuCheck,
  LuVolume2,
  LuVolumeX,
  LuLoader,
} from "react-icons/lu";

import api from "../../api/client";


export default function MessageBubble({
  sender,
  text,
  isImage,
  imageUrl,
}) {

  const [
    copied,
    setCopied,
  ] = useState(false);


  const [
    isSpeaking,
    setIsSpeaking,
  ] = useState(false);


  const [
    isLoadingSpeech,
    setIsLoadingSpeech,
  ] = useState(false);


  // =========================================
  // VOICE PREFERENCE
  // =========================================

  const [
    voicePreference,
    setVoicePreference,
  ] = useState(
    () =>
      localStorage.getItem(
        "cupidVoicePreference"
      ) || "female"
  );


  const audioRef =
    useRef(null);


  // =========================================
  // LISTEN FOR VOICE SETTINGS CHANGE
  // =========================================

  useEffect(() => {

    const handleVoiceChange =
      (event) => {

        const voice =
          event.detail;


        if (
          voice === "male" ||
          voice === "female"
        ) {

          setVoicePreference(
            voice
          );

        }

      };


    window.addEventListener(
      "cupidVoiceChanged",
      handleVoiceChange
    );


    return () => {

      window.removeEventListener(
        "cupidVoiceChanged",
        handleVoiceChange
      );

    };

  }, []);


  // =========================================
  // CLEANUP AUDIO
  // =========================================

  useEffect(() => {

    return () => {

      // Stop ElevenLabs audio

      if (
        audioRef.current
      ) {

        audioRef.current.pause();

        audioRef.current.src =
          "";

        audioRef.current =
          null;

      }


      // Stop browser speech

      if (
        "speechSynthesis" in window
      ) {

        window.speechSynthesis.cancel();

      }

    };

  }, []);


  // =========================================
  // COPY TEXT
  // =========================================

  const copyText =
    async () => {

      try {

        await navigator.clipboard
          .writeText(
            text
          );


        setCopied(
          true
        );


        setTimeout(
          () => {

            setCopied(
              false
            );

          },
          2000
        );

      } catch (error) {

        console.error(
          "❌ Copy failed:",
          error
        );

      }

    };


  // =========================================
  // BROWSER TEXT-TO-SPEECH FALLBACK
  // =========================================

  const speakWithBrowser =
    () => {

      if (
        !(
          "speechSynthesis" in
          window
        )
      ) {

        alert(
          "Text-to-speech is not supported in this browser."
        );

        return;

      }


      // Stop previous browser speech

      window.speechSynthesis.cancel();


      const utterance =
        new SpeechSynthesisUtterance(
          text.trim()
        );


      // =====================================
      // VOICE SETTINGS
      // =====================================

      utterance.rate =
        1;

      utterance.pitch =
        1;


      const selectVoice =
        () => {

          const voices =
            window.speechSynthesis
              .getVoices();


          if (
            !voices.length
          ) {
            return;
          }


          let selectedVoice;


          // =================================
          // FEMALE VOICE
          // =================================

          if (
            voicePreference ===
            "female"
          ) {

            selectedVoice =
              voices.find(
                (voice) => {

                  const name =
                    voice.name
                      .toLowerCase();


                  return (
                    voice.lang
                      .toLowerCase()
                      .startsWith(
                        "en"
                      ) &&

                    (
                      name.includes(
                        "zira"
                      ) ||

                      name.includes(
                        "samantha"
                      ) ||

                      name.includes(
                        "female"
                      ) ||

                      name.includes(
                        "hazel"
                      ) ||

                      name.includes(
                        "aria"
                      )
                    )
                  );

                }
              );

          }


          // =================================
          // MALE VOICE
          // =================================

          if (
            voicePreference ===
            "male"
          ) {

            selectedVoice =
              voices.find(
                (voice) => {

                  const name =
                    voice.name
                      .toLowerCase();


                  return (
                    voice.lang
                      .toLowerCase()
                      .startsWith(
                        "en"
                      ) &&

                    (
                      name.includes(
                        "david"
                      ) ||

                      name.includes(
                        "mark"
                      ) ||

                      name.includes(
                        "male"
                      ) ||

                      name.includes(
                        "guy"
                      ) ||

                      name.includes(
                        "daniel"
                      )
                    )
                  );

                }
              );

          }


          // =================================
          // FALLBACK TO ANY ENGLISH VOICE
          // =================================

          if (
            !selectedVoice
          ) {

            selectedVoice =
              voices.find(
                (voice) =>
                  voice.lang
                    .toLowerCase()
                    .startsWith(
                      "en"
                    )
              );

          }


          if (
            selectedVoice
          ) {

            utterance.voice =
              selectedVoice;

          }

        };


      selectVoice();


      // Chrome sometimes loads
      // voices asynchronously.

      window.speechSynthesis
        .onvoiceschanged =
          selectVoice;


      // =====================================
      // SPEECH EVENTS
      // =====================================

      utterance.onstart =
        () => {

          setIsSpeaking(
            true
          );

          setIsLoadingSpeech(
            false
          );


          console.log(
            "🔊 Cupid is speaking with browser voice..."
          );

        };


      utterance.onend =
        () => {

          setIsSpeaking(
            false
          );

          setIsLoadingSpeech(
            false
          );


          console.log(
            "🔊 Cupid finished speaking."
          );

        };


      utterance.onerror =
        (event) => {

          console.error(
            "❌ Browser speech error:",
            event
          );


          setIsSpeaking(
            false
          );

          setIsLoadingSpeech(
            false
          );

        };


      // =====================================
      // SPEAK
      // =====================================

      window.speechSynthesis
        .speak(
          utterance
        );

    };


  // =========================================
  // READ ALOUD
  // =========================================

  const speakText =
    async () => {

      // =====================================
      // STOP CURRENT SPEECH
      // =====================================

      if (
        isSpeaking
      ) {

        // Stop ElevenLabs audio

        if (
          audioRef.current
        ) {

          audioRef.current.pause();

          audioRef.current.currentTime =
            0;

        }


        // Stop browser speech

        if (
          "speechSynthesis" in
          window
        ) {

          window.speechSynthesis
            .cancel();

        }


        setIsSpeaking(
          false
        );

        return;

      }


      // =====================================
      // VALIDATE TEXT
      // =====================================

      if (
        !text ||
        !text.trim()
      ) {
        return;
      }


      try {

        setIsLoadingSpeech(
          true
        );


        console.log(
          "🔊 Requesting Cupid voice..."
        );


        console.log(
          "🔊 Voice preference:",
          voicePreference
        );


        // ===================================
        // REQUEST ELEVENLABS AUDIO
        // ===================================

        const response =
          await api.post(
            "/voice/speak",
            {
              text:
                text.trim(),

              voicePreference:
                voicePreference,
            }
          );


        const audioBase64 =
          response.data?.audio;


        if (
          !audioBase64
        ) {

          throw new Error(
            "No audio returned from server."
          );

        }


        // ===================================
        // CREATE AUDIO SOURCE
        // ===================================

        const audioSrc =
          `data:audio/mpeg;base64,${audioBase64}`;


        // ===================================
        // STOP PREVIOUS AUDIO
        // ===================================

        if (
          audioRef.current
        ) {

          audioRef.current.pause();

          audioRef.current.currentTime =
            0;

        }


        // ===================================
        // CREATE AUDIO
        // ===================================

        const audio =
          new Audio(
            audioSrc
          );


        audioRef.current =
          audio;


        // ===================================
        // AUDIO EVENTS
        // ===================================

        audio.onplay =
          () => {

            setIsSpeaking(
              true
            );


            setIsLoadingSpeech(
              false
            );


            console.log(
              "🔊 Cupid is speaking..."
            );

          };


        audio.onended =
          () => {

            setIsSpeaking(
              false
            );


            console.log(
              "🔊 Cupid finished speaking."
            );

          };


        audio.onerror =
          () => {

            setIsSpeaking(
              false
            );


            setIsLoadingSpeech(
              false
            );


            console.error(
              "❌ Audio playback failed."
            );

          };


        // ===================================
        // PLAY AUDIO
        // ===================================

        await audio.play();


      } catch (error) {

        console.error(
          "❌ ElevenLabs text-to-speech failed:",
          error.response?.data ||
          error.message
        );


        console.log(
          "🔄 ElevenLabs unavailable. Using browser voice..."
        );


        // ===================================
        // FALL BACK TO BROWSER VOICE
        // ===================================

        speakWithBrowser();

      } finally {

        setIsLoadingSpeech(
          false
        );

      }

    };


  // =========================================
  // RENDER
  // =========================================

  return (

    <div
      className={`message ${sender}`}
    >

      <div
        className="bubble"
      >

        {/* ===================================
            IMAGE MESSAGE
        =================================== */}

        {isImage ? (

          <img
            src={
              imageUrl
            }
            alt="Generated"
            className="generated-image"
          />

        ) : (

          <ReactMarkdown
            components={{

              code({
                inline,
                className,
                children,
                ...props
              }) {

                const match =
                  /language-(\w+)/
                    .exec(
                      className ||
                      ""
                    );


                return (
                  !inline &&
                  match
                ) ? (

                  <SyntaxHighlighter
                    language={
                      match[1]
                    }
                    style={
                      vscDarkPlus
                    }
                    PreTag="div"
                    {...props}
                  >

                    {String(
                      children
                    ).replace(
                      /\n$/,
                      ""
                    )}

                  </SyntaxHighlighter>

                ) : (

                  <code
                    {...props}
                  >

                    {children}

                  </code>

                );

              },

            }}
          >

            {text}

          </ReactMarkdown>

        )}


        {/* ===================================
            ASSISTANT ACTIONS
        =================================== */}

        {sender ===
          "assistant" && (

          <div
            className="message-actions"
          >

            {/* COPY */}

            <button
              type="button"
              className="icon-btn"
              onClick={
                copyText
              }
              title={
                copied
                  ? "Copied"
                  : "Copy"
              }
            >

              {copied ? (

                <LuCheck />

              ) : (

                <LuCopy />

              )}

            </button>


            {/* READ ALOUD */}

            <button
              type="button"
              className={`icon-btn ${
                isSpeaking
                  ? "speaking"
                  : ""
              }`}
              onClick={
                speakText
              }
              disabled={
                isLoadingSpeech
              }
              title={
                isLoadingSpeech
                  ? "Generating voice..."
                  : isSpeaking
                  ? "Stop speaking"
                  : `Read aloud (${voicePreference})`
              }
            >

              {isLoadingSpeech ? (

                <LuLoader
                  className="speech-loader"
                />

              ) : isSpeaking ? (

                <LuVolumeX />

              ) : (

                <LuVolume2 />

              )}

            </button>

          </div>

        )}

      </div>

    </div>

  );

}