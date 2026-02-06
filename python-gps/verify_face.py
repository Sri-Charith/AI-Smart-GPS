from deepface import DeepFace
import sys
import json

# Check for two arguments (image1 and image2)
if len(sys.argv) != 3:
    print(json.dumps({"error": "Please pass two image URLs"}))
    sys.exit()

image1 = sys.argv[1]
image2 = sys.argv[2]

try:
    result = DeepFace.verify(img1_path=image1, img2_path=image2, model_name="VGG-Face", enforce_detection=False)
    print(json.dumps(result))  # ✅ Only JSON output allowed
except Exception as e:
    print(json.dumps({"error": str(e)}))
