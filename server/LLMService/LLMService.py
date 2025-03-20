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
        f"Your responses should be personalized based on the specific interests and location. "
        f"Be creative and specific - don't just give generic suggestions. "
        f"Respond strictly in JSON format with the following structure:\n\n"
        f"{{\n"
        f'  "outdoor_activities": [\n    {{"name": "Activity Name", "genre": "One word Genre", "location": "Relative Location (Downtown, Stanley Park, At Home, etc.)", "weather": "Weather this activity should be done in (Sunny, Rainy, Any, etc.)", "description": "Brief Description"}}\n  ],\n'
        f'  "indoor_activities": [\n    {{"name": "Activity Name", "genre": "One word Genre", "location": "Relative Location (Downtown, Stanley Park, At Home, etc.)", "weather": "Weather this activity should be done in (Sunny, Rainy, Any, etc.)", "description": "Brief Description"}}\n  ],\n'
        f'  "local_events": [\n    {{"name": "Activity Name", "genre": "One word Genre", "location": "Relative Location (Downtown, Stanley Park, At Home, etc.)", "weather": "Weather this activity should be done in (Sunny, Rainy, Any, etc.)", "description": "Brief Description"}}\n  ],\n'
        f'  "considerations": [\n    "Important tips or things to keep in mind"\n  ]\n'
        f"}}\n\n"
        f"IMPORTANT: For each category (outdoor_activities, indoor_activities, local_events), provide AT LEAST 2-3 activities that genuinely relate to the user's interests. Do not return empty arrays. Each activity should be tailored to the requested interests.\n\n"
        f"Ensure the JSON response is properly formatted without any additional text outside the JSON structure."
    )

