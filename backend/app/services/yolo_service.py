import os
from PIL import Image
import io

try:
    from ultralytics import YOLO
    _has_ultralytics = True
except ImportError:
    _has_ultralytics = False

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
YOLO_DIR = os.path.join(BASE_DIR, "..", "yolo")
MODEL_PATH = os.path.join(YOLO_DIR, "roadguard_custom.onnx")

class YoloService:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if not _has_ultralytics:
            print("ultralytics not installed, YoloService running in mock mode.")
            return

        if os.path.exists(MODEL_PATH):
            try:
                self.model = YOLO(MODEL_PATH)
                print(f"Successfully loaded YOLO ONNX model from {MODEL_PATH}")
            except Exception as e:
                print(f"Failed to load YOLO model: {e}")
        else:
            print(f"YOLO model not found at {MODEL_PATH}. Running in mock mode.")

    def detect_hazards(self, image_bytes: bytes):
        """
        Runs YOLO detection on the provided image bytes.
        Returns a list of detections: [{"class": "pothole", "confidence": 0.89, "bbox": [x1, y1, x2, y2]}, ...]
        """
        img = Image.open(io.BytesIO(image_bytes))

        if self.model is None:
            # Mock mode if model isn't available
            return [
                {"class": "severe_pothole", "confidence": 0.95, "bbox": [100, 100, 200, 200]},
                {"class": "edge_cracking", "confidence": 0.88, "bbox": [250, 300, 400, 400]}
            ]

        results = self.model(img)
        detections = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                b = box.xyxy[0].tolist()
                c = box.cls.item()
                conf = box.conf.item()
                name = self.model.names[c]
                detections.append({
                    "class": name,
                    "confidence": conf,
                    "bbox": b
                })
        return detections

yolo_service = YoloService()
