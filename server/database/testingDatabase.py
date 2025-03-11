import mysql.connector # make sure you install pip install mysql-connector-python
from databaseConnection import DatabaseConnection  # Import the connection class
from databaseQueries import DatabaseQueries  # Import the queries class

# Initialize database connection
db = DatabaseConnection(dbname="MoodMingle", user="root", password="password1")
db.connect()

# Create an instance of DatabaseQueries
db_queries = DatabaseQueries(db.connection)

# Test Case 1: Insert a new user
print("\n--- Test Case 1: Insert a New User ---")
db_queries.insert_into_table(
    table_name="Users",
    columns=["username", "email", "passwordHash", "location"],
    values=("test_user", "test@example.com", "hashed_test_password", "Toronto")
)

# Test Case 2: Retrieve all users
print("\n--- Test Case 2: Retrieve All Users ---")
users = db_queries.select_from_table("Users")
print("Users Table Data:", users)

# Test Case 3: Retrieve specific user by location
print("\n--- Test Case 3: Retrieve Users in Toronto ---")
toronto_users = db_queries.select_from_table("Users", conditions="location='Toronto'")
print("Users in Toronto:", toronto_users)

# Test Case 4: Insert a preference for the new user
print("\n--- Test Case 4: Insert a Preference ---")
db_queries.insert_into_table(
    table_name="Preferences",
    columns=["userID", "category", "keyword"],
    values=(6, "Movies", "Thriller")
)

# Test Case 5: Retrieve preferences for a specific user
print("\n--- Test Case 5: Retrieve Preferences for User 6 ---")
preferences = db_queries.select_from_table("Preferences", conditions="userID=6")
print("User 6 Preferences:", preferences)

# Test Case 6: Insert an invalid user (Duplicate Username - Should Fail)
print("\n--- Test Case 6: Insert Duplicate User (Should Fail) ---")
db_queries.insert_into_table(
    table_name="Users",
    columns=["username", "email", "passwordHash", "location"],
    values=("alice123", "alice@example.com", "new_password", "Boston")
)

# Close database connection after testing
db.disconnect()
