from flask import Flask, request, jsonify, session
from flask_cors import CORS
from database.databaseConnection import db  # Ensure this is set up to connect to MySQL
from database.databaseQueries import DatabaseQueries as dq  # Import your query class
from LLMService.LLMService import create_prompt, query_gemini
from WeatherService.googleapi import get_location, get_weather

app = Flask(__name__)
app.secret_key = 'kbo7c43w7898jbs'  # Required for session management
CORS(app, supports_credentials=True)  # Enable CORS for frontend-backend communication

# User login
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")
        print(f"Attempting login for {username}")

        db.connect()
        dq_query = dq(db.connection)
        
        # Retrieve user credentials from the database
        user_credentials = dq_query.user_exists_2(username, password)
        
        if user_credentials:
            stored_username, stored_password = user_credentials  # Unpack the username and password from the result
            
            # Check if the entered password matches the stored password (if using hashed passwords, use check_password_hash)
            if stored_username == username and stored_password == password:  # For plaintext passwords
                # For hashed passwords, you would use check_password_hash(stored_password, password)
                
                # Retrieve user data to store in session
                user_data = dq_query.select_from_table("Users", columns=["username", "email"], conditions=f"username='{username}'")[0]
                db.disconnect()
                
                # Store user in session after successful login
                session['user'] = dict(zip(["username", "email", "displayName"], user_data))
                
                print("Login Successful")            
                return jsonify({"success": True, "user": dict(zip(["username", "email"], user_data))})
            else:
                print("Password does not match")
                db.disconnect()
                return jsonify({"success": False, "error": "Invalid username or password"}), 401
        else:
            print("No matching user found")
            db.disconnect()
            return jsonify({"success": False, "error": "Invalid username or password"}), 401

    except Exception as e:
        print(f"Error during login: {str(e)}")
        db.disconnect()
        return jsonify({"success": False, "error": "An error occurred during login"}), 500

# User signup
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    db.connect()
    dq_query = dq(db.connection())
    if dq_query.add_user(username, email, password):  # Assuming this function inserts into DB
        db.disconnect()
        return jsonify({"success": True, "user": {"username": username, "email": email}})
    else:
        db.disconnect()
        return jsonify({"success": False, "error": "Signup failed"}), 400

# Update user profile
@app.route("/update-profile", methods=["PUT"])
def update_profile():
    data = request.json
    username = data.get("username")
    displayName = data.get("displayName")
    location = data.get("location")

    db.connect()
    dq_query = dq(db.connection())
    update_query = f"UPDATE Users SET displayName='{displayName}', location='{location}' WHERE username='{username}'"
    try:
        db.cursor.execute(update_query)
        db.connection.commit()
        db.disconnect()
        return jsonify({"success": True})
    except:
        db.disconnect()
        return jsonify({"success": False, "error": "Update failed"}), 400

# Get current logged-in user
@app.route("/current-user", methods=["GET"])
def current_user():
    if 'user' in session:
        return jsonify({"success": True, "user": session['user']})
    else:
         # If no user is logged in, return a default guest user
        guest_user = {
            "username": "Guest",
            "email": "",
            "displayName": "Guest User",
            "isGuest": True  # Flag to indicate this is a guest user
        }
        return jsonify({"success": True, "user": guest_user})

# Logout route to clear session
@app.route("/logout", methods=["POST"])
def logout():
    session.pop('user', None)  # Remove user from session
    print("Successfuly Logged Out")
    return jsonify({"success": True, "message": "Logged out successfully"})

# API Endpoint to Get Recommendations
@app.route("/get-recommendations", methods=["POST"])
def get_recommendations():
    try:
        # Get location and weather from the frontend request
        data = request.json
        location = data.get("location", "Unknown")
        weather = data.get("weather", "Unknown")
        # location = get_weather()
        # weather = get_location()
        preferences = data.get("preferences", [])

        # Check if a user is logged in
        if 'user' in session:
            current_user = session['user']
            username = current_user.get("username")

            # Connect to the database to fetch user preferences
            db.connect()
            dq_query = dq(db.connection)

            # Fetch user preferences from DB if available
            user_preferences = dq_query.get_preferences(username)
            db.disconnect()

            # If preferences exist in DB, use them
            if user_preferences and user_preferences[0][0]:
                preferences = user_preferences[0][0].split(",")  

        # Generate the prompt and query Gemini
        prompt = create_prompt(preferences, location, weather)
        recommendations = query_gemini(prompt)

        # Return recommendations
        return jsonify({"recommendations": recommendations})

    except Exception as e:
        print(f"Error in get_recommendations: {str(e)}")
        db.disconnect()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
