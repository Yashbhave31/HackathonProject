import os
import threading
import cv2
from flask import Flask, jsonify, send_from_directory, Response, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from ultralytics import YOLO
import AIMLlogic as ai

# --- INITIALIZATION ---
app = Flask(__name__)
CORS(app)

# Directory configurations for storage and asset serving
UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "static/processed"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"mp4", "avi", "mov", "mkv"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# --- GLOBAL LIVE STATE ---
live_model = YOLO("yolov8n.pt")
live_running = False
live_people_count = 0
live_risk_level = "LOW"
live_motion_status = "IDLE"
cap = None
cause = ""

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ===============================
# 🎥 ASYNCHRONOUS VIDEO PROCESSING
# ===============================

@app.route("/upload-video", methods=["POST"])
def upload_video():
    """Handles video upload and triggers background AI processing thread."""
    if "video" not in request.files:
        return jsonify({"error": "No video uploaded"}), 400
    
    file = request.files["video"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file or filename"}), 400

    filename = secure_filename(file.filename)
    upload_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(upload_path)

    # Launch background thread to prevent blocking the HTTP response
    threading.Thread(
        target=ai.process_video_file, args=(upload_path, filename), daemon=True
    ).start()

    return jsonify({"status": "processing started", "filename": filename})

@app.route("/progress", methods=["GET"])
def progress():
    """Poll endpoint to fetch real-time metrics from the AIMLlogic state."""
    return jsonify({
        "status": ai.processing_status,
        "progress": ai.processing_progress,
        "people_count": ai.people_count,
        "risk": ai.risk_level,
        "speed": float(ai.motion_speed),
        "coverage": float(ai.motion_coverage),
        "motion": ai.motion_status,
        "Primary_Cause":ai.main_signal,
        "Risk_Score":ai.risk_score,

    })

# ===============================
# 🔴 LIVE INTELLIGENCE STREAMING
# ===============================

def live_camera_thread():
    """Generator function for MJPEG streaming with real-time inference."""
    global live_running, live_people_count, live_risk_level, live_motion_status, cap
    
    cap = cv2.VideoCapture(0)
    while live_running:
        ret, frame = cap.read()
        if not ret:
            continue
            
        frame = cv2.resize(frame, (640, 480))
        # Perform inference on the live frame
        results = live_model(frame, classes=[0], conf=0.35, verbose=False)
        
        count = len(results[0].boxes)
        live_people_count = count
        live_motion_status = "ACTIVE" if count > 0 else "IDLE"

        # Heuristic Risk Mapping
        if count < 10:
            live_risk_level = "LOW"
        elif count < 15:
            live_risk_level = "MEDIUM"
        else:
            live_risk_level = "HIGH"

        # Encode resulting frame for MJPEG stream
        _, buffer = cv2.imencode('.jpg', results[0].plot(labels=False, conf=False))
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route("/video_feed")
def video_feed():
    """Multipart response endpoint for live AI visualization."""
    global live_running
    if not live_running:
        live_running = True
        threading.Thread(target=live_camera_thread, daemon=True).start()
        
    return Response(live_camera_thread(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/live_progress")
def live_progress():
    """Real-time metadata endpoint for the Live Dashboard UI."""
    return jsonify({
        "people_count": live_people_count,
        "risk": live_risk_level,
        "motion": live_motion_status
        # "Cause:":
    })

@app.route("/stop_live")
def stop_live():
    """Terminates camera hardware access and resets live state."""
    global live_running, cap
    live_running = False
    if cap:
        cap.release()
    return jsonify({"status": "Live detection stopped"})

# ===============================
# 📂 ASSET SERVING & SYSTEM STATUS
# ===============================

@app.route("/processed/<filename>")
def processed_video(filename):
    return send_from_directory(PROCESSED_FOLDER, filename)

@app.route("/")
def home():
    return jsonify({"system_status": "online", "engine": "YOLOv8-Farneback"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
