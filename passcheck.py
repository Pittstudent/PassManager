import sys
import hashlib
import binascii

def generate_master_key(password, salt, iterations=100000, key_length=32):
    # Convert password and salt to bytes
    password_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')

    # Generate the master key using PBKDF2 with SHA-256
    master_key = hashlib.pbkdf2_hmac('sha256', password_bytes, salt_bytes, iterations, key_length)

    # Convert the master key bytes to hexadecimal representation
    master_key_hex = binascii.hexlify(master_key).decode('utf-8')

    # if master_key_hex[0] == '$':
    #     master_key_hex = 'v' + master_key_hex[1:]
    print({"file": 'passcheck.py',"master_key": master_key_hex})
    return master_key_hex

def check_password(input_password, input_salt, hashed_password, iterations=100000, key_length=32):
    # Generate master key from input password and salt
    input_master_key = generate_master_key(input_password, input_salt, iterations, key_length)

   # print("This is it: " + input_master_key)

    # Check if the input master key matches the hashed password
    return input_master_key == hashed_password

# Read input password, salt, and hashed password from command-line arguments
input_password = sys.argv[1]
input_salt = sys.argv[2]
hashed_password = sys.argv[3]

# Check if the input password matches the hashed password
password_matched = check_password(input_password, input_salt, hashed_password)


print({"file": "passcheck.py", "password": input_password, "salt": input_salt, "hashed_password": hashed_password})
# Print the result
if password_matched:
    print("Password matched!")
else:
    print("Password does not match!")
