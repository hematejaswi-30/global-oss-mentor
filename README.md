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
