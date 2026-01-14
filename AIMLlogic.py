import os
import cv2
import torch
from ultralytics import YOLO

UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "static/processed"

# 🚀 SPEED OPTIMIZATION SETTINGS
AI_RESIZE_DIM = (640, 360)  # Lower res for AI processing (Massive speed boost)
OUTPUT_DIM = (1280, 720)    # Keep output high quality for the UI
FRAME_SKIP = 5              # Process every 5th frame (Huge speed boost)
CONF = 0.30                 # Slightly lower confidence for faster detection

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

device = "cuda" if torch.cuda.is_available() else "cpu"
# Use 'yolov8n.pt' - it is the fastest version available
model = YOLO("yolov8n.pt").to(device)

# 🔹 SHARED STATE
processing_status = "Idle"
processing_progress = 0
people_count = 0
risk_level = "LOW"
motion_status = "IDLE"

def process_video_file(input_path, filename):
    global processing_status, processing_progress
    global people_count, risk_level, motion_status

    try:
        processing_status = "Processing"
        processing_progress = 0
        people_count = 0
        motion_status = "IDLE"

        cap = cv2.VideoCapture(input_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 25

        output_path = os.path.join(PROCESSED_FOLDER, f"processed_{filename}")

        # Optimize VideoWriter for speed
        writer = cv2.VideoWriter(
            output_path,
            cv2.VideoWriter_fourcc(*"mp4v"),
            max(1, fps // FRAME_SKIP),
            OUTPUT_DIM
        )

        frame_idx = 0
        max_people = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            
            # Update progress less frequently to save CPU cycles
            if frame_idx % 10 == 0:
                processing_progress = int((frame_idx / total_frames) * 100)

            # 🚀 SKIP FRAMES: Only process every Nth frame
            if frame_idx % FRAME_SKIP != 0:
                continue

            # 🚀 RESIZE BEFORE AI: Smaller images process much faster
            ai_frame = cv2.resize(frame, AI_RESIZE_DIM)

            # Run inference
            results = model(ai_frame, classes=[0], conf=CONF, verbose=False)
            count = len(results[0].boxes)

            max_people = max(max_people, count)
            people_count = max_people

            if count > 0:
                motion_status = "ACTIVE"

            # 🚀 OPTIMIZED ANNOTATION
            # We plot on the original frame size for better visuals
            # but use the detection data from the small frame
            annotated = results[0].plot(labels=False, conf=False)
            annotated = cv2.resize(annotated, OUTPUT_DIM)

            cv2.putText(
                annotated,
                f"People: {count}",
                (40, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.5,
                (0, 255, 0),
                3
            )

            writer.write(annotated)

        cap.release()
        writer.release()

        # 🔥 FINAL RISK LOGIC
        if people_count < 10: risk_level = "LOW"
        elif people_count < 25: risk_level = "MEDIUM"
        else: risk_level = "HIGH"

        processing_status = "Done"
        processing_progress = 100

    except Exception as e:
        processing_status = "Error"
        print("❌ Video processing error:", e)