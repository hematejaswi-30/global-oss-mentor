# Original User Request

## 2026-10-04T08:15:09Z

Implement dynamic GitHub username and avatar fetching in the simulated auth modal. This is a single self-contained fix; keep it small and focused.

Working directory: c:/Users/Hema Tejaswi/Downloads/hacktoberfest/gemma-project
Integrity mode: development

## Requirements

### R1. Dynamic Auth State
Update `frontend/src/App.jsx` to track a dynamic `githubUser` string instead of relying on a hardcoded username.

### R2. Modal Input Update
Modify the Auth Modal overlay in `App.jsx`. Replace the single "Sign in with GitHub" button layout with a user input flow:
- Add a text input field prompting for the GitHub username (e.g., "Enter your GitHub username").
- Add a submit/connect button that triggers the simulated login sequence and saves the entered username.

### R3. Dynamic Navbar Display
Update the navbar logged-in state to use the dynamic `githubUser`:
- Avatar image source should be `https://github.com/{githubUser}.png`
- Display text should be `@{githubUser}`

## Acceptance Criteria

### Functional
- [ ] The React app compiles and runs without errors.
- [ ] When clicking "Sign in with GitHub", the modal correctly prompts for a username.
- [ ] After submitting a username (e.g., "octocat"), the modal closes and the navbar accurately displays the provided username and loads the corresponding GitHub avatar image.
- [ ] The simulated login loading state (spinner/delay) is preserved.
