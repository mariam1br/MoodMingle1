import LLMService
import sys
import os

# Get the absolute path to the project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Add the project root to sys.path
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from database.databaseConnection import db
from database.databaseQueries import DatabaseQueries

# Main function to parse LLM output and insert into the database
def main():
    # Example username 
    username = 'daveX'

    # Example interests, location, and weather
    interests = ['Cars', 'Basketball', 'Comedy Movies', 'Gaming']
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

    # Connect to the database using the DatabaseConnection class
    db_connection = db
    db_connection.connect()

    if not db_connection.connection:
        print("Failed to connect to the database.")
        return

    db_queries = DatabaseQueries(db_connection.connection)

    # Insert activities into the Activities table
    for activity in outdoor + indoor:
        db_queries.save_activity(
            username=username,  # Use the provided username
            name=activity['name'],
            genre=activity['genre'],
            location=activity['location'],
            weather=activity['weather'],
            description=activity['description']
        )

    # Insert local events into the LocalEvents table
    """for event in local_events:
        db_queries.insert_into_table(
            table_name='LocalEvents',
            columns=['name', 'location', 'description', 'tags'],
            values=(event['name'], event['location'], event['description'], event['genre'])
        )""" # Should we incorporate this? Or have this be something else instead?

    # Close the database connection
    db_connection.disconnect()

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