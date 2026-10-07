from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import base64
import numpy as np
import cv2
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

def base64_to_image(base64_str):
    try:
        if "base64," in base64_str:
            base64_str = base64_str.split(",")[1]
        img_data = base64.b64decode(base64_str)
        img = Image.open(io.BytesIO(img_data)).convert('RGB')
        return np.array(img)
    except Exception as e:
        return None

@app.route('/api/face/validate', methods=['POST'])
def validate_face():
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"status": False, "message": "No image provided"}), 400
        
    image = base64_to_image(data['image'])
    if image is None:
        return jsonify({"status": False, "message": "Invalid image data"}), 400
        
    # Find all faces in the image
    face_locations = face_recognition.face_locations(image)
    
    if len(face_locations) == 0:
        return jsonify({"status": False, "message": "No face detected. Please position the student inside the frame."})
        
    if len(face_locations) > 1:
        return jsonify({"status": False, "message": "Multiple faces detected. Only one student should be visible."})
        
    # Get encoding
    face_encodings = face_recognition.face_encodings(image, face_locations)
    
    if len(face_encodings) == 0:
        return jsonify({"status": False, "message": "Could not extract face features. Try again."})
        
    # Convert numpy array to list for JSON serialization
    encoding = face_encodings[0].tolist()
    
    # Return success with encoding
    return jsonify({
        "status": True,
        "message": "Face validated",
        "data": {
            "encoding": encoding
        }
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
