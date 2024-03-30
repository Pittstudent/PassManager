import sys
import hashlib
import binascii

def generate_master_key(password, salt, iterations=100000, key_length=None):
    # Convert password and salt to bytes
    password_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')

    if(key_length is None):
        key_length = hashlib.new('sha256').digest_size

    # Generate the master key using PBKDF2 with SHA-256
    master_key = hashlib.pbkdf2_hmac('sha256', password_bytes, salt_bytes, iterations, key_length)
    # Convert the master key bytes to hexadecimal representation
    master_key_hex = binascii.hexlify(master_key).decode('utf-8')

    # if master_key_hex[0] == '$':
    #     master_key_hex = 'v' + master_key_hex[1:]
    master_key_hex = master_key_hex.replace("\n", "")
    # print({"file": 'crypter.py',"master_key": master_key_hex})
    return master_key_hex

# Read password and salt from command-line arguments

action_type = sys.argv[1]
password = sys.argv[2]
salt = sys.argv[3]
hashed_password = sys.argv[4]


if action_type == "register":
    # Generate the master key
    master_key = generate_master_key(password, salt)

    # print({"file": "crypter.py", "password": password, "salt": salt, "master_key": master_key, "master_key_length": len(master_key)})


    # Print the master key
    print(master_key)


if(action_type == "login"):


# Generate the master key
    master_key = generate_master_key(password, salt, key_length=len(hashed_password))
    is_password_matched = master_key == hashed_password
    if is_password_matched:
        print("Password matched!")
    else:
        print("Password does not match!")



# print({"file": "crypter.py", "password": password, "salt": salt, "master_key": master_key, "master_key_length": len(master_key)})


# Print the master key


