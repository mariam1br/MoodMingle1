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

