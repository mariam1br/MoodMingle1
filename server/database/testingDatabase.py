import mysql.connector  # Ensure you have installed: pip install mysql-connector-python
from databaseConnection import DatabaseConnection  # Import the connection class
from databaseQueries import DatabaseQueries  # Import the queries class

# Initialize database connection
db = DatabaseConnection(dbname='MoodMingle', user='moodmingle_user', password='team2', host='104.198.30.234', port=3306)
db.connect()

# Create an instance of DatabaseQueries
db_queries = DatabaseQueries(db.connection)

# Test Case 1: Insert a new user
print("\n--- Test Case 1: Insert a New User ---")
db_queries.insert_into_table(
    table_name="Users",
    columns=["username", "email", "password"],
    values=("test_user", "test@example.com", "hashed_test_password")
)

# Test Case 2: Check if user exists
print("\n--- Test Case 2: Check if User Exists ---")
user_exists = db_queries.user_exists("test_user", "hashed_test_password")
print("User Exists:", user_exists)

# Test Case 3: Insert a preference for the new user
print("\n--- Test Case 3: Insert Preferences ---")
db_queries.save_preferences("test_user", ["Horror", "Sci-Fi", "Yoga"])

# Test Case 4: Retrieve preferences for the user
print("\n--- Test Case 4: Retrieve Preferences ---")
preferences = db_queries.get_preferences("test_user")
print("User Preferences:", preferences)

# Test Case 5: Delete a specific preference for the user
print("\n--- Test Case 5: Delete a Preference ---")
deleted_preference = db_queries.delete_preference("test_user", "Horror")
print("Preference Deleted:", deleted_preference)

# Test Case 6: Insert an activity for the new user
print("\n--- Test Case 6: Insert an Activity ---")
db_queries.save_activity(
    username="test_user",
    name="Running",
    genre="Fitness",
    location="Central Park",
    weather="Sunny",
    description="Morning jog in the park"
)

# Test Case 7: Retrieve all activities for the user
print("\n--- Test Case 7: Retrieve All Activities ---")
activities = db_queries.get_activities("test_user")
print("User Activities:", activities)

# Test Case 8: Delete an activity for the user
print("\n--- Test Case 8: Delete an Activity ---")
deleted_activity = db_queries.delete_activity("test_user", "Running")
print("Activity Deleted:", deleted_activity)

# Test Case 9: Delete the user
print("\n--- Test Case 9: Delete User ---")
deleted_user = db_queries.delete_user("test_user", "hashed_test_password")
print("User Deleted:", deleted_user)

# Test Case 10: Verify user deletion
print("\n--- Test Case 10: Verify User No Longer Exists ---")
user_exists_after_deletion = db_queries.user_exists("test_user", "hashed_test_password")
print("User Exists After Deletion:", user_exists_after_deletion)

# Close database connection after testing
db.disconnect()