-- Insert Users
INSERT INTO MoodMingle.Users (username, name, email, password) VALUES
('alice123', 'alice', 'alice@example.com', 'hashed_password_1'),
('bob99', 'bob', 'bob@example.com', 'hashed_password_2'),
('charlie_yt', 'charlie', 'charlie@example.com', 'hashed_password_3'),
('hanahassan', 'hana', 'hanahassan@example.com', 'hashed_password_3'),
('daveX', 'dave', 'dave@example.com', 'hashed_password_4'),
('emma_writes', 'emma', 'emma@example.com', 'hashed_password_5');

-- Insert Preferences
INSERT INTO MoodMingle.Preferences (userID, keyword) VALUES
(1, 'Sci-Fi'),
(1, 'Basketball'),
(2, 'Painting'),
(3, 'Horror'),
(3, 'Soccer'),
(4, 'Rock'),
(5, 'Hiking');

-- Insert Activities
INSERT INTO MoodMingle.Activities (userID, name, genre, location, weather, description) VALUES
(1, 'Basketball Match', 'Sports', 'Madison Square Garden', 'Sunny', 'Local basketball tournament'),
(1, 'Movie Night: Interstellar', 'Movies', 'Online Streaming', 'Any', 'Sci-Fi movie screening'),
(2, 'Painting Workshop', 'Creative', 'Art Studio LA', 'Any', 'Learn to paint landscapes'),
(4, 'Rock Concert', 'Music', 'Staples Center', 'Any', 'Live rock music event'),
(5, 'Hiking Adventure', 'Travel', 'Rocky Mountains', 'Sunny', 'Guided mountain hike'),
(3, 'Football Match', 'Sports', 'Soldier Field', 'Any', 'Local football match');
