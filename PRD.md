# Product Requirements: California House Price Prediction UI

## 1. Product summary

Build a responsive web interface for the existing California house price prediction project. Users can either enter one home's features in a form or upload a CSV to get predictions for multiple rows. The UI must call the existing FastAPI service and display/download its real results; it must not calculate or invent predictions in the browser.

This document is intended to be given to Antigravity in small, ordered implementation tasks. Complete and verify one task before starting the next.

## 2. Existing project and API

- The backend is FastAPI in `main.py`. It loads `house_model.joblib` and `house_features.joblib` from the project directory.
- The trained model is a `RandomForestRegressor`. Its target is in units of $100,000; the single-prediction API formats the estimated price in USD.
- `GET /health` returns service status, feature names, and an average error string (`39,000 USD`).
- `POST /predict` accepts a JSON object containing all eight numeric fields below. A successful response currently includes `predicted_price`, `predicted_price_short`, and `fidence_range`.
- `POST /predict-file` accepts multipart form data under the key `file`. The CSV must include all eight exact column names. A successful request returns a downloadable CSV with the original columns plus `predicted_price_USD`.
- The backend currently has no frontend, frontend framework, or CORS configuration in this project. Inspect the repository before choosing implementation details. If the UI runs on a different origin and browser requests are blocked by CORS, make the smallest appropriate backend CORS change and document the local development origins.
- Do not change the prediction model, model artifacts, or prediction semantics as part of building the UI.

### Required feature names and validation

Names are case-sensitive in the API and CSV.

| API/CSV field | User-facing label | Client-side validation |
|---|---|---|
| `MedInc` | Median income | Number greater than 0 |
| `HouseAge` | Median house age | Number greater than 0 |
| `AveRooms` | Average rooms per household | Number greater than 0 |
| `AveBedrms` | Average bedrooms per household | Number greater than 0 |
| `Population` | Block group population | Number greater than 0 |
| `AveOccup` | Average household occupancy | Number greater than 0 |
| `Latitude` | Latitude | Number from 32 through 42 |
| `Longitude` | Longitude | Number from -125 through -114 |

Show concise helper text that inputs describe a California census block group, not a specific home's listing price. Do not imply the estimate is an appraisal or guarantee.

## 3. Goals

1. Make a single prediction possible without using API documentation or manually composing JSON.
2. Make batch prediction possible by uploading a valid CSV and downloading the enriched CSV.
3. Explain required inputs, formats, validation, loading, results, and errors clearly.
4. Keep the interface usable on mobile and desktop, keyboard-accessible, and honest about model uncertainty.

## 4. Out of scope

- User accounts, saved prediction history, payments, maps, or real-estate listings.
- Retraining the model, changing model files, or building a new prediction algorithm.
- Fabricated sample predictions, fake charts/metrics, or storing uploaded CSV contents on a server beyond the existing request.
- Adding unrelated backend features or changing the API response contract without a concrete UI integration need.

## 5. Target users and core journeys

### Journey A: Estimate one block group

1. User opens the app and sees what the estimate represents.
2. User enters all eight required values.
3. The UI validates inputs and submits JSON to `POST /predict`.
4. The user sees the formatted estimated price, the API-provided error range if present, and a clear note that the model is an estimate.
5. User can edit values and submit again.

### Journey B: Predict a CSV

1. User switches to the batch/CSV workflow.
2. User downloads a generated CSV template or reads the exact required column list.
3. User chooses or drops a `.csv` file.
4. The UI checks extension, file size (maximum 10 MB), and whether the required headers are present before upload. Do not claim these checks replace backend validation.
5. The UI shows the selected filename and allows removal/reselection.
6. User uploads to `POST /predict-file` as multipart field `file`.
7. On success, the UI downloads the response as `predictions.csv` (or uses the server-provided filename if available) and confirms completion.

## 6. Functional requirements

### F1. App shell

- Create a polished, coherent single-page UI for “California House Price Predictor.”
- Provide clear navigation or tabs for “Single estimate” and “CSV batch.”
- Make the API base URL configurable through the project's normal environment configuration. For local development, default to `http://localhost:8000`; do not hardcode production secrets or assume a deployed URL.
- Check `GET /health` to show a small service status indicator. Clearly distinguish checking, available, and unavailable states. Do not block form entry solely because the health request fails.

### F2. Single estimate form

- Render one labeled input for each of the eight required fields.
- Use numeric input controls with appropriate minimum/maximum constraints; allow decimals where meaningful.
- Validate missing, non-numeric, and out-of-range input before sending a request. Show errors beside the corresponding input and summarize errors accessibly.
- Disable repeat submission while a request is in progress and show a visible loading state.
- Send JSON with the exact API field names to `POST /predict`.
- On success, display `predicted_price` as returned by the API. Display `fidence_range` only if present, but label it as an approximate model error range rather than a confidence interval. Explain that `/health` reports average error of about $39,000 and that this is not a guarantee for an individual estimate.
- If the API responds with an error, show a human-readable message and preserve the user's form values.
- Provide a reset action with an appropriate confirmation only if it would discard entered values; otherwise reset immediately.

