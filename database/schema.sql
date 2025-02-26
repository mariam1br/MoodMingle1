-- Create Schema
DROP SCHEMA IF EXISTS MoodMingle;
CREATE SCHEMA MoodMingle;
USE MoodMingle;

CREATE TABLE Users (
    userID SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passwordHASH VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    createdAT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Preferences (
    preferenceID SERIAL PRIMARY KEY,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- e.g., "Movies", "Sports", "Creative"
    keyword VARCHAR(100) NOT NULL -- e.g., "Horror", "Sci-Fi", "Yoga"
);

CREATE TABLE Activities (
    activityID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., "Movies", "Sports", "Local Event"
    description TEXT,
    location VARCHAR(255), -- Optional, only used for local events/places
    weatherDependency BOOLEAN DEFAULT FALSE,
    suitableWeather VARCHAR(255) CHECK (
        suitableWeather IN ('Sunny', 'Rainy', 'Snowy', 'Cloudy', 'Windy', 'Any')
    ) DEFAULT 'Any',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE LocalEvents (
    eventID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100), -- City or specific address
    description TEXT,
    tags TEXT -- JSON or comma-separated tags for search
);

CREATE TABLE Weather (
    weatherID SERIAL PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    Date DATE NOT NULL,
    temperature FLOAT,
    conditions VARCHAR(100), -- e.g., "Rainy", "Sunny", "Snowy"
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE GoogleGeminiInteractions (
    interactionID SERIAL PRIMARY KEY,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Recommendations (
    recommendationID INT AUTO_INCREMENT PRIMARY KEY,
    userID BIGINT UNSIGNED NOT NULL,
    activityID BIGINT UNSIGNED,
    eventID INT,
    weatherCondition VARCHAR(50), -- e.g., 'Sunny', 'Rainy'
    recommendedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (activityID) REFERENCES Activities(activityID),
    FOREIGN KEY (eventID) REFERENCES LocalEvents(eventID)
);

CREATE TABLE APILogs (
    logID INT AUTO_INCREMENT PRIMARY KEY,
    APIName VARCHAR(50), -- e.g., 'Google Maps', 'Weather API'
    requestPayload TEXT, -- JSON data for the request
    responsePayload TEXT, -- JSON data for the response
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





