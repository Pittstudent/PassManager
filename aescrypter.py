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

def _decrypt(ciphertext):
    AES_obj = AES.new(key, AES.MODE_CBC, iv)
    raw_bytes = AES_obj.decrypt(ciphertext)
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
        # regular_key = str(key)[2:-1]
        # regular_iv = str(iv)[2:-1]
        print(ciphertext)
        print(key)
        print(iv)
    if(action_type == "decrypt"):
        key = sys.argv[3]
        iv= sys.argv[4]
        passText = passText.encode('utf-8')
        key = key.encode('utf-8')
        iv = iv.encode('utf-8')
        # print("IV IS: " + iv)
        # print(passText)
        print("PASS LEN: " + str(len(passText)))
        print("KEY LEN: " + str(len(key)))
        print("IV LEN: " + str(len(iv)))
        print("PASS: " + str(passText))
        print("KEY: " + str(key))
        print("IV: " + str(iv))
        
        plaintext = _decrypt(passText)
        print(plaintext.decode("utf-8"))