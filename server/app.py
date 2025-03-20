# app.py
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from database.databaseConnection import DatabaseConnection 
from database.databaseQueries import DatabaseQueries as dq 
from LLMService.LLMService import create_prompt, query_gemini
from WeatherService.googleapi import get_location, get_weather
import mysql.connector
import traceback
import requests
import os
from datetime import timedelta
from dotenv import load_dotenv

app = Flask(__name__)
app.secret_key = "kbo7c43w7898jbs"  # Required for session management

# Updated Session configuration
app.config['SESSION_COOKIE_SECURE'] = True  # For HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Changed from None to Lax
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)  # Session lasts 7 days

# Make sessions permanent
@app.before_request
def make_session_permanent():
    session.permanent = True

# Updated CORS configuration
CORS(
    app, 
    supports_credentials=True, 
    origins=["https://moodmingle-1w1q.onrender.com"],  # Specific frontend URL
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    max_age=86400  # 24 hours
)

# Comprehensive CORS and credentials handling
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://moodmingle-1w1q.onrender.com')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Special CORS preflight handler for all routes
@app.route('/handle-cors', methods=['OPTIONS'])
def handle_options():
    response = app.make_default_options_response()
    response.headers.add('Access-Control-Allow-Origin', 'https://moodmingle-1w1q.onrender.com')
    response.headers.add('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Special CORS preflight handler for recommendations
@app.route('/get-recommendations', methods=['OPTIONS'])
def handle_options_recommendations():
    response = app.make_default_options_response()
    response.headers.add('Access-Control-Allow-Origin', 'https://moodmingle-1w1q.onrender.com')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Database connection configuration
DB_CONFIG = {
    'host': '104.198.30.234',
    'port': 3306,
    'user': 'moodmingle_user',
    'password': 'team2',
    'database': 'MoodMingle',
}

# Helper function to get database connection
def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

# Existing routes remain the same...
# (All your previous routes like test_db, check_user, login, signup, etc. remain unchanged)

# Modified recommendations route with explicit CORS handling
@app.route("/get-recommendations", methods=["POST"])
def get_recommendations():
    try:
        data = request.json
        interests = data.get("interests", [])
        location = data.get("location", "Unknown")
        weather = data.get("weather", "Unknown")
        temperature = data.get("temperature", "Unknown")
        print(f"Generating recommendations for: Location: {location}, Weather: {weather}, Temperature: {temperature}, Interests: {interests}")

        if not interests:
            response = jsonify({"error": "Interests are required."})
            response.headers.add('Access-Control-Allow-Origin', 'https://moodmingle-1w1q.onrender.com')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 400

        try:
            # Generate prompt and query LLM
            prompt = create_prompt(interests, location, weather, temperature)
            recommendations = query_gemini(prompt)
            
            # Return empty results if there's an error
            if isinstance(recommendations, dict) and "error" in recommendations:
                print(f"Error from Gemini: {recommendations['error']}")
                response = jsonify({
                    "recommendations": {
                        "outdoor_activities": [],
                        "indoor_activities": [],
                        "local_events": [],
                        "considerations": ["Could not generate recommendations at this time."]
                    }
                })
                response.headers.add('Access-Control-Allow-Origin', 'https://moodmingle-1w1q.onrender.com')
                response.headers.add('Access-Control-Allow-Credentials', 'true')
                return response
                
            response = jsonify({"recommendations": recommendations})
            response.headers.add('Access-Control-Allow-Origin', 'https://moodmingle-1w1q.onrender.com')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response
        
        except Exception as e:
            print(f"Error calling Gemini: {str(e)}")
            import traceback
            traceback.print_exc()
            # Return empty but valid data structure on error
            response = jsonify({
                "recommendations": {
                    "outdoor_activities": [],
                    "indoor_activities": [],
                    "local_events": [],
                    "considerations": ["Could not generate recommendations at this time."]
                }
            })
            response.headers.add('Access-Control-Allow-Origin', 'https://moodmingle-1w1q.onrender.com')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response
    
    except Exception as e:
        print(f"Error in get_recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return an error response
        response = jsonify({
            "error": "An unexpected error occurred. Please try again later.",
            "details": str(e)
        })
        response.headers.add('Access-Control-Allow-Origin', 'https://moodmingle-1w1q.onrender.com')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 500

# Existing main block
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)