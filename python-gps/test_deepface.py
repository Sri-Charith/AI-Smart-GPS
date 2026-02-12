from deepface import DeepFace
print("DeepFace imported successfully")
try:
    model = DeepFace.build_model('VGG-Face')
    print("VGG-Face model built successfully")
except Exception as e:
    print(f"Error: {e}")
