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
        f'  "outdoor_activities": [\n    {{"name": "Activity Name", "genre": "One word Genre", "location": "Relative Location (Downtown, Stanley Park, At Home, etc.)", "weather": "Weather this activity should be done in (Sunny, Rainy, Any, etc.)", "description": "Brief Description"}}\n  ],\n'
        f'  "indoor_activities": [\n    {{"name": "Activity Name", "genre": "One word Genre", "location": "Relative Location (Downtown, Stanley Park, At Home, etc.)", "weather": "Weather this activity should be done in (Sunny, Rainy, Any, etc.)", "description": "Brief Description"}}\n  ],\n'
        f'  "local_events": [\n    {{"name": "Activity Name", "genre": "One word Genre", "location": "Relative Location (Downtown, Stanley Park, At Home, etc.)", "weather": "Weather this activity should be done in (Sunny, Rainy, Any, etc.)", "description": "Brief Description"}}\n  ],\n'
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

        # Extract JSON from the text - more robust approach
        json_match = re.search(r'```(?:json)?\s*\n([\s\S]*?)\n```', raw_text)
        
        if json_match:
            # Use the content inside the code block
            json_text = json_match.group(1)
        else:
            # No code block found, try to use the entire text
            json_text = raw_text
        
        # If the text still contains non-JSON content, try to extract JSON-like structure
        try:
            return json.loads(json_text)
        except json.JSONDecodeError:
            # Try to find anything that looks like a JSON object
            json_pattern = re.search(r'({[\s\S]*})', json_text)
            if json_pattern:
                try:
                    return json.loads(json_pattern.group(1))
                except json.JSONDecodeError:
                    # If all else fails, return a default structure
                    print(f"Failed to parse JSON response: {json_text}")
                    return {
                        "outdoor_activities": [
                            {
                                "name": "Park Walk",
                                "genre": "Outdoor",
                                "location": "Local Park",
                                "weather": "Any",
                                "description": "Take a leisurely walk in a nearby park."
                            }
                        ],
                        "indoor_activities": [
                            {
                                "name": "Visit Museum",
                                "genre": "Cultural",
                                "location": "Downtown",
                                "weather": "Any",
                                "description": "Explore local history at a nearby museum."
                            }
                        ],
                        "local_events": [
                            {
                                "name": "Weekend Market",
                                "genre": "Community",
                                "location": "City Center",
                                "weather": "Any",
                                "description": "Shop for local goods at the weekend market."
                            }
                        ],
                        "considerations": [
                            "Check local listings for current events and openings."
                        ]
                    }
            else:
                # Return a default response if no JSON found
                return {
                    "outdoor_activities": [
                        {
                            "name": "Park Walk",
                            "genre": "Outdoor",
                            "location": "Local Park",
                            "weather": "Any",
                            "description": "Take a leisurely walk in a nearby park."
                        }
                    ],
                    "indoor_activities": [
                        {
                            "name": "Visit Museum",
                            "genre": "Cultural",
                            "location": "Downtown",
                            "weather": "Any",
                            "description": "Explore local history at a nearby museum."
                        }
                    ],
                    "local_events": [
                        {
                            "name": "Weekend Market",
                            "genre": "Community",
                            "location": "City Center",
                            "weather": "Any",
                            "description": "Shop for local goods at the weekend market."
                        }
                    ],
                    "considerations": [
                        "Check local listings for current events and openings."
                    ]
                }
    except Exception as e:
        print(f"Error querying Gemini: {str(e)}")
        # Include default data instead of error
        return {
            "outdoor_activities": [
                {
                    "name": "Park Walk",
                    "genre": "Outdoor",
                    "location": "Local Park",
                    "weather": "Any",
                    "description": "Take a leisurely walk in a nearby park."
                }
            ],
            "indoor_activities": [
                {
                    "name": "Visit Museum",
                    "genre": "Cultural",
                    "location": "Downtown",
                    "weather": "Any",
                    "description": "Explore local history at a nearby museum."
                }
            ],
            "local_events": [
                {
                    "name": "Weekend Market",
                    "genre": "Community",
                    "location": "City Center",
                    "weather": "Any",
                    "description": "Shop for local goods at the weekend market."
                }
            ],
            "considerations": [
                "Check local listings for current events and openings."
            ]
        }