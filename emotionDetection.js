let emotionDetectionEnabled = true;
let detectedEmotion = 'neutral';

// Analyze speech for emotion based on patterns and keywords
function detectEmotion(transcript) {
    const text = transcript.toLowerCase();
    
    // Keyword-based emotion detection
    const happyKeywords = ['happy', 'great', 'awesome', 'wonderful', 'excited', 'love', 'amazing', 'fantastic', 'good', 'nice', 'excellent'];
    const sadKeywords = ['sad', 'unhappy', 'depressed', 'down', 'upset', 'crying', 'hurt', 'lonely', 'miss'];
    const angryKeywords = ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'hate', 'irritated', 'pissed'];
    const stressedKeywords = ['stressed', 'tired', 'exhausted', 'overwhelmed', 'anxious', 'worried', 'nervous', 'pressure'];
    const excitedKeywords = ['excited', 'thrilled', 'pumped', 'energetic', 'enthusiastic'];
    
    // Marathi keywords
    const marathiHappy = ['खुश', 'आनंद', 'छान', 'मस्त'];
    const marathiSad = ['दुःखी', 'उदास'];
    const marathiAngry = ['राग', 'चिडलो'];
    const marathiStressed = ['थकलो', 'दबाव'];
    
    let emotion = 'neutral';
    let confidence = 0;
    
    // Check for emotions
    if (happyKeywords.some(word => text.includes(word)) || marathiHappy.some(word => text.includes(word))) {
        emotion = 'happy';
        confidence = 0.8;
    } else if (sadKeywords.some(word => text.includes(word)) || marathiSad.some(word => text.includes(word))) {
        emotion = 'sad';
        confidence = 0.8;
    } else if (angryKeywords.some(word => text.includes(word)) || marathiAngry.some(word => text.includes(word))) {
        emotion = 'angry';
        confidence = 0.8;
    } else if (stressedKeywords.some(word => text.includes(word)) || marathiStressed.some(word => text.includes(word))) {
        emotion = 'stressed';
        confidence = 0.8;
    } else if (excitedKeywords.some(word => text.includes(word))) {
        emotion = 'excited';
        confidence = 0.8;
    }
    
    // Check for exclamation marks (indicates excitement or anger)
    if (text.includes('!')) {
        if (emotion === 'neutral') {
            emotion = 'excited';
            confidence = 0.6;
        }
    }
    
    // Check for question marks (might indicate confusion or curiosity)
    if (text.includes('?') && emotion === 'neutral') {
        emotion = 'curious';
        confidence = 0.5;
    }
    
    detectedEmotion = emotion;
    
    // Update UI with emotion indicator
    updateEmotionIndicator(emotion, confidence);
    
    return { emotion, confidence };
}

function updateEmotionIndicator(emotion, confidence) {
    const circle = document.getElementById('circle');
    
    // Change orb color based on emotion
    switch(emotion) {
        case 'happy':
            circle.style.background = 'radial-gradient(circle at 30% 30%, #ffffff, #ffff00, #ffa500, #ff6b00)';
            break;
        case 'sad':
            circle.style.background = 'radial-gradient(circle at 30% 30%, #ffffff, #4169e1, #0000ff, #000080)';
            break;
        case 'angry':
            circle.style.background = 'radial-gradient(circle at 30% 30%, #ffffff, #ff0000, #dc143c, #8b0000)';
            break;
        case 'stressed':
            circle.style.background = 'radial-gradient(circle at 30% 30%, #ffffff, #ff8c00, #ff4500, #8b0000)';
            break;
        case 'excited':
            circle.style.background = 'radial-gradient(circle at 30% 30%, #ffffff, #00ff00, #32cd32, #228b22)';
            break;
        default:
            circle.style.background = 'radial-gradient(circle at 30% 30%, #ffffff, #ff00ff, #8b00ff, #4400ff)';
    }
    
    // Show emotion label
    const emotionLabel = document.getElementById('emotionLabel');
    if (emotionLabel && emotion !== 'neutral') {
        emotionLabel.textContent = `😊 Detected: ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`;
        emotionLabel.style.display = 'block';
        setTimeout(() => {
            emotionLabel.style.display = 'none';
        }, 3000);
    }
}

function getEmotionalResponse(emotion, command) {
    const cmd = command.toLowerCase();
    
    if (currentLang === 'mr-IN') {
        switch(emotion) {
            case 'happy':
                return 'तुम्ही खूप खुश दिसत आहात! हे पाहून मला आनंद झाला. मी तुमची कशी मदत करू?';
            case 'sad':
                return 'तुम्ही उदास दिसत आहात. मी काही मदत करू शकतो का? मी तुमच्यासाठी काही संगीत लावू का?';
            case 'angry':
                return 'तुम्ही चिडलेले दिसत आहात. शांत व्हा. मी तुमची मदत करू शकतो का?';
            case 'stressed':
                return 'तुम्ही थकलेले दिसत आहात. विश्रांती घ्या. मी तुमच्यासाठी शांत संगीत लावू का?';
            case 'excited':
                return 'वाह! तुमचा उत्साह पाहून छान वाटलं! काय मदत हवी आहे?';
            default:
                return null;
        }
    } else {
        switch(emotion) {
            case 'happy':
                return 'You sound really happy! That\'s wonderful! How can I help you today?';
            case 'sad':
                return 'You seem a bit down. Is everything okay? Would you like me to play some uplifting music?';
            case 'angry':
                return 'I sense you\'re frustrated. Take a deep breath. How can I help make things better?';
            case 'stressed':
                return 'You seem stressed or tired. Would you like me to play some relaxing music or help you with something?';
            case 'excited':
                return 'Wow! Your excitement is contagious! What can I do for you?';
            default:
                return null;
        }
    }
}

// Add emotion detection toggle to settings
function addEmotionDetectionSetting() {
    const settingsSection = document.querySelector('.settings-section');
    if (settingsSection) {
        const emotionSetting = document.createElement('label');
        emotionSetting.innerHTML = '<input type="checkbox" id="emotionDetection" checked> Emotion Detection';
        settingsSection.appendChild(emotionSetting);
        
        document.getElementById('emotionDetection').addEventListener('change', (e) => {
            emotionDetectionEnabled = e.target.checked;
            if (emotionDetectionEnabled) {
                speak('Emotion detection enabled. I will now respond based on your emotions.');
            } else {
                speak('Emotion detection disabled.');
            }
        });
    }
}

// Initialize emotion detection
setTimeout(addEmotionDetectionSetting, 1000);
