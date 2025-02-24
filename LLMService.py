from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

# Replace with your actual Google Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://api.gemini.com/v1/generate"


def create_prompt(preferences, location, weather):
    prompt = (
        f"Suggest engaging activities for someone who enjoys {', '.join(preferences)}. "
        f"They are located in {location} and the current weather is {weather}. "
        f"Include a mix of indoor and outdoor options, and highlight any local events."
    )
    return prompt


def query_gemini(prompt):
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "prompt": prompt,
        "max_tokens": 200
    }

    response = requests.post(GEMINI_API_URL, headers=headers, json=data)

    if response.status_code == 200:
        return response.json().get("choices", [])[0].get("text", "No suggestions found.")
    else:
        return f"Error: {response.status_code} - {response.text}"


@app.route("/api/get-recommendations", methods=["POST"])
def get_recommendations():
    data = request.json
    preferences = data.get("preferences", [])
    location = data.get("location", "")
    weather = data.get("weather", "")

    if not preferences or not location:
        return jsonify({"error": "Preferences and location are required."}), 400

    prompt = create_prompt(preferences, location, weather)
    recommendations = query_gemini(prompt)

    return jsonify({"recommendations": recommendations})


if __name__ == "__main__":
    app.run(debug=True)
