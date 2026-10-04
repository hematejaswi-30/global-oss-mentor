# 🚀 Global OSS Mentor

**Global OSS Mentor** is an AI-powered agent designed to help beginners make their first open-source contribution. By simply pasting a GitHub repository URL, the app uses **Gemma 4** (via the Gemini API) to read the repository's documentation and generate a welcoming, step-by-step contribution guide tailored specifically for new developers.

*Built for Hacktoberfest Hack Day!*

## 🌟 Features
* **AI Repository Analysis:** Fetches and analyzes raw `README.md` files from any public GitHub repository.
* **Powered by Gemma 4:** Uses Google's lightweight open model to summarize project goals and extract setup prerequisites.
* **Beginner Friendly:** Translates complex repository documentation into simple, encouraging steps.
* **Global Accessibility:** Deployed on Render for universal access by any community.

## 🛠️ Tech Stack
* **Backend:** Python, Flask
* **AI Model:** Gemma 4 (Gemini API)
* **Frontend:** HTML, Bootstrap, Marked.js
* **Deployment:** Render (Serverless Web App)

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hematejaswi-30/global-oss-mentor.git
   cd global-oss-mentor
   ```

2. **Set up a Virtual Environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Add your API Key:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GOOGLE_API_KEY="your_actual_api_key_here"
   ```

5. **Run the Application:**
   ```bash
   python app.py
   ```
   Open `http://127.0.0.1:5000` in your browser!

## 📜 License
This project is licensed under the MIT License - ensuring it remains free and open-source for the community!

## 🎮 How to Demo the PR Simulator

Want to see the AI Mentor in action? Scroll down to the **PR Simulator** on the live site and try these two scenarios to see how it grades your open-source etiquette.

### Scenario 1: The "Bad" PR (Watch the AI correct you)
* **Pull Request Title:** `Update code`
* **Pull Request Description:** `I fixed some bugs.`
* **Expected Result:** The AI will politely reject this, explaining that the title is too vague, the description lacks detail, and there are no testing instructions. This solves the psychological barrier of making mistakes on real repositories!

### Scenario 2: The "Good" PR (Watch the AI approve)
* **Pull Request Title:** `Fix spelling typo in README.md`
* **Pull Request Description:** *(Click "+ Insert Standard Template" and fill it out like this)*
  ```text
  ## What does this PR do?
  - Fixed a typo where "Android" was spelled "Andriod" in the installation section.

  ## Fixes Issue
  Closes #12

  ## Testing Instructions
  1. Read the installation paragraph to verify the spelling is correct.
  ```
* **Expected Result:** The AI will praise you for following open-source etiquette, linking an issue, and providing clear testing details.
