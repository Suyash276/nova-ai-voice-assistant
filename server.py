from flask import Flask, render_template, request, jsonify
import datetime

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask():

    data = request.json
    question = data["question"].lower()

    if "hello" in question:
        answer = "Hello, I am Nova AI."

    elif "time" in question:
        answer = "Current time is " + datetime.datetime.now().strftime("%H:%M")

    elif "how are you" in question:
        answer = "I am functioning perfectly."

    else:
        answer = "You said: " + question

    return jsonify({"answer": answer})


if __name__ == "__main__":
    print("NOVA AI SERVER STARTED")
    app.run(debug=True)
    