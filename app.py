from flask import Flask, request, render_template
import psycopg2

app = Flask(__name__)

# Database connection parameters
DB_NAME = 'password_manager'
DB_USER = 'your_username'
DB_PASSWORD = 'your_password'
DB_HOST = 'localhost'
DB_PORT = '5432'

# Function to insert data into the database
def insert_data(username, password):
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except (Exception, psycopg2.Error) as error:
        print("Error while inserting data:", error)
        return False

@app.route('/submit', methods=['POST'])
def submit():
    username = request.form['username']
    password = request.form['password']
    if insert_data(username, password):
        return "Data inserted successfully!"
    else:
        return "Error inserting data."

if __name__ == '__main__':
    app.run(debug=True)
