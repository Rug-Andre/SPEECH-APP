let speech = new SpeechSynthesisUtterance();
let voices = [];
let voiceselect = document.querySelector("select");
let textarea = document.querySelector("textarea");
let row = document.querySelector(".row");

// Create record button
let recordButton = document.createElement("button");
recordButton.textContent = "🎤 Record";
recordButton.classList.add("record-button");
row.insertAdjacentElement("afterend", recordButton);

// Create audio player
let audioPlayer = document.createElement("audio");
audioPlayer.controls = true;
row.insertAdjacentElement("afterend", audioPlayer);

// Load available voices
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    speech.voice = voices[0];
    voices.forEach((voice, i) => (voiceselect.options[i] = new Option(voice.name, i)));
};

// Text-to-Speech functionality
document.querySelector(".speak").addEventListener("click", () => {
    speech.text = textarea.value;
    window.speechSynthesis.speak(speech);
});

// Speech Recognition (Voice to Text) + Recording & Saving Audio
let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;

let mediaRecorder;
let audioChunks = [];

recordButton.addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;
            
            const link = document.createElement("a");
            link.href = audioUrl;
            link.download = "recorded_audio.webm";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        mediaRecorder.start();
        recordButton.textContent = "🎙 Recording...";
        alert("Recording started! Speak now.");

        setTimeout(() => {
            mediaRecorder.stop();
            recordButton.textContent = "🎤 Record";
            alert("Recording complete. You can play it now.");
        }, 5000); // Stops recording after 5 seconds
    } catch (error) {
        console.error("Recording failed:", error);
        alert("Microphone access is blocked or unavailable. Please allow access in your browser settings and try again.");
    }
});
