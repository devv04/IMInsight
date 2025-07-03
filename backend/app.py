import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image

# Internal ML modules
from model.clip_utils import classify_image
from model.object_detection import detect_objects
from model.blip_caption import generate_caption
from model.anomaly_detector import detect_anomalies  # ✅ Anomaly detection

# Supported image formats
SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp'}

# Flask setup
app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(file.filename)
    file_ext = os.path.splitext(filename)[1].lower()

    if file_ext not in SUPPORTED_EXTENSIONS:
        return jsonify({'error': f'Format "{file_ext}" not supported. Please upload JPG, PNG, TIFF, or BMP files.'}), 400

    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    try:
        img = Image.open(file_path)
        file_info = {
            'filename': filename,
            'size': img.size,
            'format': img.format,
            'message': 'Image received and analyzed successfully for naval surveillance.'
        }

        # 🔍 Classification (naval-specific labels)
        labels = [
            "aircraft carrier", "destroyer", "frigate", "submarine", "fighter jet", "drone", "cargo ship", "tanker",
            "patrol boat", "helicopter", "missile", "torpedo", "lifeboat", "supply vessel", "amphibious assault ship","Crew member","naval officer", "naval base", "naval exercise", "naval patrol", "naval surveillance", "naval operation","naval fleet", "naval patrol aircraft"
        ]
        classification = classify_image(file_path, labels)

        # 📸 Caption generation with BLIP
        caption_result = generate_caption(file_path)  # Get full result
        if "error" in caption_result:
            raise Exception(f"Caption generation failed: {caption_result['error']}")

        # 🧠 Object detection with YOLO
        detections = detect_objects(file_path, conf_threshold=0.4, iou_threshold=0.6)  # Pass thresholds
        if "error" in detections:
            raise Exception(f"Object detection failed: {detections['error']}")

        # ⚠️ Anomaly detection using detection summary and objects (naval context)
        anomalies = detect_anomalies(file_path, detections.get("summary", {}), detections.get("objects_detected", []))
        if "error" in anomalies:
            raise Exception(f"Anomaly detection failed: {anomalies['error']}")

        # ✅ Return JSON response with naval-specific details
        return jsonify({
            'file_info': file_info,
            'classification': classification,
            'caption': {
                'text': caption_result['label'],
                'object_count': caption_result.get('object_count'),
                'confidence': caption_result.get('confidence', 'N/A')
            },
            'detections': detections,
            'anomalies_detected': anomalies,
            'naval_assessment': {
                'status': 'Nominal' if anomalies['count'] == 0 else 'Alert',
                'priority': 'High' if any('unauthorized' in a.lower() or 'hazard' in a.lower() for a in anomalies['anomalies_detected']) else 'Low',
                'recommendation': 'Monitor' if anomalies['count'] == 0 else 'Investigate and report to command'
            }
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Analysis Failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)