### F3. CSV batch workflow

- Accept `.csv` files only, up to 10 MB.
- Provide a downloadable blank CSV template containing the exact required header row. The user may populate it with one or more rows.
- Check that headers are present and identify missing required columns before upload. Do not silently rename columns or drop rows.
- Clearly display upload progress/loading and prevent duplicate submissions while uploading.
- Send the file using `multipart/form-data` with field name `file`; let the browser set the multipart boundary.
- Download the successful response body as a CSV. The current backend returns the source rows plus a `predicted_price_USD` column.
- Show actionable errors for invalid extension, oversized file, missing columns, malformed CSV, server errors, and network/API unavailable. Preserve the selected file when practical so users can correct/retry.
- Do not display a success state or trigger a download for non-success HTTP responses.

### F4. Responsive and accessible behavior

- Support modern desktop, tablet, and mobile viewport widths without horizontal overflow.
- Use semantic headings, form labels, buttons, and status/error announcements. All actions must work with keyboard navigation.
- Maintain visible focus styles, sufficient text/background contrast, and accessible names for drag-and-drop and file input controls.
- Do not rely on color alone to communicate health, validation, or success.

## 7. UX and visual direction

- Use a modern, trustworthy real-estate/analytics visual style: calm neutral background, clear typography, restrained green/blue accent, clean cards, and generous spacing.
- Prioritize a clear page hierarchy: app title and brief explanation, service status, workflow selector, task form/upload panel, then result feedback.
- Keep the single-estimate form approachable; group location inputs together and avoid overwhelming the user with technical jargon.
- Make the primary action visually obvious. Use concise, plain-English labels and inline hints.
- Use consistent visual states for idle, focus, invalid, loading, success, and failure.
- Avoid generic decorative dashboards, fake maps/charts, and metrics that are not supplied by the API.

## 8. Technical requirements and implementation constraints

- First inspect the repository and reuse any existing frontend setup. If none exists, create a small frontend with a currently supported, well-established stack (prefer React, TypeScript, and Vite) without disrupting the Python backend.
- Keep frontend source and dependencies in a clearly named subdirectory such as `frontend/` if the chosen tooling permits.
- Use typed request/response models where supported. Treat the API response as untrusted input and handle missing optional fields.
- Centralize API URL handling and HTTP error parsing; do not duplicate endpoint strings throughout components.
- Avoid putting uploaded file contents, API responses, or personally sensitive data in logs or persistent browser storage.
- Do not add new backend routes merely to support presentation. Keep any required CORS change narrow and explicit.
- Add a brief frontend README or update existing setup documentation with exact install, start, API start, configuration, and test commands.

## 9. Acceptance criteria

1. The UI starts using documented commands without breaking the existing backend.
2. Service status is based on `/health`, and its failure does not crash the UI.
3. A valid single-estimate form sends the exact eight API fields to `/predict`, then displays the returned price.
4. Invalid values are blocked client-side with accessible, field-specific messages and no request is sent.
5. A valid CSV can be selected/dropped and uploaded under the form field `file` to `/predict-file`; the returned CSV downloads successfully.
6. CSV missing headers, non-CSV files, files over 10 MB, backend 4xx/5xx responses, and network errors produce actionable errors, not success UI.
7. The app has no hardcoded mock prediction or fabricated metric.
8. The layout and all workflows remain usable on a narrow mobile viewport and with keyboard-only navigation.
9. The final implementation includes focused tests for input validation, request payloads, response/error handling, and CSV download behavior, plus a production build/type check.
10. Any CORS changes are limited to the required local frontend origin(s) and documented.

## 10. Antigravity execution guide: small tasks

Run these as separate prompts, in order. After each task, inspect the diff, run its stated checks, and fix failures before moving on. Keep each change limited to the task; do not attempt all tasks in one large generation.

### Task 1 — Repository reconnaissance and setup plan

**Prompt to Antigravity:**

> Read `UI_PRD.md`, `main.py`, and the project files. Do not edit files yet. Report the existing API contract, whether any frontend already exists, how to run the backend, and a minimal frontend implementation plan that preserves the Python backend. Identify whether CORS will be needed for local browser development. Do not modify model/training files.

**Done when:** The report correctly describes `/health`, `/predict`, `/predict-file`, the exact eight input fields, and the current CSV output column.

### Task 2 — Minimal frontend scaffold

**Prompt to Antigravity:**

> Implement only the frontend scaffold described by `UI_PRD.md`. Reuse an existing frontend if present; otherwise set up a small React + TypeScript + Vite app under `frontend/`. Add only the dependencies needed for the scaffold, scripts to run and build it, a basic responsive app shell, and environment-based API base URL with local default `http://localhost:8000`. Do not implement prediction workflows yet. Do not edit Python/model files. Verify the development server starts and the production build passes.

**Done when:** A simple app shell renders and its documented dev/build commands work.

### Task 3 — Shared API client and service status

**Prompt to Antigravity:**

