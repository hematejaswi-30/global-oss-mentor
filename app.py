import os
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

API_KEY = os.getenv("GOOGLE_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent"

def fetch_github_readme(repo_url):
    """Fetches the README file from a public GitHub repository."""
    parts = repo_url.rstrip('/').split('/')
    if len(parts) >= 2:
        user, repo = parts[-2], parts[-1]
        
        # Try finding the README on the main branch
        raw_url = f"https://raw.githubusercontent.com/{user}/{repo}/main/README.md"
        resp = requests.get(raw_url)
        
        if resp.status_code == 404:
            # Fallback to master branch
            raw_url = f"https://raw.githubusercontent.com/{user}/{repo}/master/README.md"
            resp = requests.get(raw_url)
        
        if resp.status_code == 200:
            return resp.text
            
    return None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    repo_url = data.get("repo_url", "")
    
    # 1. Fetch the Repo Data
    readme_content = fetch_github_readme(repo_url)
    if not readme_content:
        return jsonify({"error": "Could not fetch README. Make sure the URL is correct (e.g., https://github.com/user/repo) and the repository is public."}), 400
        
    # 2. The Gemma 4 Prompt!
    prompt = f"""You are a friendly open-source mentor for the global developer community. 
Read the following README from a GitHub repository and write a short, encouraging guide for a beginner on how they can start contributing to this specific project.

Make sure to highlight:
1. A 1-2 sentence summary of what the project does.
2. The exact prerequisites and setup steps (if mentioned).
3. Good areas for a beginner to start looking at (based on the context).
4. A welcoming closing sentence.

Keep the tone encouraging, clear, and perfectly formatted in Markdown.

README CONTENT:
{readme_content[:15000]}
"""

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}]
    }

    # 3. Call Gemini API
    response = requests.post(f"{API_URL}?key={API_KEY}", json=payload, headers={"Content-Type": "application/json"})
    
    if response.status_code == 200:
        result_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        return jsonify({"result": result_text})
    else:
        return jsonify({"error": f"API Error: {response.text}"}), 500

if __name__ == "__main__":
    print("Starting the Gemma 4 OSS Agent Server on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
