from ultralytics import YOLO
from collections import Counter
import traceback
import cv2  # For image processing, if needed

# Load YOLOv8m for improved accuracy
model = YOLO("yolov8m.pt")  # Switched to YOLOv8m

def detect_objects(image_path, conf_threshold=0.4, iou_threshold=0.6):
    """
    Detect objects in an image with customizable confidence and IoU thresholds.
    
    Args:
        image_path (str): Path to the image file
        conf_threshold (float): Minimum confidence score for detection (default: 0.4)
        iou_threshold (float): IoU threshold for NMS (default: 0.6)
    
    Returns:
        dict: Contains list of detected objects with labels and confidence, and a summary
    """
    try:
        # Predict with adjusted parameters
        results = model.predict(
            source=image_path,
            conf=conf_threshold,  # Filter low-confidence detections
            iou=iou_threshold,    # Adjust NMS to reduce duplicate detections
            imgsz=640            # Ensure consistent input size
        )[0]

        objects = []
        for box in results.boxes:
            label = results.names[int(box.cls)]
            confidence = f"{box.conf.item() * 100:.1f}%"
            # Optional: Include bounding box coordinates for debugging
            xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
            objects.append({
                "label": label,
                "confidence": confidence,
                "bbox": xyxy  # Add bounding box for potential anomaly rules
            })

        # Create summary of detected objects
        summary = dict(Counter(obj["label"] for obj in objects))
        return {"objects_detected": objects, "summary": summary}

    except Exception as e:
        print("Object Detection Error:", e)
        traceback.print_exc()
        return {"error": f"Object detection failed: {str(e)}"}

# Example usage (uncomment to test)
if __name__ == "__main__":
    result = detect_objects("1027565.jpg")
    if "error" not in result:
        print("Detected Objects:", result["objects_detected"])
        print("Summary:", result["summary"])
    else:
        print(result["error"])