const startBtn = document.getElementById('startBtn');
const status = document.getElementById('status');
const transcript = document.getElementById('transcript');
const response = document.getElementById('response');
const circle = document.getElementById('circle');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'en-US';

let isListening = false;
let currentLang = 'en-US';
let wakeWordActive = false;
let wakeWordRecognition = null;

// Initialize wake word detection
function initWakeWord() {
    wakeWordRecognition = new SpeechRecognition();
    wakeWordRecognition.continuous = true;
    wakeWordRecognition.interimResults = true;
    wakeWordRecognition.lang = currentLang;
    
    wakeWordRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('')
            .toLowerCase();
        
        console.log('Wake word listening:', transcript);
        
        const englishWakeWords = transcript.includes('hello nova') || transcript.includes('hey nova') || transcript.includes('hi nova');
        const marathiWakeWords = transcript.includes('नमस्कार नोव्हा') || transcript.includes('हॅलो नोव्हा') || transcript.includes('नोव्हा');
        
        if ((englishWakeWords || marathiWakeWords) && !isListening) {
            console.log('Wake word detected!');
            wakeWordRecognition.stop();
            
            if (currentLang === 'mr-IN') {
                speak('होय, मी ऐकत आहे. काय मदत हवी?');
            } else {
                speak('Yes, how can I help you?');
            }
            
            circle.classList.add('listening');
            
            setTimeout(() => {
                if (!isListening) {
                    startListening();
                }
            }, 1500);
        }
    };
    
    wakeWordRecognition.onerror = (error) => {
        console.log('Wake word error:', error);
        setTimeout(() => {
            if (wakeWordActive && !isListening) {
                try {
                    wakeWordRecognition.start();
                } catch (e) {
                    console.log('Already running');
                }
            }
        }, 1000);
    };
    
    wakeWordRecognition.onend = () => {
        console.log('Wake word ended, restarting...');
        if (wakeWordActive && !isListening) {
            setTimeout(() => {
                try {
                    wakeWordRecognition.start();
                } catch (e) {
                    console.log('Already running');
                }
            }, 500);
        }
    };
}

initWakeWord();

// Load voices when they become available
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => v.name + ' (' + v.lang + ')'));
    };
}

// Trigger voice loading
window.speechSynthesis.getVoices();

// Language selector
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLang = btn.dataset.lang;
        recognition.lang = currentLang;
        if (wakeWordRecognition) {
            wakeWordRecognition.lang = currentLang;
        }
        
        if (currentLang === 'mr-IN') {
            status.textContent = 'बटण दाबा आणि बोला';
            startBtn.textContent = 'ऐकणे सुरू करा';
            document.getElementById('wakeWordLabel').textContent = 'वेक वर्ड: "नमस्कार नोव्हा"';
        } else {
            status.textContent = 'Click the button to start';
            startBtn.textContent = 'Start Listening';
            document.getElementById('wakeWordLabel').textContent = 'Wake Word: "Hello Nova"';
        }
    });
});

// Wake word toggle
document.getElementById('wakeWordToggle').addEventListener('change', (e) => {
    wakeWordActive = e.target.checked;
    
    if (wakeWordActive) {
        try {
            wakeWordRecognition.start();
            if (currentLang === 'mr-IN') {
                status.textContent = '🎤 वेक वर्ड सक्रिय - "नमस्कार नोव्हा" म्हणा';
                speak('वेक वर्ड सक्रिय केले. नमस्कार नोव्हा म्हणा.');
            } else {
                status.textContent = '🎤 Wake word active - Say "Hello Nova"';
                speak('Wake word activated. Say Hello Nova to start.');
            }
        } catch (error) {
            console.log('Wake word already running');
        }
    } else {
        try {
            wakeWordRecognition.stop();
            if (currentLang === 'mr-IN') {
                status.textContent = 'बटण दाबा आणि बोला';
                speak('वेक वर्ड बंद केले.');
            } else {
                status.textContent = 'Click the button to start';
                speak('Wake word deactivated.');
            }
        } catch (error) {
            console.log('Wake word already stopped');
        }
    }
});

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = currentLang;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    if (currentLang === 'mr-IN') {
        // Try to find Marathi voice
        const marathiVoice = voices.find(voice => 
            voice.lang === 'mr-IN' || 
            voice.lang.startsWith('mr') ||
            voice.name.includes('Marathi') ||
            voice.name.includes('Hindi') // Fallback to Hindi if Marathi not available
        );
        
        if (marathiVoice) {
            utterance.voice = marathiVoice;
            console.log('Using voice:', marathiVoice.name);
        } else {
            console.log('Marathi voice not found, using default');
            // Display message to user
            response.textContent = text + ' (Note: Marathi voice not available on this device)';
        }
    } else {
        // English voice
        const englishVoice = voices.find(voice => 
            voice.lang === 'en-US' || 
            voice.lang.startsWith('en')
        );
        if (englishVoice) {
            utterance.voice = englishVoice;
        }
    }
    
    window.speechSynthesis.speak(utterance);
    response.textContent = text;
}

