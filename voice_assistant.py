import speech_recognition as sr
import pyttsx3
import datetime
import webbrowser

class VoiceAssistant:
    def __init__(self):
        self.engine = pyttsx3.init()
        self.recognizer = sr.Recognizer()
        
    def speak(self, text):
        self.engine.say(text)
        self.engine.runAndWait()
        
    def listen(self):
        with sr.Microphone() as source:
            print("Listening...")
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = self.recognizer.listen(source)
            
        try:
            print("Recognizing...")
            query = self.recognizer.recognize_google(audio)
            print(f"You said: {query}")
            return query.lower()
        except:
            return ""
    
    def process_command(self, query):
        if "time" in query:
            time = datetime.datetime.now().strftime("%H:%M")
            self.speak(f"The time is {time}")
            
        elif "date" in query:
            date = datetime.datetime.now().strftime("%B %d, %Y")
            self.speak(f"Today is {date}")
            
        elif "search" in query:
            search_term = query.replace("search", "").strip()
            webbrowser.open(f"https://www.google.com/search?q={search_term}")
            self.speak(f"Searching for {search_term}")
            
        elif "stop" in query or "exit" in query:
            self.speak("Goodbye")
            return False
            
        else:
            self.speak("I didn't understand that command")
            
        return True
    
    def run(self):
        self.speak("Hello, I'm your voice assistant")
        
        while True:
            query = self.listen()
            if query:
                if not self.process_command(query):
                    break

if __name__ == "__main__":
    assistant = VoiceAssistant()
    assistant.run()
