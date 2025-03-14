import mysql.connector

class DatabaseConnection:
    def __init__(self, dbname, user, password, host='localhost', port=3306):
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.connection = None
        self.cursor = None
    
    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                database=self.dbname,
                user=self.user,
                password=self.password,
                host=self.host,
                port=self.port
            )
            self.cursor = self.connection.cursor()
            print("Database connection established.")
        except mysql.connector.Error as e:
            print(f"Error connecting to the database: {e}")
    
    def disconnect(self):
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
            print("Database connection closed.")


db = DatabaseConnection(
    dbname='MoodMingle',
    user='moodmingle_user',
    password='team2',
    host='104.198.30.234',
    port=3306
)

db.connect()
# db.disconnect()
