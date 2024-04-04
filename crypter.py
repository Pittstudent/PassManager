import base64
import hashlib
import secrets
import sys

ALGORITHM = ""


def hash_password(password, salt=None, iterations=260000):
    assert salt and isinstance(salt, str) and "$" not in salt
    assert isinstance(password, str)
    pw_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations
    )
    b64_hash = base64.b64encode(pw_hash).decode("ascii").strip()
    return "{}${}${}${}".format(ALGORITHM, iterations, salt, b64_hash)


def verify_password(password, password_hash):
    if (password_hash or "").count("$") != 3:
        return False
    algorithm, iterations, salt, b64_hash = password_hash.split("$", 3)
    iterations = int(iterations)
    # assert algorithm == ALGORITHM
    compare_hash = hash_password(password, salt, iterations)

    compare_pass = password_hash.rstrip("\n")

    # one = (''.join([hex(ord(c)) for c in compare_hash]))
    # two = (''.join([hex(ord(c)) for c in compare_pass]))

    # print("compare hash: ", one)
    # print("compare pass: ", two)

    # if(compare_hash == compare_pass):
    #     print("SEXY")

    return secrets.compare_digest(compare_pass, compare_hash)

if __name__ == "__main__":

    action_type = sys.argv[1]
    password = sys.argv[2]
    salt = sys.argv[3]
    hashed_password = sys.argv[4]
    # print(f"({action_type}, {password}, {salt}, {hashed_password})")

    if(action_type == "register"):
        password_hash = hash_password(password, salt)
        print(password_hash)
    if(action_type == "login"):
        if(verify_password(password, hashed_password)):
            print(1)
        else:
            print(2)