function processCommand(command) {
    const cmd = command.toLowerCase();
    
    // Marathi Commands
    if (currentLang === 'mr-IN') {
        if (cmd.includes('नमस्कार') || cmd.includes('हॅलो')) {
            const responses = [
                'नमस्कार! मी तुमची कशी मदत करू शकते?',
                'हॅलो! काय मदत हवी आहे?',
                'नमस्कार! मी येथे आहे तुमची मदत करण्यासाठी.'
            ];
            speak(responses[Math.floor(Math.random() * responses.length)]);
        }
        else if (cmd.includes('कसे आहात') || cmd.includes('कसा आहेस')) {
            speak('मी छान आहे, विचारल्याबद्दल धन्यवाद! तुम्ही कसे आहात?');
        }
        else if (cmd.includes('मी बरा आहे') || cmd.includes('मी ठीक आहे')) {
            speak('हे ऐकून छान वाटले! मी तुमची कशी मदत करू शकते?');
        }
        else if (cmd.includes('मी बरा नाही')) {
            speak('हे ऐकून वाईट वाटले. मी काही मदत करू शकतो का?');
        }
        else if (cmd.includes('शुभ प्रभात')) {
            speak('शुभ प्रभात! तुमचा दिवस चांगला जावो. मी कशी मदत करू?');
        }
        else if (cmd.includes('शुभ रात्री')) {
            speak('शुभ रात्री! गोड स्वप्ने पहा!');
        }
        else if (cmd.includes('धन्यवाद')) {
            speak('तुमचे स्वागत आहे!');
        }
        else if (cmd.includes('तू कोण आहेस')) {
            speak('मी NOVA AI आहे, तुमचा बुद्धिमान आवाज सहाय्यक!');
        }
        else if (cmd.includes('वेळ')) {
            const time = new Date().toLocaleTimeString('mr-IN');
            speak(`वेळ आहे ${time}`);
        }
        else if (cmd.includes('तारीख')) {
            const date = new Date().toLocaleDateString('mr-IN');
            speak(`आजची तारीख आहे ${date}`);
        }
        else {
            speak('मला समजले नाही. कृपया पुन्हा सांगा.');
        }
        return;
    }
    
    // English Commands
    if (cmd.includes('time')) {
        const time = new Date().toLocaleTimeString();
        speak(`The time is ${time}`);
    } 
    else if (cmd.includes('date')) {
        const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        speak(`Today is ${date}`);
    }
    else if (cmd.includes('day')) {
        const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        speak(`Today is ${day}`);
    }
    else if (cmd.includes('search')) {
        const searchTerm = cmd.replace('search', '').trim();
        window.open(`https://www.google.com/search?q=${searchTerm}`, '_blank');
        speak(`Searching for ${searchTerm}`);
    }
    else if (cmd.includes('wikipedia')) {
        const searchTerm = cmd.replace('wikipedia', '').trim();
        window.open(`https://en.wikipedia.org/wiki/${searchTerm}`, '_blank');
        speak(`Opening Wikipedia for ${searchTerm}`);
    }
    else if (cmd.includes('play') && (cmd.includes('youtube') || cmd.includes('video'))) {
        const video = cmd.replace('play', '').replace('on youtube', '').replace('youtube', '').replace('video', '').trim();
        if (video) {
            window.open(`https://www.youtube.com/results?search_query=${video}`, '_blank');
            speak(`Playing ${video} on YouTube`);
        } else {
            window.open('https://www.youtube.com', '_blank');
            speak('Opening YouTube');
        }
    }
    else if (cmd.includes('youtube')) {
        const searchTerm = cmd.replace('youtube', '').replace('open', '').trim();
        if (searchTerm) {
            window.open(`https://www.youtube.com/results?search_query=${searchTerm}`, '_blank');
            speak(`Searching YouTube for ${searchTerm}`);
        } else {
            window.open('https://www.youtube.com', '_blank');
            speak('Opening YouTube');
        }
    }
    else if (cmd.includes('facebook')) {
        window.open('https://www.facebook.com', '_blank');
        speak('Opening Facebook');
    }
    else if (cmd.includes('instagram')) {
        window.open('https://www.instagram.com', '_blank');
        speak('Opening Instagram');
    }
    else if (cmd.includes('twitter')) {
        window.open('https://www.twitter.com', '_blank');
        speak('Opening Twitter');
    }
    else if (cmd.includes('gmail')) {
        window.open('https://mail.google.com', '_blank');
        speak('Opening Gmail');
    }
    else if (cmd.includes('netflix')) {
        window.open('https://www.netflix.com', '_blank');
        speak('Opening Netflix');
    }
    else if (cmd.includes('amazon')) {
        window.open('https://www.amazon.com', '_blank');
        speak('Opening Amazon');
    }
    else if (cmd.includes('github')) {
        window.open('https://www.github.com', '_blank');
        speak('Opening GitHub');
    }
    else if (cmd.includes('spotify')) {
        window.open('https://www.spotify.com', '_blank');
        speak('Opening Spotify');
    }
    else if (cmd.includes('linkedin')) {
        window.open('https://www.linkedin.com', '_blank');
        speak('Opening LinkedIn');
    }
    else if (cmd.includes('calculate') || cmd.includes('what is')) {
        try {
            const expression = cmd.replace('calculate', '').replace('what is', '').trim();
            const result = eval(expression.replace(/x/g, '*'));
            speak(`The answer is ${result}`);
        } catch {
            speak('Sorry, I could not calculate that');
        }
    }
    else if (cmd.includes('joke')) {
        const jokes = [
            'Why do programmers prefer dark mode? Because light attracts bugs!',
            'Why did the developer go broke? Because he used up all his cache!',
            'How many programmers does it take to change a light bulb? None, that is a hardware problem!',
            'Why do Java developers wear glasses? Because they cannot C sharp!',
            'What is a programmer\'s favorite hangout place? The Foo Bar!'
        ];
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        speak(joke);
    }
    else if (cmd.includes('weather')) {
        speak('Opening weather forecast');
        window.open('https://www.weather.com', '_blank');
    }
    else if (cmd.includes('news')) {
        speak('Opening news');
        window.open('https://news.google.com', '_blank');
    }
    else if (cmd.includes('map')) {
        const location = cmd.replace('map', '').trim();
        window.open(`https://www.google.com/maps/search/${location}`, '_blank');
        speak(`Opening map for ${location}`);
    }

    else if (cmd.includes('hello') || cmd.includes('hi')) {
        const responses = [
            'Hello! How can I help you today?',
            'Hi there! What can I do for you?',
            'Hey! I\'m here to assist you.',
            'Hello! Nice to hear from you!'
        ];
        speak(responses[Math.floor(Math.random() * responses.length)]);
    }
    else if (cmd.includes('how are you')) {
        speak('I\'m doing great, thank you for asking! How are you today?');
    }
    else if (cmd.includes('i am fine') || cmd.includes('i\'m fine') || cmd.includes('i am good') || cmd.includes('i\'m good')) {
        speak('That\'s wonderful to hear! How can I assist you today?');
    }
    else if (cmd.includes('i am not good') || cmd.includes('i\'m not good') || cmd.includes('not well')) {
        speak('I\'m sorry to hear that. Is there anything I can do to help you feel better?');
    }
    else if (cmd.includes('what\'s up') || cmd.includes('whats up')) {
        speak('Not much! Just here waiting to help you. What do you need?');
    }
    else if (cmd.includes('good morning')) {
        speak('Good morning! Hope you have a wonderful day ahead. How can I help you?');
    }
    else if (cmd.includes('good afternoon')) {
        speak('Good afternoon! What can I do for you today?');
    }
    else if (cmd.includes('good evening')) {
        speak('Good evening! How may I assist you tonight?');
    }
    else if (cmd.includes('good night')) {
        speak('Good night! Sleep well and sweet dreams!');
    }
    else if (cmd.includes('see you') || cmd.includes('bye') || cmd.includes('goodbye')) {
        speak('Goodbye! Have a great day. Come back anytime!');
    }
    else if (cmd.includes('love you')) {
        speak('Aww, that\'s sweet! I\'m here whenever you need me.');
    }
    else if (cmd.includes('you are awesome') || cmd.includes('you\'re awesome') || cmd.includes('you are great')) {
        speak('Thank you so much! You\'re pretty awesome yourself!');
    }
    else if (cmd.includes('you are smart')) {
        speak('Thank you! I try my best to help you with everything.');
    }
    else if (cmd.includes('tell me about yourself')) {
        speak('I\'m NOVA AI, your intelligent voice assistant. I can help you with tasks, answer questions, open websites, and much more!');
    }
    else if (cmd.includes('what do you like')) {
        speak('I love helping people like you! It makes me happy when I can assist you.');
    }
    else if (cmd.includes('are you real')) {
        speak('I\'m a digital AI assistant, but I\'m real in the sense that I\'m here to help you!');
    }
    else if (cmd.includes('can you hear me')) {
        speak('Yes, I can hear you loud and clear! What would you like me to do?');
    }
    else if (cmd.includes('are you listening')) {
        speak('Yes, I\'m always listening when you need me. What can I help you with?');
    }
    else if (cmd.includes('make me laugh') || cmd.includes('tell me something funny')) {
        const funnyResponses = [
            'Why don\'t scientists trust atoms? Because they make up everything!',
            'I told my computer I needed a break, and now it won\'t stop sending me Kit-Kat ads!',
            'Why did the scarecrow win an award? He was outstanding in his field!',
            'I\'m reading a book about anti-gravity. It\'s impossible to put down!'
        ];
        speak(funnyResponses[Math.floor(Math.random() * funnyResponses.length)]);
    }
    else if (cmd.includes('your name') || cmd.includes('who are you')) {
        speak('I am NOVA AI, your intelligent voice assistant, here to help you!');
    }
    else if (cmd.includes('thank you') || cmd.includes('thanks')) {
        speak('You are welcome!');
    }
    // System Controls
    else if (cmd.includes('volume up') || cmd.includes('increase volume')) {
        speak('Volume control requires system permissions. You can use your keyboard volume keys.');
    }
    else if (cmd.includes('volume down') || cmd.includes('decrease volume')) {
        speak('Volume control requires system permissions. You can use your keyboard volume keys.');
    }
    else if (cmd.includes('mute') || cmd.includes('unmute')) {
        speak('Mute control requires system permissions. You can use your keyboard mute key.');
    }
    // Open Apps
    else if (cmd.includes('open calculator')) {
        speak('Opening calculator');
        window.open('https://www.google.com/search?q=calculator', '_blank');
    }
    else if (cmd.includes('open notepad') || cmd.includes('open notes')) {
        speak('Opening Google Keep for notes');
        window.open('https://keep.google.com', '_blank');
    }
    else if (cmd.includes('open calendar')) {
        speak('Opening Google Calendar');
        window.open('https://calendar.google.com', '_blank');
    }
    else if (cmd.includes('open drive')) {
        speak('Opening Google Drive');
        window.open('https://drive.google.com', '_blank');
    }
    else if (cmd.includes('open photos')) {
        speak('Opening Google Photos');
        window.open('https://photos.google.com', '_blank');
    }
    else if (cmd.includes('open settings')) {
        speak('Opening settings');
        document.getElementById('settingsBtn').click();
    }
    // File Management
    else if (cmd.includes('create file') || cmd.includes('new file')) {
        speak('Opening Google Docs to create a new file');
        window.open('https://docs.google.com/document/create', '_blank');
    }
    else if (cmd.includes('create spreadsheet')) {
        speak('Opening Google Sheets to create a new spreadsheet');
        window.open('https://docs.google.com/spreadsheets/create', '_blank');
    }
    else if (cmd.includes('create presentation')) {
        speak('Opening Google Slides to create a new presentation');
        window.open('https://docs.google.com/presentation/create', '_blank');
    }
    else if (cmd.includes('my files') || cmd.includes('show files')) {
        speak('Opening your files in Google Drive');
        window.open('https://drive.google.com/drive/my-drive', '_blank');
    }
    // Screen Controls
    else if (cmd.includes('full screen') || cmd.includes('fullscreen')) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
            speak('Entering full screen mode');
        }
    }
    else if (cmd.includes('exit full screen')) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            speak('Exiting full screen mode');
        }
    }
    else if (cmd.includes('scroll down')) {
        window.scrollBy(0, 300);
        speak('Scrolling down');
    }
    else if (cmd.includes('scroll up')) {
        window.scrollBy(0, -300);
        speak('Scrolling up');
    }
    else if (cmd.includes('scroll to top')) {
        window.scrollTo(0, 0);
        speak('Scrolling to top');
    }
    else if (cmd.includes('scroll to bottom')) {
        window.scrollTo(0, document.body.scrollHeight);
        speak('Scrolling to bottom');
    }
    // Code Generation
    else if (cmd.includes('generate') && (cmd.includes('code') || cmd.includes('html') || cmd.includes('python') || cmd.includes('javascript') || cmd.includes('react'))) {
        generateCode(cmd);
    }
    else if (cmd.includes('create') && (cmd.includes('website') || cmd.includes('app') || cmd.includes('function'))) {
        generateCode(cmd);
    }
    else {
        answerWithAI(command);
    }
}

