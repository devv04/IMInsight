# backend/model/clip_utils.py
import clip
import torch
from PIL import Image

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

def classify_image(image_path, labels):
    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
    text = clip.tokenize(labels).to(device)

    with torch.no_grad():
        logits_per_image, _ = model(image, text)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()

    best_index = probs[0].argmax()
    return {
        "label": labels[best_index],
        "confidence": round(float(probs[0][best_index]), 3)
    }

def generate_caption(image_path):
    prompts = [
        "a photo of a satellite image of a city",
        "a close-up of a person",
        "a cat sitting on the ground",
        "an aerial view of a forest",
        "a scenic landscape",
        "a crowded street view",    
        "a photo of a mountain",
        "a photo of a beach",
        "a photo of a river",
        "a photo of a desert",
        "a photo of a building",
        "a photo of a car",
        "a photo of a dog",
        "a photo of a plane",
        "a photo of a train",
        "a photo of a ship",
        "a photo of a world map",
        "a photo of a city skyline",
        "a photo of a park",
        "a photo of a garden",
        "a photo of a bridge",
        "a photo of a highway",
        "a photo of a street",
        "a photo of a monument",    
        "a photo of a statue",
        "a photo of a sculpture",
        "a photo of a fountain",
        "a photo of a tower",
        "a photo of a castle",
        "a photo of a church",
        "a photo of a temple",
        "a photo of a mosque",
        "a photo of a synagogue",
        "a photo of group of people",


    ]
    return classify_image(image_path, prompts)
