const speech = new SpeechSynthesisUtterance();
let voices = [];
const voiceSelect = document.querySelector("#voice-select");
const textInput = document.querySelector("#text-input");
const speakButton = document.querySelector(".speak");
const stopButton = document.querySelector(".stop");
const recordButton = document.querySelector(".record");
const audioPlayer = document.querySelector("#audio-player");

// Load available voices
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '<option value="">Select Voice</option>';
    voices.forEach((voice, i) => {
        const option = new Option(voice.name, i);
        voiceSelect.add(option);
    });
    if (voices.length > 0) {
        speech.voice = voices[0];
    }
};

// Update voice when selection changes
voiceSelect.addEventListener("change", () => {
    const selectedVoiceIndex = voiceSelect.value;
    if (selectedVoiceIndex !== "") {
        speech.voice = voices[selectedVoiceIndex];
    }
});

// Text-to-Speech functionality
speakButton.addEventListener("click", () => {
    if (textInput.value.trim() === "") {
        alert("Please enter some text to speak.");
        return;
    }
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    speech.text = textInput.value;
    window.speechSynthesis.speak(speech);
});

// Stop speech
stopButton.addEventListener("click", () => {
    window.speechSynthesis.cancel();
});

// Speech Recognition and Audio Recording
let recognition;
let mediaRecorder;
let audioChunks = [];

if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        textInput.value += (textInput.value ? " " : "") + transcript;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        alert("Speech recognition failed: " + event.error);
        recordButton.textContent = "🎤 Record";
        recordButton.disabled = false;
    };
}

recordButton.addEventListener("click", async () => {
    if (recordButton.textContent.includes("Recording")) {
        mediaRecorder.stop();
        recognition?.stop();
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = "block";

            const link = document.createElement("a");
            link.href = audioUrl;
            link.download = "recorded_audio.webm";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            recordButton.textContent = "🎤 Record";
            recordButton.disabled = false;
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        if (recognition) {
            recognition.start();
        }
        recordButton.textContent = "🎙 Recording...";
        recordButton.disabled = false;

        setTimeout(() => {
            if (mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                if (recognition) recognition.stop();
            }
        }, 5000); // Stop after 5 seconds
    } catch (error) {
        console.error("Recording failed:", error);
        alert("Microphone access is blocked or unavailable. Please allow access in your browser settings.");
        recordButton.textContent = "🎤 Record";
        recordButton.disabled = false;
    }
});