async function answerWithAI(question) {
    try {
        response.textContent = 'Thinking...';
        const aiResponse = await getAIResponse(question);
        speak(aiResponse);
    } catch (error) {
        speak("I'm not sure about that. Try asking something else or search it on Google.");
    }
}

function generateCode(command) {
    const cmd = command.toLowerCase();
    let code = '';
    let language = '';
    let title = '';
    
    if (cmd.includes('html') || cmd.includes('website')) {
        language = 'html';
        title = 'HTML Starter Template';
        code = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
    </style>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This is a starter template.</p>
    <script>
        console.log('Website loaded!');
    </script>
</body>
</html>`;
    }
    else if (cmd.includes('python')) {
        language = 'python';
        title = 'Python Starter Code';
        code = `# Python Starter Code

def main():
    print("Hello, World!")
    # Your code here
    
if __name__ == "__main__":
    main()`;
    }
    else if (cmd.includes('javascript') || cmd.includes('js')) {
        language = 'javascript';
        title = 'JavaScript Starter Code';
        code = `// JavaScript Starter Code

function main() {
    console.log('Hello, World!');
    // Your code here
}

main();`;
    }
    else if (cmd.includes('react')) {
        language = 'javascript';
        title = 'React Component Template';
        code = `import React, { useState } from 'react';

function MyComponent() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <h1>My React Component</h1>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}

export default MyComponent;`;
    }
    else if (cmd.includes('function')) {
        language = 'javascript';
        title = 'Function Template';
        code = `function myFunction(param1, param2) {
    // Your code here
    return param1 + param2;
}

// Example usage
const result = myFunction(5, 10);
console.log(result);`;
    }
    else {
        language = 'text';
        title = 'Code Template';
        code = '// Start coding here...';
    }
    
    showCodeModal(title, code, language);
    speak(`Generated ${title}. You can copy the code from the modal.`);
}

function showCodeModal(title, code, language) {
    const modal = document.createElement('div');
    modal.className = 'code-modal';
    modal.innerHTML = `
        <div class="code-modal-content">
            <span class="code-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>${title}</h2>
            <pre><code class="language-${language}">${escapeHtml(code)}</code></pre>
            <button class="copy-code-btn" onclick="copyCode(this)">Copy Code</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.copyCode = function(btn) {
    const code = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy Code', 2000);
    });
};

