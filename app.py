import os
import json
import time
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

# Serve the React built files from frontend/dist
app = Flask(__name__, static_folder="frontend/dist", static_url_path="/")

API_KEY = os.getenv("GOOGLE_API_KEY")

# High-availability model fallback chain
FALLBACK_MODELS = [
    "gemini-flash-latest", 
    "gemini-pro-latest", 
    "gemma-4-31b-it"
]

def fetch_github_readme(repo_url):
    parts = repo_url.rstrip('/').split('/')
    if len(parts) >= 2:
        user, repo = parts[-2], parts[-1]
        raw_url = f"https://raw.githubusercontent.com/{user}/{repo}/main/README.md"
        resp = requests.get(raw_url)
        if resp.status_code == 404:
            raw_url = f"https://raw.githubusercontent.com/{user}/{repo}/master/README.md"
            resp = requests.get(raw_url)
        if resp.status_code == 200:
            return resp.text, f"{user}/{repo}"
    return None, None

def call_ai(payload):
    """Bulletproof API caller with automatic fallback and retries."""
    last_error = "Unknown Error"
    # Try the entire model chain twice
    for attempt in range(2):
        for model in FALLBACK_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
            try:
                response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=15)
                if response.status_code == 200:
                    resp_data = response.json()
                    candidates = resp_data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", ""), None
                else:
                    last_error = f"{response.status_code} from {model}: {response.text}"
                    # If it's a 503 (high demand) or 500, immediately skip to the next model
            except Exception as e:
                last_error = str(e)
        # Brief pause before second wave of retries
        time.sleep(1.5)
    return None, last_error

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    repo_url = data.get("repo_url", "")
    user_skills = data.get("user_skills", "Beginner, knows some basic programming.")
    
    readme_content, repo_name = fetch_github_readme(repo_url)
    if not readme_content:
        return jsonify({"error": "Could not fetch README. Ensure URL is correct and public."}), 400
        
    prompt = f"""You are a helpful Open-Source Mentor.
Read the repository README and the user's skills.

README: {readme_content[:10000]}
USER SKILLS: {user_skills}

Provide a friendly guide for this user formatted beautifully in Markdown. Include:
1. **Confidence Score:** A percentage match based on their skills.
2. **Gap Analysis:** What they need to learn to contribute here.
3. **Hackathon Sprints:** A 4-step plan to get started.
"""
    payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
    
    text, error = call_ai(payload)
    if text:
        return jsonify({"markdown": text})
    else:
        return jsonify({"error": f"API Overloaded. Try again. Log: {error}"}), 503

@app.route("/judge_pr", methods=["POST"])
def judge_pr():
    data = request.json
    pr_title = data.get("pr_title", "")
    pr_body = data.get("pr_body", "")
    
    prompt = f"""You are a strict but friendly open-source maintainer. 
Review this proposed Pull Request for etiquette, completeness, and clarity.

Title: {pr_title}
Description: {pr_body}

Provide a short critique (2-3 paragraphs max). Tell them what is good and what is missing (e.g., linked issues, testing instructions, polite tone). Format your response in Markdown.
"""
    payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
    
    text, error = call_ai(payload)
    if text:
        return jsonify({"critique": text})
    else:
        return jsonify({"error": f"API Overloaded. Try again. Log: {error}"}), 503

if __name__ == "__main__":
    app.run(debug=True, port=5000)
