-- Create Schema
DROP SCHEMA IF EXISTS MoodMingle;
CREATE SCHEMA MoodMingle;
USE MoodMingle;

CREATE TABLE Users (
    userID SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    createdAT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Preferences (
    preferenceID SERIAL PRIMARY KEY,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL -- e.g., "Horror", "Sci-Fi", "Yoga"
);

CREATE TABLE Activities (
    activityID SERIAL PRIMARY KEY,
    userID BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    weather VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

CREATE TABLE Weather (
    weatherID SERIAL PRIMARY KEY,  
    location VARCHAR(255) NOT NULL,  
    Date DATE NOT NULL,  
    temperature DECIMAL(5, 2) NOT NULL,  
    conditions VARCHAR(255) NOT NULL  
);

CREATE TABLE LocalEvents (
    eventID SERIAL PRIMARY KEY,  
    name VARCHAR(255) NOT NULL,  
    location VARCHAR(255) NOT NULL, 
    description TEXT NOT NULL,  
    tags TEXT  -- Tags or categories for the event (e.g., Comics, Music)
);

CREATE TABLE Recommendations (
    recommendationID SERIAL PRIMARY KEY,  
    userID BIGINT UNSIGNED NOT NULL,  
    activityID BIGINT UNSIGNED NOT NULL,  
    weatherCondition VARCHAR(255) NOT NULL,  
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,  
    FOREIGN KEY (activityID) REFERENCES Activities(activityID) ON DELETE CASCADE  
);

CREATE TABLE GoogleGeminiInteractions (
    interactionID SERIAL PRIMARY KEY,  
    userID BIGINT UNSIGNED NOT NULL,  
    query TEXT NOT NULL,  
    response TEXT NOT NULL,  
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE  
);

CREATE TABLE APILogs (
    logID SERIAL PRIMARY KEY,  
    APIName VARCHAR(255) NOT NULL,  
    requestPayload JSON NOT NULL,  
    responsePayload JSON NOT NULL,  
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

