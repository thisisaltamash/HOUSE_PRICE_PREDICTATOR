---
mode: agent
description: Build the California House Price Predictor UI from the product requirements.
---

# California House Price Predictor UI

Implement the frontend described in `UI_PRD.md` without changing the prediction model or backend prediction semantics.

## Objective
Build a responsive single-page web app for the existing California house price prediction API. The app should let users:
- enter one home’s features in a form and get a single prediction
- upload a CSV for batch predictions and download the result
- use the real backend `/predict` and `/predict-file` endpoints
- show clear validation and error states
- remain usable on mobile and desktop

## Project context
- Existing backend: FastAPI in `main.py`
- Model artifacts: `house_model.joblib` and `house_features.joblib`
- Health endpoint: `GET /health`
- Single prediction endpoint: `POST /predict`
- Batch CSV endpoint: `POST /predict-file`
- Required API/CSV fields are exactly:
  - `MedInc`
  - `HouseAge`
  - `AveRooms`
  - `AveBedrms`
  - `Population`
  - `AveOccup`
  - `Latitude`
  - `Longitude`

## Constraints
- Do not retrain or alter the prediction model or model files.
- Do not fabricate predictions in the frontend.
- Use the real API responses only.
- If CORS is needed for local browser testing, make the smallest explicit backend change and document the local origins.
- Keep frontend code in a clearly named directory such as `frontend/` when using a generated app.
- Keep the API base URL configurable via environment settings with a local default of `http://localhost:8000`.
- Add a brief frontend README or update setup docs with exact install, run, and build commands.

## Required behavior
1. Show a polished app shell titled “California House Price Predictor”.
2. Include navigation or tabs for “Single estimate” and “CSV batch”.
3. Check `GET /health` and display checking/available/unavailable state without blocking the rest of the UI.
4. Single estimate form:
   - all eight numeric inputs
   - client-side validation with field-specific messages
   - loading state while request is in progress
   - exact API field names
   - success display using `predicted_price`
   - show `fidence_range` only when present and label it clearly as an approximate model error range
   - preserve values on API error
   - reset behavior only when appropriate
5. CSV batch workflow:
   - downloadable template with exact required headers
   - file validation for `.csv`, max 10 MB, required columns, and invalid input
   - upload to `POST /predict-file` with multipart field name `file`
   - download successful response as a CSV
   - show clear actionable errors for invalid file, missing headers, malformed CSV, network failure, and backend errors
6. Maintain responsive, keyboard-accessible, and accessible-ui behavior.
7. Include meaningful tests for validation, API interactions, error handling, and CSV download behavior.
8. Run the relevant build/typecheck/test commands and fix issues before finishing.

## Execution guidance
Follow the implementation order in `UI_PRD.md`:
- repository reconnaissance and setup plan
- minimal frontend scaffold
- shared API client and status indicator
- single estimate form + validation
- connect single prediction to backend
- CSV template + preflight checks
- CSV upload + download
- workflow polish and responsive UI
- backend CORS change only if required by browser testing

## Completion checklist
Before considering the task complete, verify:
- the frontend starts with documented commands
- the backend still runs without breaking existing behavior
- the app works against the real API contract
- errors are handled accessibly and honestly
- no fake/mock predictions are introduced
- the app meets the UX and accessibility requirements in `UI_PRD.md`
