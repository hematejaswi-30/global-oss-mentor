import os
import json
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

# Serve the React built files from frontend/dist
app = Flask(__name__, static_folder="frontend/dist", static_url_path="/")

API_KEY = os.getenv("GOOGLE_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

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
    
    try:
        response = requests.post(f"{API_URL}?key={API_KEY}", json=payload, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            resp_data = response.json()
            try:
                # Safely extract text
                candidates = resp_data.get("candidates", [])
                if not candidates:
                    return jsonify({"error": "AI refused to answer. It might have been flagged by safety filters.", "raw": str(resp_data)}), 500
                
                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    return jsonify({"error": "AI returned an empty response.", "raw": str(resp_data)}), 500
                    
                text = parts[0].get("text", "")
                
                # Just return the raw markdown! No more JSON parsing crashes.
                return jsonify({"markdown": text})
            except Exception as e:
                return jsonify({"error": f"Failed to extract AI response.", "raw": str(resp_data)}), 500
        else:
            return jsonify({"error": f"API Error: {response.text}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server crash: {str(e)}"}), 500

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
    try:
        response = requests.post(f"{API_URL}?key={API_KEY}", json=payload, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            resp_data = response.json()
            candidates = resp_data.get("candidates", [])
            if not candidates:
                return jsonify({"error": "AI refused to evaluate the PR.", "raw": str(resp_data)}), 500
            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts:
                return jsonify({"error": "AI returned an empty evaluation.", "raw": str(resp_data)}), 500
                
            text = parts[0].get("text", "")
            return jsonify({"critique": text})
        else:
            return jsonify({"error": f"API Error: {response.text}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server crash: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
