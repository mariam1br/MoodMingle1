from flask import Flask, request, jsonify, session
from flask_cors import CORS
from database.databaseConnection import DatabaseConnection  # Ensure this is set up to connect to MySQL
from database.databaseQueries import DatabaseQueries as dq  # Import your query class
from LLMService.LLMService import create_prompt, query_gemini
from WeatherService.googleapi import get_location, get_weather
import mysql.connector
import traceback
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)
app.secret_key = "kbo7c43w7898jbs"  # Required for session management
CORS(app, supports_credentials=True)  # Enable CORS for frontend-backend communication

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

# Test database connection
@app.route("/test-db", methods=["GET"])
def test_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Users")
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return jsonify({
            "success": True, 
            "message": "Database connection successful", 
            "user_count": count
        })
    except Exception as e:
        return jsonify({
            "success": False, 
            "error": str(e),
            "traceback": traceback.format_exc()
        })

# Check if specific user exists
@app.route("/check-user/<username>", methods=["GET"])
def check_user(username):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT username, name, email FROM Users WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user:
            return jsonify({
                "exists": True, 
                "user": {
                    "username": user[0],
                    "name": user[1],
                    "email": user[2]
                }
            })
        else:
            return jsonify({"exists": False})
    except Exception as e:
        return jsonify({"error": str(e)})

# Create test user
@app.route("/create-test-user", methods=["GET"])
def create_test_user():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Users (username, name, email, password) VALUES (%s, %s, %s, %s)",
            ("testuser", "Test User", "test@example.com", "password123")
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Test user created"})
    except Exception as e:
        return jsonify({"error": str(e)})

# User login
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")
        print(f"Login attempt for username: {username}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Query to get user by username - only use columns that actually exist
        query = "SELECT username, password, email FROM Users WHERE username = %s"
        print(f"Executing query: {query} with username={username}")
        cursor.execute(query, (username,))
        user_data = cursor.fetchone()
        
        print(f"Query result: {user_data}")
        
        # Check if user exists and password matches
        if user_data and user_data[1] == password:  # Plain text comparison for now
            user_obj = {
                "username": user_data[0],
                "displayName": user_data[0],  # Use username as displayName since name column doesn't exist
                "email": user_data[2]
            }
            
            # Store in session
            session['user'] = user_obj
            
            print(f"Login successful for user: {username}")
            cursor.close()
            conn.close()
            return jsonify({"success": True, "user": user_obj})
        else:
            if not user_data:
                print(f"User not found: {username}")
                cursor.close()
                conn.close()
                return jsonify({"success": False, "error": "User not found"}), 401
            else:
                print(f"Invalid password for user: {username}")
                cursor.close()
                conn.close()
                return jsonify({"success": False, "error": "Invalid password"}), 401
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"An error occurred during login: {str(e)}"}), 500
    
