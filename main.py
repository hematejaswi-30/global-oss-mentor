import os
import base64
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-4:generateContent"

def ask_gemma(prompt: str, image_path: str = None):
    """
    Sends a text prompt (and an optional image) to the Gemma 4 model via Gemini API.
    """
    if not API_KEY:
        return "Error: GOOGLE_API_KEY not found. Please add it to your .env file."

    # Base payload structure
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
    }

    # If an image is provided, encode it and attach to the payload
    if image_path and os.path.exists(image_path):
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")
            
        ext = image_path.split('.')[-1].lower()
        mime_type = f"image/{ext}" if ext in ['png', 'jpeg', 'webp'] else "image/jpeg"
        if ext == 'jpg': mime_type = "image/jpeg"

        payload["contents"][0]["parts"].append({
            "inlineData": {
                "mimeType": mime_type,
                "data": image_data,
            }
        })

    # Make the API request
    response = requests.post(
        f"{API_URL}?key={API_KEY}",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    if response.status_code != 200:
        return f"API Error: {response.status_code}\n{response.text}"

    data = response.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        return f"Unexpected response format: {data}"

if __name__ == "__main__":
    print("🤖 Gemma 4 Bot Starting...")
    print("-" * 40)
    
    # 1. Test standard text prompt
    prompt = "In one sentence, explain why open-source AI is important."
    print(f"\nUser: {prompt}")
    print(f"Gemma: {ask_gemma(prompt)}")
    
    # 2. To test multimodal (image + text), uncomment the lines below and add an image:
    # print("\nTesting Multimodal...")
    # print(ask_gemma("What is happening in this image?", "sample.png"))