> In the existing frontend scaffold, implement a small typed API client using the configured base URL and a service-status indicator driven by `GET /health`. Include checking/available/unavailable states and useful network/HTTP error handling. A failed health check must not prevent the rest of the UI from rendering. Do not implement prediction forms or change the backend unless a confirmed CORS issue requires a minimal documented fix. Add focused tests for status success and failure.

**Done when:** Health status reflects the actual endpoint and its failure is non-blocking.

### Task 4 — Single estimate form and client validation

**Prompt to Antigravity:**

> Implement only the single-estimate form from `UI_PRD.md`. Add all eight labeled fields with the exact API property names and client-side constraints from the PRD. Show field-level validation, accessible error summaries, pending state, and reset behavior. Do not call the API yet; use no fake prediction result. Add focused tests for valid input and each range/required-field rule.

**Done when:** The form is responsive, keyboard-usable, and blocks invalid submissions accessibly.

### Task 5 — Connect single prediction to the backend

**Prompt to Antigravity:**

> Connect the single-estimate form to `POST /predict` through the shared API client. Send JSON with exactly the eight expected fields. Show the returned `predicted_price`; show `fidence_range` only when present and describe it as an approximate model error range, not a confidence interval. Handle loading, HTTP errors, malformed responses, and network failure without clearing entered values. Do not invent fallback predictions. Add tests for request payload, success, and failure.

**Done when:** The form works against the actual FastAPI endpoint, with tests proving the request and UI states.

### Task 6 — CSV template, selection, and preflight checks

**Prompt to Antigravity:**

> Implement only the CSV selection part of the batch workflow. Generate a downloadable blank CSV with the exact eight required headers. Support file picker and drag-and-drop, enforce `.csv` extension and the 10 MB limit, check required headers, and show the selected filename plus a remove/reselect action. Do not upload yet. Give clear, accessible errors and do not silently alter user data. Add focused tests for template headers, extension, size, and missing columns.

**Done when:** Users can obtain a template, select a valid file, and see preflight issues before upload.

### Task 7 — CSV upload and prediction download

**Prompt to Antigravity:**

> Connect the validated CSV workflow to `POST /predict-file`. Upload as multipart form field `file` and do not manually set the multipart content-type boundary. On success, download the response body as `predictions.csv` (prefer a valid server-provided filename if present) and show a completion message. Handle backend validation errors, server errors, malformed/empty responses, and network failure; never show success or download an error body. Keep the chosen file available for retry when practical. Add focused tests for multipart field, successful download, and failure cases.

**Done when:** A valid CSV uploaded to the real backend downloads the prediction CSV, while failures remain visible and actionable.

### Task 8 — Integrate workflows and polish responsive UI

**Prompt to Antigravity:**

> Integrate the completed single-estimate and CSV workflows into the app shell with clear navigation/tabs. Apply the visual direction and accessibility requirements in `UI_PRD.md`; verify desktop and narrow mobile layouts, focus visibility, contrast, status announcements, and no horizontal overflow. Do not add fake dashboards, charts, or predictions. Fix only issues in the UI scope.

**Done when:** Both core user journeys are easy to find and usable on keyboard and mobile.

### Task 9 — Backend CORS only if demonstrated necessary

**Prompt to Antigravity:**

> Test the frontend in a browser against the local FastAPI backend. If and only if requests are blocked by CORS, add the smallest explicit CORS middleware configuration needed for the local frontend development origin. Do not use wildcard origins with credentials. Document any allowed development origin(s), then verify health, single-prediction, and CSV-upload requests from the browser.

**Done when:** Actual browser requests work locally and the backend has no broader CORS allowance than needed.

### Task 10 — Final verification and run documentation

**Prompt to Antigravity:**

> Finish the UI by running focused frontend tests, type checking, and production build. Test both flows against the existing FastAPI service if it is available. Update the project documentation with the exact commands to activate/use the Python environment, start the API, configure the frontend API base URL, start/build/test the frontend, and troubleshoot common connection/CORS errors. Do not change model behavior or claim tests passed unless they were run.

**Done when:** The documented setup works from a fresh terminal and all available focused checks pass.

## 11. API contract reference for implementation

### `GET /health`

Request: no body.

The current success response includes `status`, `model`, `features`, and `average_error`.

### `POST /predict`

Request content type: `application/json`.

```json
{
  "MedInc": 5.0,
  "HouseAge": 20,
  "AveRooms": 5.0,
  "AveBedrms": 1.0,
  "Population": 1000,
  "AveOccup": 3.0,
  "Latitude": 36.0,
  "Longitude": -120.0
}
```

The values above illustrate the request shape only; never present them as a known prediction or expected result.

The current response includes string-valued `predicted_price`, `predicted_price_short`, and `fidence_range`. The UI should rely on `predicted_price` for the primary result and treat other response keys as optional.

### `POST /predict-file`

Request content type: `multipart/form-data`; field name `file`; file must be CSV.

Required header row:

```csv
MedInc,HouseAge,AveRooms,AveBedrms,Population,AveOccup,Latitude,Longitude
```

Success: CSV attachment with original columns and an additional `predicted_price_USD` column.