# User signup
@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        check_query = "SELECT COUNT(*) FROM Users WHERE username = %s OR email = %s"
        cursor.execute(check_query, (username, email))
        if cursor.fetchone()[0] > 0:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Username or email already exists"}), 400
        
        # Insert new user - only use fields that exist in your table
        insert_query = """
        INSERT INTO Users (username, email, password)
        VALUES (%s, %s, %s)
        """
        cursor.execute(insert_query, (username, email, password))
        conn.commit()
        
        # Create user object for response
        user_obj = {
            "username": username,
            "displayName": username,  # Use username as display name
            "email": email
        }
        
        # Store in session
        session['user'] = user_obj
        
        cursor.close()
        conn.close()
        return jsonify({"success": True, "user": user_obj})
        
    except Exception as e:
        print(f"Signup error: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"An error occurred during signup: {str(e)}"}), 500

# Update user profile
@app.route("/update-profile", methods=["PUT"])
def update_profile():
    try:
        if 'user' not in session:
            return jsonify({"success": False, "error": "Not authenticated"}), 401
            
        data = request.json
        username = data.get("username")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Your database doesn't have a 'name' column, so we can only update other fields if needed
        # For now, let's just return success
        
        cursor.close()
        conn.close()
        return jsonify({"success": True})
        
    except Exception as e:
        print(f"Profile update error: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"An error occurred updating profile: {str(e)}"}), 500


# Get current logged-in user
@app.route("/current-user", methods=["GET"])
def current_user():
    if "user" in session:
        return jsonify({"success": True, "user": session["user"]})
    else:
        # If no user is logged in, return a default guest user
        guest_user = {
            "username": "Guest",
            "email": "",
            "displayName": "Guest User",
            "isGuest": True,  # Flag to indicate this is a guest user
        }
        return jsonify({"success": True, "user": guest_user})


# Logout route to clear session
@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user", None)  # Remove user from session
    print("Successfuly Logged Out")
    return jsonify({"success": True, "message": "Logged out successfully"})

# Update user interests
@app.route("/user/interests", methods=["PUT"])
def update_interests():
    try:
        if 'user' not in session:
            return jsonify({"success": False, "error": "Not authenticated"}), 401
            
        data = request.json
        username = data.get("username")
        interests = data.get("interests", [])
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user ID
        id_query = "SELECT userID FROM Users WHERE username = %s"
        cursor.execute(id_query, (username,))
        user_result = cursor.fetchone()
        
        if not user_result:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "User not found"}), 404
            
        user_id = user_result[0]
            
        # Delete existing preferences
        delete_query = "DELETE FROM Preferences WHERE userID = %s"
        cursor.execute(delete_query, (user_id,))
        
        # Insert new preferences
        for interest in interests:
            insert_query = "INSERT INTO Preferences (userID, keyword) VALUES (%s, %s)"
            cursor.execute(insert_query, (user_id, interest))
            
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True})
        
    except Exception as e:
        print(f"Interests update error: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"An error occurred updating interests: {str(e)}"}), 500

# Execute SQL directly for debugging - ONLY FOR DEVELOPMENT!
@app.route("/execute-sql", methods=["POST"])
def execute_sql():
    try:
        data = request.json
        query = data.get("query")
        
        if not query:
            return jsonify({"success": False, "error": "No query provided"}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(query)
        
        # If select query
        if query.strip().lower().startswith("select"):
            columns = [column[0] for column in cursor.description]
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            cursor.close()
            conn.close()
            return jsonify({"success": True, "results": results})
        
        # If insert/update/delete
        else:
            conn.commit()
            affected_rows = cursor.rowcount
            cursor.close()
            conn.close()
            return jsonify({"success": True, "affected_rows": affected_rows})
            
    except Exception as e:
        return jsonify({
            "success": False, 
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

# API Endpoint to Get Recommendations
@app.route("/get-recommendations", methods=["POST"])
def get_recommendations():
    try:
        data = request.json
        interests = data.get("interests", [])
        location = data.get("location", "Unknown")
        weather = data.get("weather", "Unknown")
        print(f"Generating recommendations for: Location: {location}, Weather: {weather}, Interests: {interests}")

        if not interests:
            return jsonify({"error": "Interests are required."}), 400

        # Generate prompt and query LLM
        prompt = create_prompt(interests, location, weather)
        recommendations = query_gemini(prompt)

        return jsonify({"recommendations": recommendations})
    except Exception as e:
        print(f"Error in get_recommendations: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route("/get_weather", methods=["POST"])
def weather():
    global latest_location, latest_weather  # Store in global variables

    data = request.json
    lat, lon = data.get("latitude"), data.get("longitude")

    if not lat or not lon:
        return jsonify({"error": "Invalid coordinates"}), 400

    latest_location = get_location(lat, lon)
    latest_weather = get_weather(lat, lon)

    return jsonify({"location": latest_location, "weather": latest_weather})


# Endpoint to get saved weather data for LLM
@app.route("/get_saved_data", methods=["GET"])
def get_saved_data():
    return jsonify({"location": latest_location, "weather": latest_weather})


@app.route("/saved-activities", methods=["GET"])
def get_saved_activities():
    if 'user' not in session:
        return jsonify({"success": False, "error": "Not authenticated"}), 401

    username = session["user"]["username"]
    
    try:
        datab = DatabaseConnection(dbname='MoodMingle', user='moodmingle_user', password='team2', host='104.198.30.234', port=3306)
        datab.connect()
        db_queries = dq(datab.connection)
        activities = db_queries.get_activities(username)
        DatabaseConnection.disconnect(datab)
        
        # Convert database result into a list of dictionaries
        if activities:
            activities_list = [
                {
                    "title": activity[0],  # Assuming the name of the activity is stored in the first column
                    "category": activity[1],
                    "location": activity[2],
                    "weather": activity[3],
                    "description": activity[4],
                }
                for activity in activities
            ]
            return jsonify({"success": True, "activities": activities_list})
        else:
            return jsonify({"success": True, "activities": []})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    

@app.route("/save-activity", methods=["POST"])
def save_activity():
    if "user" not in session:
        return jsonify({"success": False, "error": "Not authenticated"}), 401

    username = session["user"]["username"]
    data = request.json

    # Extract activity details
    title = data.get("title")
    category = data.get("category")
    location = data.get("location")
    weather = data.get("weather")
    description = data.get("description")

    if not title or not category or not location or not weather or not description:
        return jsonify({"success": False, "error": "Missing activity details"}), 400

    try:
        datab = DatabaseConnection(dbname="MoodMingle", user="moodmingle_user", password="team2", host="104.198.30.234", port=3306)
        datab.connect()
        db_queries = dq(datab.connection)

        # Save activity in database
        success = db_queries.save_activity(username, title, category, location, weather, description)
        DatabaseConnection.disconnect(datab)

        if success:
            return jsonify({"success": True, "message": "Activity saved successfully"})
        else:
            return jsonify({"success": False, "error": "Failed to save activity"})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/remove-activity", methods=["POST"])
def remove_activity():
    if "user" not in session:
        return jsonify({"success": False, "error": "Not authenticated"}), 401

    username = session["user"]["username"]
    data = request.json
    title = data.get("title")

    if not title:
        return jsonify({"success": False, "error": "Missing activity title"}), 400

    try:
        datab = DatabaseConnection(dbname="MoodMingle", user="moodmingle_user", password="team2", host="104.198.30.234", port=3306)
        datab.connect()
        db_queries = dq(datab.connection)

        # Delete the activity from the database
        success = db_queries.delete_activity(username, title)
        DatabaseConnection.disconnect(datab)

        if success:
            return jsonify({"success": True, "message": "Activity removed successfully"})
        else:
            return jsonify({"success": False, "error": "Failed to remove activity"})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/save-interests", methods=["POST"])
def save_interests():
    if "user" not in session:
        return jsonify({"success": False, "error": "Not authenticated"}), 401

    username = session["user"]["username"]
    data = request.json
    interests = data.get("interests", [])

    if not interests:
        return jsonify({"success": False, "error": "No interests provided"}), 400

    try:
        datab = DatabaseConnection(dbname="MoodMingle", user="moodmingle_user", password="team2", host="104.198.30.234", port=3306)
        datab.connect()
        db_queries = dq(datab.connection)

        # Save user interests to the database
        success = db_queries.save_preferences(username, interests)
        
        # Regardless of success, make sure we disconnect from the database
        try:
            DatabaseConnection.disconnect(datab)
        except:
            pass
            
        if success:
            # Update user session with new interests
            if "user" in session:
                current_user = session["user"]
                current_user["interests"] = interests
                session["user"] = current_user
                
            return jsonify({"success": True, "message": "Interests saved successfully"})
        else:
            return jsonify({"success": False, "error": "Failed to save interests"}), 500

    except Exception as e:
        print(f"Error saving interests: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