async function getAIResponse(question) {
    // Simple AI responses based on keywords
    const q = question.toLowerCase();
    
    if (q.includes('who') && q.includes('president')) {
        return 'I can help you search for that information. Let me open Google for you.';
    }
    else if (q.includes('capital')) {
        return 'I can help you find capital cities. Try asking me to search for it.';
    }
    else if (q.includes('how') && q.includes('old')) {
        return 'I can help you search for age information on Google.';
    }
    else if (q.includes('what') && q.includes('mean')) {
        return 'Let me search that definition for you.';
    }
    else if (q.includes('where')) {
        return 'I can help you find locations. Try asking me to open maps.';
    }
    else if (q.includes('when')) {
        return 'I can help you search for dates and events on Google.';
    }
    else if (q.includes('why')) {
        return 'That\'s an interesting question. Let me search that for you.';
    }
    else {
        // Default: search on Google
        window.open(`https://www.google.com/search?q=${encodeURIComponent(question)}`, '_blank');
        return `Searching Google for: ${question}`;
    }
}

startBtn.addEventListener('click', () => {
    if (!isListening) {
        startListening();
    }
});

function startListening() {
    recognition.start();
    isListening = true;
    if (currentLang === 'mr-IN') {
        startBtn.textContent = 'ऐकत आहे...';
        status.textContent = 'ऐकत आहे...';
    } else {
        startBtn.textContent = 'Listening...';
        status.textContent = 'Listening...';
    }
    circle.classList.add('listening');
}

