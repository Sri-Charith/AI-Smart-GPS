from deepface import DeepFace
import sys
import json

# 🔽 Read input from Node.js
input_data = sys.stdin.read()
try:
    data = json.loads(input_data)
    scanned_url = data["scannedImageUrl"]
    students = data["students"]
except Exception as e:
    print(json.dumps({"error": f"Invalid input: {str(e)}"}))
    sys.exit()

# 🔍 Represent scanned image
try:
    scanned_embedding = DeepFace.represent(img_path=scanned_url, model_name="VGG-Face", enforce_detection=False)[0]["embedding"]
except Exception as e:
    print(json.dumps({"verified": False, "error": f"Scanned image error: {str(e)}"}))
    sys.exit()

# 🔁 Compare with each student embedding
from numpy import dot
from numpy.linalg import norm

def cosine_similarity(a, b):
    return dot(a, b) / (norm(a) * norm(b))

threshold = 0.68
matched_student = None

for student in students:
    similarity = cosine_similarity(scanned_embedding, student["embedding"])
    if similarity > (1 - threshold):
        matched_student = student
        break

if matched_student:
    print(json.dumps({
        "verified": True,
        "studentId": matched_student["studentId"],
        "name": matched_student["name"]
    }))
else:
    print(json.dumps({ "verified": False }))
