import torch
import clip
from PIL import Image
import os

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

def analyze_image(image_path):
    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
    
    # Add your own labels based on your use case
    labels = ["a satellite image", "a forest", "a city", "a river", "a building", "a road", "a mountain", "a vehicle", "a person", "an animal","a ship", "a plane", "a boat", "a bridge", "a park", "a beach", "a desert", "a field", "a factory", "a power plant"]
    text = clip.tokenize(labels).to(device)

    with torch.no_grad():
        image_features = model.encode_image(image)
        text_features = model.encode_text(text)

        logits_per_image, _ = model(image, text)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()

    top_idx = probs[0].argmax()
    return labels[top_idx], probs[0][top_idx]

# Example usage:
if __name__ == "__main__":
    result, confidence = analyze_image("sample.jpg")
    print(f"Prediction: {result} ({confidence:.2%} confidence)")
