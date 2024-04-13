require("dotenv").config();

const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
        connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
        ssl: {
                rejectUnauthorized: false
                
        }
});

pool.query( 
        
        `
        CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY NOT NULL, 
                name VARCHAR(200) NOT NULL, 
                email VARCHAR(200) NOT NULL,
                salt VARCHAR(200) NOT NULL,
                password VARCHAR(200) NOT NULL, 
                UNIQUE (email)
                );
        
        
       
        CREATE TABLE IF NOT EXISTS vault (
                id BIGSERIAL PRIMARY KEY NOT NULL,
                user_id BIGINT REFERENCES users(id),
                name VARCHAR(200) NOT NULL, 
                username VARCHAR(200) NOT NULL,
                password VARCHAR(200) NOT NULL,
                key VARCHAR(200) NOT NULL,
                iv VARCHAR(200) NOT NULL
                );`
)




module.exports = { pool }; // Export the pool object