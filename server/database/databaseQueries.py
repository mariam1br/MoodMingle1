import mysql.connector

class DatabaseQueries:
    def __init__(self, connection):
        self.connection = connection #from DatabaseConnection.connect()
        self.cursor = self.connection.cursor()
    
    def insert_into_table(self, table_name, columns, values):
        placeholders = ', '.join(['%s'] * len(values))
        columns_formatted = ', '.join(columns)
        query = f"INSERT INTO {table_name} ({columns_formatted}) VALUES ({placeholders})"
        try:
            self.cursor.execute(query, values)
            self.connection.commit()
            print(f"Data inserted into {table_name} successfully.")
        except mysql.connector.Error as e:
            print(f"Error inserting data into {table_name}: {e}")
            self.connection.rollback()
    
    def select_from_table(self, table_name, columns='*', conditions=None):
        columns_formatted = ', '.join(columns) if isinstance(columns, (list, tuple)) else columns
        query = f"SELECT {columns_formatted} FROM {table_name}"
        if conditions:
            query += f" WHERE {conditions}"
        try:
            self.cursor.execute(query)
            return self.cursor.fetchall()
        except mysql.connector.Error as e:
            print(f"Error fetching data from {table_name}: {e}")
            return None
        
    # Function to add a user
    def add_user(self, username, email, password):
        check_query = "SELECT COUNT(*) FROM Users WHERE username = %s OR email = %s"
        insert_query = """
        INSERT INTO Users (username, email, password)
        VALUES (%s, %s, %s)
        """
        try:
            self.cursor.execute(check_query, (username, email))
            if self.cursor.fetchone()[0] > 0:
                print(f"User with username '{username}' or email '{email}' already exists.")
                return False  # User already exists

            # Insert new user
            self.cursor.execute(insert_query, (username, email, password))
            self.connection.commit()
            print(f"User '{username}' added successfully!")
            return True
        except mysql.connector.Error as e:
            print(f"Error adding user {username}: {e}")
            self.connection.rollback()
            return False

    # Check if user exists (Returns True/False)
    def user_exists(self, username, password):
        query = """
        SELECT COUNT(*) FROM Users WHERE username = %s AND password = %s
        """
        try:
            self.cursor.execute(query, (username, password))
            return self.cursor.fetchone()[0] > 0
        except mysql.connector.Error as e:
            print(f"Error checking user existence: {e}")
            return False

    # Delete user (Deletes user and cascades Preferences/Activities)
    def delete_user(self, username, password):
        query = """
        DELETE FROM Users WHERE username = %s AND password = %s
        """
        try:
            self.cursor.execute(query, (username, password))
            self.connection.commit()
            return self.cursor.rowcount > 0  # Returns True if a row was deleted
        except mysql.connector.Error as e:
            print(f"Error deleting user {username}: {e}")
            return False

    # Get user's name by username
    def get_name_by_username(self, username):
        query = "SELECT name FROM Users WHERE username = %s"
        try:
            self.cursor.execute(query, (username,))
            result = self.cursor.fetchone()
            if result:
                return result[0]  # Return the name of the user
            else:
                print(f"No user found with username: {username}")
                return None
        except mysql.connector.Error as e:
            print(f"Error fetching name for {username}: {e}")
            return None

    # Save user preferences (List of preferences)
    def save_preferences(self, username, preferences):
        user_id_query = "SELECT userID FROM Users WHERE username = %s"
        insert_query = "INSERT INTO Preferences (userID, keyword) VALUES (%s, %s)"
        try:
            self.cursor.execute(user_id_query, (username,))
            user_id = self.cursor.fetchone()
            if not user_id:
                return False  # User not found

            user_id = user_id[0]
            for preference in preferences:
                self.cursor.execute(insert_query, (user_id, preference))
            self.connection.commit()
            return True
        except mysql.connector.Error as e:
            print(f"Error saving preferences for {username}: {e}")
            return False

    # Retrieve all preferences for a user
    def get_preferences(self, username):
        query = """
        SELECT Preferences.keyword 
        FROM Preferences 
        JOIN Users ON Preferences.userID = Users.userID 
        WHERE Users.username = %s
        """
        try:
            self.cursor.execute(query, (username,))
            return [row[0] for row in self.cursor.fetchall()]
        except mysql.connector.Error as e:
            print(f"Error fetching preferences for {username}: {e}")
            return None

    # Delete a specific preference for a user
    def delete_preference(self, username, preference):
        query = """
        DELETE Preferences FROM Preferences
        JOIN Users ON Preferences.userID = Users.userID
        WHERE Users.username = %s AND Preferences.keyword = %s
        """
        try:
            self.cursor.execute(query, (username, preference))
            self.connection.commit()
            return self.cursor.rowcount > 0  # Returns True if a row was deleted
        except mysql.connector.Error as e:
            print(f"Error deleting preference {preference} for {username}: {e}")
            return False

    # Save an activity for a user
    def save_activity(self, username, name, genre, location, weather, description):
        user_id_query = "SELECT userID FROM Users WHERE username = %s"
        insert_query = """
        INSERT INTO Activities (userID, name, genre, location, weather, description)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        try:
            self.cursor.execute(user_id_query, (username,))
            user_id = self.cursor.fetchone()
            if not user_id:
                return False  # User not found

            user_id = user_id[0]
            self.cursor.execute(insert_query, (user_id, name, genre, location, weather, description))
            self.connection.commit()
            return True
        except mysql.connector.Error as e:
            print(f"Error saving activity for {username}: {e}")
            return False

    # Retrieve all activities for a user
    def get_activities(self, username):
        query = """
        SELECT Activities.name, Activities.name, Activities.genre, Activities.location, Activities.weather, Activities.description
        FROM Activities 
        JOIN Users ON Activities.userID = Users.userID 
        WHERE Users.username = %s
        """
        try:
            self.cursor.execute(query, (username,))
            return self.cursor.fetchall()  # Returns list of tuples
        except mysql.connector.Error as e:
            print(f"Error fetching activities for {username}: {e}")
            return None

    # Delete a specific activity for a user
    def delete_activity(self, username, activity_name):
        query = """
        DELETE Activities FROM Activities
        JOIN Users ON Activities.userID = Users.userID
        WHERE Users.username = %s AND Activities.name = %s
        """
        try:
            self.cursor.execute(query, (username, activity_name))
            self.connection.commit()
            return self.cursor.rowcount > 0  # Returns True if a row was deleted
        except mysql.connector.Error as e:
            print(f"Error deleting activity {activity_name} for {username}: {e}")
            return False