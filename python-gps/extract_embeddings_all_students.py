from pymongo import MongoClient
from deepface import DeepFace
import os
import dotenv

dotenv.load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
# Get DB name from URI or default to 'gatepass'
db = client.get_default_database() or client["gatepass"]
students_collection = db["students"]

students = students_collection.find()

for student in students:
    if "embedding" in student:
        print(f"✅ Already has embedding: {student['name']}")
        continue

    print(f"🧠 Extracting for {student['name']}...")
    try:
        embedding = DeepFace.represent(
            img_path=student["imageUrl"],
            model_name="VGG-Face",
            enforce_detection=False
        )[0]["embedding"]

        students_collection.update_one(
            {"_id": student["_id"]},
            {"$set": {"embedding": embedding}}
        )

        print(f"✅ Saved embedding for {student['name']}")
    except Exception as e:
        print(f"❌ Failed for {student['name']}: {e}")
