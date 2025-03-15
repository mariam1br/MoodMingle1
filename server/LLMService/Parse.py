import LLMService
import mysql.connector
from mysql.connector import Error

# Database connection details
DB_CONFIG = {
    'host': '104.198.30.234',  
    'user': 'moodmingle_user',       
    'password': 'team2',  
    'database': 'MoodMingle' 
}

# Function to connect to the MySQL database
def connect_to_database():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("Connected to the database")
            return connection
    except Error as e:
        print(f"Error connecting to the database: {e}")
        return None

# Function to insert activities into the Activities table
def insert_activities(connection, activities, user_id):
    try:
        cursor = connection.cursor()
        for activity in activities:
            query = """
            INSERT INTO Activities (userID, name, category, location, weather, description)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            values = (
                user_id,
                activity['name'],
                activity['genre'],
                activity['location'],
                activity['weather'],
                activity['description']
            )
            cursor.execute(query, values)
        connection.commit()
        print(f"Inserted {len(activities)} activities into the database")
    except Error as e:
        print(f"Error inserting activities: {e}")
    finally:
        if cursor:
            cursor.close()

# Function to insert local events into the LocalEvents table
def insert_local_events(connection, local_events):
    try:
        cursor = connection.cursor()
        for event in local_events:
            query = """
            INSERT INTO LocalEvents (name, location, description, tags)
            VALUES (%s, %s, %s, %s)
            """
            values = (
                event['name'],
                event['location'],
                event['description'],
                event['genre']  # Using 'genre' as tags for simplicity
            )
            cursor.execute(query, values)
        connection.commit()
        print(f"Inserted {len(local_events)} local events into the database")
    except Error as e:
        print(f"Error inserting local events: {e}")
    finally:
        if cursor:
            cursor.close()

# Main function to parse LLM output and insert into the database
def main():
    # Example user ID 
    user_id = 1

    # Example interests, location, and weather
    interests = ['Hiking', 'Basketball', 'Horror Movies', 'Gaming']
    location = "Calgary"
    weather = 'Rainy, 10 Degrees Celsius'

    # Generate prompt and query Gemini
    prompt = LLMService.create_prompt(interests, location, weather)
    recommendations = LLMService.query_gemini(prompt)

    # Extract data from the LLM response
    outdoor = recommendations.get("outdoor_activities", [])
    indoor = recommendations.get("indoor_activities", [])
    local_events = recommendations.get("local_events", [])
    considerations = recommendations.get("considerations", [])

    # Connect to the database
    connection = connect_to_database()
    if not connection:
        return

    # Insert activities into the Activities table
    insert_activities(connection, outdoor + indoor, user_id)

    # Insert local events into the LocalEvents table
    insert_local_events(connection, local_events)

    # Close the database connection
    if connection.is_connected():
        connection.close()
        print("Database connection closed")

    # Display data cleanly (for debugging purposes)
    print("\n🎯 **Recommended Activities:**\n")
    for activity in outdoor + indoor:
        print(activity)

    print("\n🎉 **Local Events:**\n")
    for event in local_events:
        print(event)

    print("\n✅ **Considerations:**\n")
    for tip in considerations:
        print(f"🔹 {tip}")
        
if __name__ == "__main__":
    main()