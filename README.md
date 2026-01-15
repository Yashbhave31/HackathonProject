# Crowd Guardian: AI-Based Public Safety & Risk Detection

**HackItOut 2.0 Submission** **Problem Statement 1:** AI-Based Public Safety Monitoring & Risk Detection System

---

## 📌 Project Overview
Crowd Guardian is a real-time surveillance intelligence system designed for high-density public environments like metro stations, festivals, and markets. By leveraging computer vision, the system automatically counts individuals, monitors motion levels, and assesses environmental risk to prevent stampedes and safety hazards.

## 🚀 Key Features
- **Live Feed Analytics:** Real-time person detection via webcam or IP camera streams.
- **Video Forensics:** Upload recorded surveillance footage for post-event crowd analysis.
- **Dynamic Risk Assessment:** Automated risk levels (LOW, MEDIUM, HIGH) based on real-time density thresholds.
- **Interactive Dashboard:** Live data visualization showing crowd trends and system logs.
- **Optimized AI Pipeline:** Uses frame-skipping and AI resizing for smooth performance on standard hardware.

## 🛠 Tech Stack
- **Frontend:** React.js, Tailwind CSS, Framer Motion (Animations)
- **Backend:** Flask (Python)
- **AI/ML Logic:** YOLOv8 (Ultralytics), OpenCV, PyTorch
- **Data Visualization:** Chart.js

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js & npm

### Backend Setup
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   pip install flask flask-cors opencv-python ultralytics torch
