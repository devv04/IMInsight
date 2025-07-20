IMInsight – Naval Image Analysis System
IMInsight is an AI-powered image analysis platform tailored for naval and underwater surveillance. It leverages deep learning models like YOLOv8 and semantic segmentation to detect, classify, and interpret maritime imagery such as ships, debris, marine life, and underwater structures.

📌 Key Features
🚢 Ship & vessel detection using YOLOv8

🐠 Underwater object classification (fish, coral, wrecks, etc.)

🌐 Sleek front-end (React.js) + Flask backend integration

🗺️ Geo-visualization with Leaflet.js (planned)

🔍 Anomaly detection (crowds, unusual objects) (in progress)

🚀 Getting Started
1️⃣ Clone the Repo
bash
Copy
Edit
git clone https://github.com/devv04/IMInsight.git
cd IMInsight
2️⃣ Backend Setup (Flask)
bash
Copy
Edit
cd backend
python -m venv venv
venv\Scripts\activate  # or source venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
python app.py
3️⃣ Frontend Setup (React)

Copy
Edit
cd frontend
npm install
npm run dev
Open http://localhost:5173 to view the UI.

🧠 ML Models & Datasets
Model Used: YOLOv8 (Nano/Medium)

Training Platform: Roboflow + Local (Ultralytics)

Datasets:


Brackish (Roboflow) – Marine life detection

Custom-labeled underwater images (110+ samples)


Real-time ship classification

Geo-mapping with Leaflet.js

Naval-specific anomaly detection

🎯 Training Command Example

Copy
Edit
yolo detect train model=yolov8n.pt data=data.yaml epochs=50 imgsz=640
🧠 Example Use Cases
patrol image analysis

Autonomous underwater vehicle (AUV) vision

Oceanographic research visualization

 Contributors"
👨‍💻 Dev Garg (GitHub)

📜 License
This project is licensed under the MIT License.