# Function to query Gemini AI
def query_gemini(prompt):
    # Define some fallback activities that will ONLY be used if everything else fails
    fallback_data = {
        "outdoor_activities": [
            {
                "name": "Park Walk",
                "genre": "Outdoor",
                "location": "Local Park",
                "weather": "Any",
                "description": "Take a leisurely walk in a nearby park."
            },
            {
                "name": "Cycling Tour",
                "genre": "Adventure",
                "location": "Bike Paths",
                "weather": "Sunny",
                "description": "Explore the city on a bicycle tour."
            }
        ],
        "indoor_activities": [
            {
                "name": "Visit Museum",
                "genre": "Cultural",
                "location": "Downtown",
                "weather": "Any",
                "description": "Explore local history at a nearby museum."
            },
            {
                "name": "Board Game Café",
                "genre": "Social",
                "location": "Entertainment District",
                "weather": "Any", 
                "description": "Play board games with friends at a board game café."
            }
        ],
        "local_events": [
            {
                "name": "Weekend Market",
                "genre": "Community",
                "location": "City Center",
                "weather": "Any",
                "description": "Shop for local goods at the weekend market."
            },
            {
                "name": "Art Exhibition",
                "genre": "Cultural",
                "location": "Art Gallery",
                "weather": "Any",
                "description": "View the latest art exhibition at the local gallery."
            }
        ],
        "considerations": [
            "Check local listings for current events and openings.",
            "Consider the weather forecast before planning outdoor activities."
        ]
    }
    
    try:
        # Use the right method based on the API version
        # This is compatible with the older google.generativeai version
        model = "gemini-pro"  # Using the correct model name
        
        # Generate content with the older API style
        response = genai.generate_text(
            model=model,
            prompt=prompt,
            temperature=0.7,
            max_output_tokens=1024
        )

        # Get the text response
        raw_text = response.text
        print(f'RAW GEMINI RESPONSE: {raw_text[:500]}...')  # Print first 500 chars to avoid huge logs

        # Extract JSON from the text - more robust approach
        json_match = re.search(r'```(?:json)?\s*\n([\s\S]*?)\n```', raw_text)
        
        json_text = None
        if json_match:
            # Use the content inside the code block
            json_text = json_match.group(1)
            print(f'EXTRACTED JSON FROM CODE BLOCK: {json_text[:300]}...')
        else:
            # No code block found, try to use the entire text
            json_text = raw_text
            print(f'NO CODE BLOCK FOUND, USING ENTIRE TEXT: {json_text[:300]}...')
        
        # Try to parse the JSON
        try:
            parsed_json = json.loads(json_text)
            print(f'SUCCESSFULLY PARSED JSON: {list(parsed_json.keys())}')
            
            # Check if the parsed JSON has the expected structure
            if all(key in parsed_json for key in ["outdoor_activities", "indoor_activities", "local_events", "considerations"]):
                print('JSON HAS ALL REQUIRED KEYS')
                
                # Validate and enhance the data (don't replace valid arrays even if empty)
                result = {
                    "outdoor_activities": parsed_json.get("outdoor_activities", []),
                    "indoor_activities": parsed_json.get("indoor_activities", []),
                    "local_events": parsed_json.get("local_events", []),
                    "considerations": parsed_json.get("considerations", [])
                }
                
                # Only use fallbacks if ALL activity arrays are empty
                all_activities_empty = (
                    len(result["outdoor_activities"]) == 0 and
                    len(result["indoor_activities"]) == 0 and
                    len(result["local_events"]) == 0
                )
                
                if all_activities_empty:
                    print('ALL ACTIVITY ARRAYS ARE EMPTY, USING PARTIAL FALLBACKS')
                    # If all arrays are empty, use fallbacks but preserve any considerations
                    return {
                        "outdoor_activities": fallback_data["outdoor_activities"],
                        "indoor_activities": fallback_data["indoor_activities"],
                        "local_events": fallback_data["local_events"],
                        "considerations": result["considerations"] if result["considerations"] else fallback_data["considerations"]
                    }
                
                # Specific arrays might be empty - fill only those that are empty
                if len(result["outdoor_activities"]) == 0:
                    print('OUTDOOR ACTIVITIES ARRAY IS EMPTY, USING FALLBACK')
                    result["outdoor_activities"] = fallback_data["outdoor_activities"]
                    
                if len(result["indoor_activities"]) == 0:
                    print('INDOOR ACTIVITIES ARRAY IS EMPTY, USING FALLBACK')
                    result["indoor_activities"] = fallback_data["indoor_activities"]
                
                if len(result["local_events"]) == 0:
                    print('LOCAL EVENTS ARRAY IS EMPTY, USING FALLBACK')
                    result["local_events"] = fallback_data["local_events"]
                
                if len(result["considerations"]) == 0:
                    print('CONSIDERATIONS ARRAY IS EMPTY, USING FALLBACK')
                    result["considerations"] = fallback_data["considerations"]
                
                return result
            else:
                print('JSON MISSING REQUIRED KEYS, ATTEMPTING TO SALVAGE')
                # Try to salvage what we can from the partial response
                result = {}
                
                if "outdoor_activities" in parsed_json and isinstance(parsed_json["outdoor_activities"], list):
                    result["outdoor_activities"] = parsed_json["outdoor_activities"]
                else:
                    result["outdoor_activities"] = fallback_data["outdoor_activities"]
                
                if "indoor_activities" in parsed_json and isinstance(parsed_json["indoor_activities"], list):
                    result["indoor_activities"] = parsed_json["indoor_activities"]
                else:
                    result["indoor_activities"] = fallback_data["indoor_activities"]
                
                if "local_events" in parsed_json and isinstance(parsed_json["local_events"], list):
                    result["local_events"] = parsed_json["local_events"]
                else:
                    result["local_events"] = fallback_data["local_events"]
                
                if "considerations" in parsed_json and isinstance(parsed_json["considerations"], list):
                    result["considerations"] = parsed_json["considerations"]
                else:
                    result["considerations"] = fallback_data["considerations"]
                
                return result
                
        except json.JSONDecodeError as decode_error:
            print(f"FAILED TO PARSE JSON: {str(decode_error)}")
            
            # Try to extract anything that looks like a JSON object
            json_pattern = re.search(r'({[\s\S]*})', json_text)
            if json_pattern:
                try:
                    # One more attempt with just the extracted pattern
                    second_attempt = json.loads(json_pattern.group(1))
                    print(f'SECOND PARSE ATTEMPT SUCCEEDED: {list(second_attempt.keys())}')
                    
                    # Process this json the same way as above
                    if all(key in second_attempt for key in ["outdoor_activities", "indoor_activities", "local_events", "considerations"]):
                        return {
                            "outdoor_activities": second_attempt.get("outdoor_activities", []),
                            "indoor_activities": second_attempt.get("indoor_activities", []),
                            "local_events": second_attempt.get("local_events", []),
                            "considerations": second_attempt.get("considerations", [])
                        }
                except json.JSONDecodeError:
                    print("SECOND PARSE ATTEMPT FAILED")
                    # Continue to fallback
            
            # If all parsing attempts fail, use fallback data
            print("ALL PARSING ATTEMPTS FAILED, USING COMPLETE FALLBACK DATA")
            return fallback_data
            
    except Exception as e:
        print(f"ERROR QUERYING GEMINI: {str(e)}")
        # Only use fallbacks if there's an actual error in the API call or processing
        return fallback_data