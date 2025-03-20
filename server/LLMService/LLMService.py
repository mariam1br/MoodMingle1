from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import re
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["https://moodmingle-1w1q.onrender.com"])

GEMINI_API_KEY = os.getenv("LLM_API_KEY")

# Configure the API key
genai.configure(api_key=GEMINI_API_KEY)

# Function to generate a structured prompt for Gemini
def create_prompt(interests, location, weather, temperature):
    return (
        f"Suggest engaging activities for someone who enjoys {', '.join(interests)}. "
        f"They are located in {location} and the current weather is {weather}, and temperature is {temperature} Degrees Celsius. "
        f"Include a mix of indoor and outdoor options, and highlight any local events. For the local events make sure to provide dates. "
        f"Respond strictly in JSON format with the following structure:\n\n"
        f"{{\n"
        f'  "outdoor_activities": [\n    {{"name": "Activity Name", "genre": One word Genre", "location": "Relative Location (Downtown, Stanley Park, At Home, etc.)", "weather": "Weather this activity should be done in (Sunny, Rainy, Any, etc.)", "description": "Brief Description"}}\n  ],\n'
        f'  "indoor_activities": [\n    {{"name": "Activity Name", "genre": One word Genre", "location": "Relative Location (Downtown, Stanley Park, At Home, etc.)", "weather": "Weather this activity should be done in (Sunny, Rainy, Any, etc.)", "description": "Brief Description"}}\n  ],\n'
        f'  "local_events": [\n    {{"name": "Activity Name", "genre": One word Genre", "location": "Relative Location (Downtown, Stanley Park, At Home, etc.)", "weather": "Weather this activity should be done in (Sunny, Rainy, Any, etc.)", "description": "Brief Description"}}\n  ],\n'
        f'  "considerations": [\n    "Important tips or things to keep in mind"\n  ]\n'
        f"}}\n\n"
        f"Ensure the JSON response is properly formatted and contains only the requested data without any additional text."
    )

# Function to query Gemini AI
def query_gemini(prompt):
    try:
        # Create the model
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Generate content
        response = model.generate_content(prompt)

        # Get the text response
        raw_text = response.text
        print(f'RAW RESPONSE: {raw_text}')

        # Strip triple backticks and "json" label if present
        clean_json_text = re.sub(r"```json\n|\n```", "", raw_text)

        # Parse the cleaned JSON
        return json.loads(clean_json_text)

    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse Gemini response as JSON: {str(e)}"}
    
    except Exception as e:
        return {"error": f"Error querying Gemini: {str(e)}"}