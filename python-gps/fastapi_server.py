import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow logging
import warnings
warnings.filterwarnings('ignore')  # Suppress all warnings

from fastapi import FastAPI, UploadFile, File, HTTPException
from deepface import DeepFace
import numpy as np
import cv2
import uvicorn
from pydantic import BaseModel
import logging

# Suppress logging for specific libraries
logging.getLogger("tensorflow").setLevel(logging.ERROR)
logging.getLogger("uvicorn.error").setLevel(logging.ERROR)
logging.getLogger("uvicorn.access").setLevel(logging.ERROR)

app = FastAPI()


class UrlRequest(BaseModel):
    url: str

print("🚀 Loading AI Models into Memory...")
try:
    DeepFace.build_model("VGG-Face")
    print("✅ VGG-Face Loaded Successfully")
except Exception as e:
    print(f"❌ Model Load Error: {e}")

@app.post("/extract-embedding")
async def extract_embedding(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"error": "Invalid image data"}

        results = DeepFace.represent(
            img_path=img,
            model_name="VGG-Face",
            enforce_detection=False,
            detector_backend='opencv'
        )

        if not results:
            return {"error": "No face detected"}

        return {"embedding": results[0]["embedding"]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/extract-embedding-from-url")
async def extract_from_url(request: UrlRequest):
    try:
        results = DeepFace.represent(
            img_path=request.url,
            model_name="VGG-Face",
            enforce_detection=False,
            detector_backend='opencv'
        )
        if not results:
            return {"error": "No face detected"}
        return {"embedding": results[0]["embedding"]}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")
