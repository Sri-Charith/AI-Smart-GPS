from deepface import DeepFace
import sys
import json

if len(sys.argv) != 2:
    print(json.dumps({"error": "Image URL required"}))
    sys.exit()

image_url = sys.argv[1]

try:
    embedding = DeepFace.represent(img_path=image_url, model_name="VGG-Face", enforce_detection=False)[0]["embedding"]
    print(json.dumps({ "embedding": embedding }))
except Exception as e:
    print(json.dumps({"error": str(e)}))
