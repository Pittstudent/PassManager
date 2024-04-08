from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import binascii
import os
import sys

def _encrypt(plaintext, key, iv):
    if isinstance(plaintext, str):
        plaintext = plaintext.encode()
    paddded_bytes = pad(plaintext, AES.block_size)
    AES_obj = AES.new(key, AES.MODE_CBC, iv)
    ciphertext = AES_obj.encrypt(paddded_bytes)
    return ciphertext

def _decrypt(cipher_bytes):
    AES_obj = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)
    raw_bytes = AES_obj.decrypt(cipher_bytes)
    extracted_bytes = unpad(raw_bytes, AES.block_size)
    return extracted_bytes


if __name__ == "__main__":
    # print("running AES")
    action_type = sys.argv[1]
    passText = sys.argv[2]
    if(action_type == "encrypt"):
        key = os.urandom(32)  # Generate a random 256-bit (32 bytes) key
        iv = os.urandom(16)   # Generate a random 128-bit (16 bytes) IV
        ciphertext = _encrypt(passText, key, iv)

        cipher_hex = binascii.hexlify(ciphertext).decode('utf-8')
        key_hex = binascii.hexlify(key).decode('utf-8')
        iv_hex = binascii.hexlify(iv).decode('utf-8')
        # regular_key = str(key)[2:-1]
        # regular_iv = str(iv)[2:-1]
        print(cipher_hex)
        print(key_hex)
        print(iv_hex)
    if(action_type == "decrypt"):

        key = sys.argv[3]
        iv = sys.argv[4]

        # print(passText)
        # print(key)
        # print(iv)

        # print(len(passText))
        # print(len(key))
        # print(len(iv))

        cipher_str = passText.replace(' ', '')  # Remove spaces
        key_str = key.replace(' ', '')  # Remove spaces
        iv_str = iv.replace(' ', '')  # Remove spaces

        cipher_bytes = bytes.fromhex(cipher_str)
        key_bytes = bytes.fromhex(key_str)
        iv_bytes = bytes.fromhex(iv_str)

        # passText = passText.encode('utf-8')
        # key = key.encode('utf-8')
        # iv = iv.encode('utf-8')
        # print("IV IS: " + iv)
        # print(passText)
        
        # print("PASS LEN: " + str(len(passText)))
        # print("KEY LEN: " + str(len(key)))
        # print("IV LEN: " + str(len(iv)))

        # print("PASS AFTER ENCODE: " + str(passText))
        # print("KEY AFTER ENCODE: " + str(key))
        # print("IV AFTER ENCODE: " + str(iv))


       
        
        plaintext = _decrypt(cipher_bytes)
        print(plaintext.decode("utf-8"))