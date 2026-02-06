from deepface import DeepFace
import json

# 🔗 Hardcoded student image URLs for now
students = [
    {
        "studentId": "245321733093",
        "name": "Karnati Harini",
        "imageUrl": "https://res.cloudinary.com/dqydfuaau/image/upload/v1744132362/gatepass_students/us32u85ou7aaieg405ap.jpg"
        # "imageUrl": r"c:\Users\DELL\OneDrive\Desktop\PHOTOS\HARINI_245321733093.jpg"
    },
    {
        "studentId": "245321733091",
        "name": "Kanapuram Vaishnavi",
        "imageUrl": "https://res.cloudinary.com/dqydfuaau/image/upload/v1744135605/gatepass_students/etj4adz2rge91z49zhlt.jpg"
        # "imageUrl": r"c:\Users\DELL\OneDrive\Desktop\PHOTOS\VAISHNAVI_245321733091.jpg"
    }
]

embeddings = []

for student in students:
    print(f"🧠 Processing {student['name']}...")
    try:
        embedding = DeepFace.represent(img_path=student["imageUrl"], model_name="VGG-Face", enforce_detection=False)[0]["embedding"]
        embeddings.append({
            "studentId": student["studentId"],
            "name": student["name"],
            "imageUrl": student["imageUrl"],
            "embedding": embedding
        })
    except Exception as e:
        print(f"❌ Failed for {student['name']}: {e}")

# 💾 Save to file
with open("student_embeddings.json", "w") as f:
    json.dump(embeddings, f)

print("✅ All embeddings saved to student_embeddings.json")
