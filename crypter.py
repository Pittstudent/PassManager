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

    return master_key_hex

# Read password and salt from command-line arguments
password = sys.argv[1]
salt = sys.argv[2]

# Generate the master key
master_key = generate_master_key(password, salt)

# Print the master key
print(master_key)
