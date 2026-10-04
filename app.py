import os
import json
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

# Serve the React built files from frontend/dist
app = Flask(__name__, static_folder="frontend/dist", static_url_path="/")

API_KEY = os.getenv("GOOGLE_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent"

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
        
    prompt = f"""You are an Open-Source Mentor. 
The user wants to contribute to this repository.
Their current skills: {user_skills}

Repository README:
{readme_content[:15000]}

Analyze the user's fit for this project and output ONLY a valid JSON object with the following keys (do not add any markdown formatting or backticks around the JSON):
{{
  "confidence_score": <an integer between 0 and 100 representing how well their skills match>,
  "summary": "<1-2 sentence summary of what the project does>",
  "gap_analysis": ["<skill to learn>", "<concept to learn>"],
  "sprints": ["<sprint 1: setup>", "<sprint 2: discovery>", "<sprint 3>", "<sprint 4>"]
}}
"""

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    try:
        response = requests.post(f"{API_URL}?key={API_KEY}", json=payload, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            resp_data = response.json()
            try:
                import re
                text = resp_data["candidates"][0]["content"]["parts"][0]["text"]
                
                # Robust JSON extraction: Find everything between the first { and last }
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if not match:
                    return jsonify({"error": f"AI outputted text instead of data: {text[:100]}..."}), 500
                
                json_str = match.group(0)
                parsed_json = json.loads(json_str)
                return jsonify(parsed_json)
            except (KeyError, IndexError, json.JSONDecodeError) as e:
                return jsonify({"error": f"Failed to parse AI response. Error: {str(e)}", "raw": text}), 500
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
            text = resp_data["candidates"][0]["content"]["parts"][0]["text"]
            return jsonify({"critique": text})
        else:
            return jsonify({"error": f"API Error: {response.text}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server crash: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
