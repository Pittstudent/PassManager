-- Active: 1711031920597@@127.0.0.1@5432@passwords@public
-- Create the database
CREATE DATABASE password_manager;

-- Connect to the newly created database


-- Create a table to store user credentials
CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   username VARCHAR(50) UNIQUE NOT NULL,
   password VARCHAR(255) NOT NULL
);
