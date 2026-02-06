# extract_embeddings_facenet.py
from deepface import DeepFace
import pymongo
import requests
from io import BytesIO
from PIL import Image
import numpy as np

# ✅ Connect to MongoDB
MONGO_URI = "mongodb+srv://admin:securepassword123@cluster0.gynkk.mongodb.net/gatepassDB?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(MONGO_URI)
db = client['gatepassDB']  # your db name
students = db['students']  # your collection name

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
