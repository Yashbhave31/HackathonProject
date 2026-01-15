import os
import cv2
import torch
import numpy as np
from ultralytics import YOLO

# --- CONFIGURATION ---
UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "static/processed"
AI_RESIZE_DIM = (640, 360) 
OUTPUT_DIM = (1280, 720)    
FRAME_SKIP = 3              

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# --- MODEL INITIALIZATION ---
device = "cuda" if torch.cuda.is_available() else "cpu"
model = YOLO("yolov8n.pt").to(device)

# --- GLOBAL SYSTEM STATE ---
processing_status = "Idle"
processing_progress = 0
people_count = 0
risk_level = "LOW"
motion_speed = 0.0
motion_coverage = 0.0
motion_status = "IDLE"

def analyze_motion(prev_gray, curr_gray):
    """
    Calculates movement metrics using Farneback Optical Flow.
    Returns average velocity and percentage of frame area in motion.
    """
    # Dense Optical Flow calculation
    flow = cv2.calcOpticalFlowFarneback(prev_gray, curr_gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
    mag, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
    
    # Thresholding to ignore sensor noise
    moving_pixels = mag[mag > 1.0] 
    
    avg_speed = np.mean(moving_pixels) if len(moving_pixels) > 0 else 0.0
    total_pixels = prev_gray.shape[0] * prev_gray.shape[1]
    coverage = (len(moving_pixels) / total_pixels) * 100.0
    
    return avg_speed, coverage

def get_risk_level(speed, coverage):
    """
    Heuristic-based risk assessment combining velocity and crowd density indicators.
    """
    if speed > 5.0: 
        return "HIGH"        # High velocity indicates potential panic or running
    elif coverage > 10.0: 
        return "MEDIUM"      # High coverage indicates high crowd density
    else: 
        return "LOW"         # Stable environment

def process_video_file(input_path, filename):
    """
    Main processing pipeline:
    1. Object Detection (YOLOv8)
    2. Temporal Analysis (Optical Flow)
    3. Heuristic Risk Scoring
    4. Annotated Stream Synthesis
    """
    global processing_status, processing_progress, people_count, risk_level, motion_speed, motion_coverage, motion_status

    try:
        processing_status = "Processing"
        processing_progress = 0
        
        cap = cv2.VideoCapture(input_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 25
        
        output_path = os.path.join(PROCESSED_FOLDER, f"processed_{filename}")
        writer = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*"mp4v"), fps // FRAME_SKIP, OUTPUT_DIM)

        ret, first_frame = cap.read()
        if not ret: return
        
        # Initialize grayscale frame for flow analysis
        prev_gray = cv2.cvtColor(cv2.resize(first_frame, AI_RESIZE_DIM), cv2.COLOR_BGR2GRAY)
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            frame_idx += 1
            if frame_idx % 5 == 0:
                processing_progress = int((frame_idx / total_frames) * 100)

            if frame_idx % FRAME_SKIP != 0: 
                continue

            # Pre-processing: Resize to AI input dimensions
            ai_frame = cv2.resize(frame, AI_RESIZE_DIM)
            
            # Step 1: Neural Inference (Person Class Only)
            results = model(ai_frame, classes=[0], conf=0.35, verbose=False)
            people_count = len(results[0].boxes)

            # Step 2: Temporal Motion Analysis
            curr_gray = cv2.cvtColor(ai_frame, cv2.COLOR_BGR2GRAY)
            speed, coverage = analyze_motion(prev_gray, curr_gray)
            prev_gray = curr_gray.copy()
            
            motion_speed = speed
            motion_coverage = coverage

            # Step 3: Risk Evaluation
            risk_level = get_risk_level(speed, coverage)
            motion_status = "ACTIVE" if speed > 0.5 else "IDLE"

            # Step 4: UI Synthesis and Frame Export
            annotated = cv2.resize(results[0].plot(labels=False, conf=False), OUTPUT_DIM)
            
            # Semantic Color Mapping
            color = (0, 255, 0) # Green (Low)
            if risk_level == "MEDIUM": color = (0, 165, 255) # Orange
            if risk_level == "HIGH": color = (0, 0, 255) # Red

            # Overlay HUD
            cv2.rectangle(annotated, (0, 0), (OUTPUT_DIM[0], 80), (0, 0, 0), -1)
            cv2.putText(annotated, f"RISK: {risk_level}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)
            stats = f"Velocity: {speed:.2f} px/f | Coverage: {coverage:.1f}%"
            cv2.putText(annotated, stats, (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

            writer.write(annotated)

        cap.release()
        writer.release()
        processing_status = "Done"
        processing_progress = 100

    except Exception as e:
        processing_status = "Error"
        print(f"Internal System Error: {e}")
