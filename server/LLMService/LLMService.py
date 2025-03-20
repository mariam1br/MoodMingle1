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
    print("CREATE PROMPT CALLED WITH:")
    print(f"Interests: {interests}")
    print(f"Location: {location}")
    print(f"Weather: {weather}")
    print(f"Temperature: {temperature}")

    return (
        f"You are an activity recommendation AI. Suggest engaging activities for someone who enjoys {', '.join(interests)}. "
        f"They are located in {location} and the current weather is {weather}, with a temperature of {temperature} Degrees Celsius. "
        f"Provide a comprehensive list of activities suitable for the conditions. "
        f"Respond ONLY with a valid JSON in this exact structure:\n\n"
        f"{{\n"
        f'  "outdoor_activities": [\n    {{\n      "name": "Outdoor Activity Name",\n      "genre": "Outdoor Activity Genre",\n      "location": "Specific Location in {location}",\n      "weather": "Suitable Weather Condition",\n      "description": "Detailed Activity Description"\n    }}\n  ],\n'
        f'  "indoor_activities": [\n    {{\n      "name": "Indoor Activity Name",\n      "genre": "Indoor Activity Genre",\n      "location": "Specific Location in {location}",\n      "weather": "Suitable Weather Condition",\n      "description": "Detailed Activity Description"\n    }}\n  ],\n'
        f'  "local_events": [\n    {{\n      "name": "Local Event Name",\n      "genre": "Event Genre",\n      "location": "Specific Location in {location}",\n      "weather": "Suitable Weather Condition",\n      "description": "Detailed Event Description"\n    }}\n  ],\n'
        f'  "considerations": [\n    "Important tips or recommendations for the user"\n  ]\n'
        f"}}"
    )

# Function to query Gemini AI
def query_gemini(prompt):
    try:
        print("QUERYING GEMINI WITH PROMPT:")
        print(prompt)

        # Configure the model with specific settings
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Set generation configuration
        generation_config = {
            "temperature": 0.7,
            "max_output_tokens": 2048
        }

        # Set safety settings to minimize blocking
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
        ]

        # Generate content with configurations
        response = model.generate_content(
            prompt, 
            generation_config=generation_config,
            safety_settings=safety_settings
        )

        # Print raw response
        print("RAW GEMINI RESPONSE:")
        print(response.text)

        # Extract JSON using multiple strategies
        raw_text = response.text.strip()

        # Try to extract JSON using different methods
        json_extraction_patterns = [
            r'```json\n(.*?)```',  # JSON in triple backticks
            r'```\n(.*?)```',      # Alternative backtick pattern
            r'({.*})',              # JSON within braces
        ]

        for pattern in json_extraction_patterns:
            match = re.search(pattern, raw_text, re.DOTALL | re.MULTILINE)
            if match:
                clean_json_text = match.group(1).strip()
                print("EXTRACTED JSON:")
                print(clean_json_text)

                try:
                    # Attempt to parse the JSON
                    recommendations = json.loads(clean_json_text)
                    
                    # Validate the structure
                    if not all(key in recommendations for key in 
                               ["outdoor_activities", "indoor_activities", "local_events", "considerations"]):
                        print("INVALID JSON STRUCTURE")
                        return {
                            "outdoor_activities": [],
                            "indoor_activities": [],
                            "local_events": [],
                            "considerations": ["Could not generate valid recommendations"]
                        }

                    print("PARSED RECOMMENDATIONS:")
                    print(json.dumps(recommendations, indent=2))
                    return recommendations

                except json.JSONDecodeError as e:
                    print(f"JSON PARSE ERROR: {e}")
                    continue

        # If no valid JSON found
        print("NO VALID JSON EXTRACTED")
        return {
            "outdoor_activities": [],
            "indoor_activities": [],
            "local_events": [],
            "considerations": ["Could not generate recommendations"]
        }

    except Exception as e:
        print(f"COMPREHENSIVE GEMINI QUERY ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "outdoor_activities": [],
            "indoor_activities": [],
            "local_events": [],
            "considerations": [f"Comprehensive error in recommendation generation: {str(e)}"]
        }