recognition.onresult = (event) => {
    const command = event.results[0][0].transcript;
    if (currentLang === 'mr-IN') {
        transcript.textContent = `तुम्ही म्हणालात: "${command}"`;
    } else {
        transcript.textContent = `You said: "${command}"`;
    }
    
    saveCommandToFirebase(command);
    
    // Detect emotion from speech
    if (typeof detectEmotion === 'function' && emotionDetectionEnabled) {
        const emotionResult = detectEmotion(command);
        console.log('Detected emotion:', emotionResult);
        
        // Check if we should give emotional response
        const emotionalResponse = getEmotionalResponse(emotionResult.emotion, command);
        if (emotionalResponse && emotionResult.confidence > 0.7) {
            speak(emotionalResponse);
            return; // Don't process command, just respond emotionally
        }
    }
    
    processCommand(command);
};

function saveCommandToFirebase(command) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const timestamp = Date.now();
    const commandId = timestamp.toString();
    
    // Increment command count
    const currentCount = parseInt(localStorage.getItem('commandCount') || 0);
    localStorage.setItem('commandCount', currentCount + 1);
    
    const commandData = {
        command: command,
        timestamp: new Date().toISOString(),
        userEmail: user.email || 'guest'
    };
    
    if (window.dbSet && window.dbRef && window.database) {
        window.dbSet(window.dbRef(window.database, 'voiceCommands/' + commandId), commandData)
            .then(() => console.log('Command saved to Firebase'))
            .catch((error) => console.error('Error saving command:', error));
    }
}

recognition.onend = () => {
    isListening = false;
    if (currentLang === 'mr-IN') {
        startBtn.textContent = 'ऐकणे सुरू करा';
        status.textContent = 'बटण दाबा आणि बोला';
    } else {
        startBtn.textContent = 'Start Listening';
        if (wakeWordActive) {
            status.textContent = '🎤 Wake word active - Say "Hello Nova"';
        } else {
            status.textContent = 'Click the button to start';
        }
    }
    circle.classList.remove('listening');
    
    // Restart wake word detection after command is processed
    if (wakeWordActive) {
        setTimeout(() => {
            try {
                wakeWordRecognition.start();
                console.log('Wake word restarted after command');
            } catch (e) {
                console.log('Wake word already running');
            }
        }, 1000);
    }
};

recognition.onerror = (event) => {
    if (currentLang === 'mr-IN') {
        status.textContent = 'त्रुटी झाली. पुन्हा प्रयत्न करा.';
        startBtn.textContent = 'ऐकणे सुरू करा';
    } else {
        status.textContent = 'Error occurred. Try again.';
        startBtn.textContent = 'Start Listening';
    }
    isListening = false;
    circle.classList.remove('listening');
};
