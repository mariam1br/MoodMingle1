-- used chat to come up with ideas

INSERT INTO Users (username, email, passwordHash, location) VALUES
('alice123', 'alice@example.com', 'hashed_password_1', 'New York'),
('bob99', 'bob@example.com', 'hashed_password_2', 'Los Angeles'),
('charlie_yt', 'charlie@example.com', 'hashed_password_3', 'Chicago'),
('hanahassan', 'hanahassan@example.com', 'hashed_password_3', 'Calgary'),
('daveX', 'dave@example.com', 'hashed_password_4', 'Houston'),
('emma_writes', 'emma@example.com', 'hashed_password_5', 'San Francisco');

INSERT INTO Preferences (userID, keyword) VALUES
(1, 'Sci-Fi'),
(1, 'Basketball'),
(2, 'Painting'),
(3, 'Horror'),
(3, 'Soccer'),
(4, 'Rock'),
(5, 'Hiking');


INSERT INTO Activities (name, category, description, location, weatherDependency, suitableWeather) VALUES
('Basketball Match', 'Sports', 'Local basketball tournament', 'Madison Square Garden', TRUE, 'Sunny'),
('Movie Night: Interstellar', 'Movies', 'Sci-Fi movie screening', NULL, FALSE, 'Any'),
('Painting Workshop', 'Creative', 'Learn to paint landscapes', 'Art Studio LA', FALSE, 'Any'),
('Rock Concert', 'Music', 'Live rock music event', 'Staples Center', TRUE, 'Any'),
('Hiking Adventure', 'Travel', 'Guided mountain hike', 'Rocky Mountains', TRUE, 'Sunny'),
('Football Match', 'Sports', 'Local football match', 'Soldier Field', TRUE, 'Any');


INSERT INTO Weather (location, Date, temperature, conditions) VALUES
('New York', '2024-02-06', 5.4, 'Cloudy'),
('Los Angeles', '2024-02-06', 22.1, 'Sunny'),
('Chicago', '2024-02-06', -3.0, 'Snowy'),
('Houston', '2024-02-06', 18.2, 'Rainy'),
('San Francisco', '2024-02-06', 15.8, 'Windy');


INSERT INTO LocalEvents (name, location, description, tags) VALUES
('Comic Con 2024', 'New York', 'Annual comic convention with cosplay and panels', 'Comics, Sci-Fi, Fantasy'),
('Jazz Night', 'Los Angeles', 'Live jazz music with renowned artists', 'Music, Jazz, Nightlife'),
('Tech Expo', 'San Francisco', 'Showcasing the latest in AI and blockchain technology', 'Technology, AI, Blockchain'),
('Food Festival', 'Chicago', 'A variety of cuisines from around the world', 'Food, Festival, Culture');

INSERT INTO Recommendations (userID, activityID, weatherCondition) VALUES
(1, 2, 'Any'),  -- Alice recommended a Sci-Fi Movie Night
(2, 3, 'Any'),  -- Bob recommended a Painting Workshop
(3, 5, 'Sunny'),  -- Charlie recommended a Hiking Adventure
(4, 4, 'Any'),  -- Dave recommended a Rock Concert
(5, 1, 'Sunny');  -- Emma recommended a Basketball Match

INSERT INTO GoogleGeminiInteractions (userID, query, response) VALUES
(1, 'What are some good Sci-Fi movies?', 'Some great Sci-Fi movies include Interstellar, Inception, and Blade Runner 2049.'),
(2, 'Best painting techniques for beginners?', 'Try using acrylic paints for quick drying and layering. Start with simple landscapes.'),
(3, 'Where can I find a horror movie marathon?', 'There is a horror movie screening at AMC Theaters this weekend.'),
(4, 'Upcoming rock concerts in LA?', 'A rock concert is happening at the Staples Center on Feb 10th.'),
(5, 'Best hiking trails in the Rocky Mountains?', 'Check out Emerald Lake Trail and Sky Pond Trail.');


INSERT INTO APILogs (APIName, requestPayload, responsePayload) VALUES
('Weather API', '{"location": "New York"}', '{"temperature": 5.4, "conditions": "Cloudy"}'),
('Google Maps', '{"query": "hiking trails near me"}', '{"results": ["Emerald Lake Trail", "Sky Pond Trail"]}'),
('Movie Database', '{"query": "latest Sci-Fi movies"}', '{"movies": ["Dune Part Two", "The Creator"]}');
