# COMMIT
from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)

GEMINI_API_KEY = os.getenv("LLM_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)

# Function to generate a structured prompt for Gemini
def create_prompt(interests, location, weather):
    return (
        f"Suggest engaging activities for someone who enjoys {', '.join(interests)}. "
        f"They are located in {location} and the current weather is {weather}. "
        f"Include a mix of indoor and outdoor options, and highlight any local events. "
        f"Respond strictly in JSON format with the following structure:\n\n"
        f"{{\n"
        f'  "outdoor_activities": [\n    {{"name": "Activity Name", "description": "Brief Description"}}\n  ],\n'
        f'  "indoor_activities": [\n    {{"name": "Activity Name", "description": "Brief Description"}}\n  ],\n'
        f'  "local_events": [\n    {{"name": "Event Name", "description": "Brief Description"}}\n  ],\n'
        f'  "combined_activities": [\n    {{"combination": "Activity Combo", "description": "How they complement each other"}}\n  ],\n'
        f'  "considerations": [\n    "Important tips or things to keep in mind"\n  ]\n'
        f"}}\n\n"
        f"Ensure the JSON response is properly formatted and contains only the requested data without any additional text."
    )

# Function to query Gemini AI
def query_gemini(prompt):
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text if response.text else "No suggestions found."
    except Exception as e:
        return f"Error querying Gemini: {str(e)}"

# API Endpoint to Get Recommendations from Gemini
@app.route("/api/get-recommendations", methods=["POST"])
def get_recommendations():
    data = request.json
    interests = data.get("interests", [])
    location = data.get("location", "Unknown")
    weather = data.get("weather", "Unknown")

    if not interests or not location:
        return jsonify({"error": "Interests and location are required."}), 400

    # Generate prompt and query LLM
    prompt = create_prompt(interests, location, weather)
    recommendations = query_gemini(prompt)

    return jsonify({"recommendations": recommendations})

if __name__ == "__main__":
    interests = ['Hiking', 'Basketball', 'Horror Movies', 'Gaming']
    location = "Calgary"
    weather = 'Sunny'
    prompt = create_prompt(interests, location, weather)
    recommendations = query_gemini(prompt)

    print(recommendations)

    # jsonify({"recommendations": recommendations})
