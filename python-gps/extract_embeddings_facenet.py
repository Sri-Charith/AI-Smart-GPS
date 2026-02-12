from deepface import DeepFace
import pymongo
import requests
from io import BytesIO
from PIL import Image
import numpy as np
import os
import dotenv

# ✅ Load .env from backend
dotenv.load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))
MONGO_URI = os.getenv("MONGO_URI")

client = pymongo.MongoClient(MONGO_URI)
db = client.get_default_database() or client["gatepass"]
students = db['students']

# ✅ Load FaceNet Model
print("🔵 Loading FaceNet model...")
model = DeepFace.build_model('Facenet')
print("✅ FaceNet loaded.")

# ✅ Process students
all_students = list(students.find({}))

for student in all_students:
    try:
        if not student.get('imageUrl'):
            print(f"⚠️ Skipping {student['studentId']} — no image.")
            continue

        # Download image
        response = requests.get(student['imageUrl'])
        img = Image.open(BytesIO(response.content)).convert('RGB')
        img = np.array(img)

        # Extract embedding
        embedding = DeepFace.represent(img_path=img, model_name='Facenet', enforce_detection=False)[0]["embedding"]

        # Update in DB
        students.update_one(
            {"_id": student["_id"]},
            {"$set": {"embeddingFacenet": embedding}}
        )

        print(f"✅ Embedding stored for: {student['studentId']}")

    except Exception as e:
        print(f"❌ Error processing {student['studentId']}: {str(e)}")

print("🎯 Done extracting FaceNet embeddings.")
client.close()
