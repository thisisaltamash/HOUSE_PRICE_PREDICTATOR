import io
import joblib
import pandas as pd
from fastapi import FastAPI,HTTPException,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel,Field

app=FastAPI(title="California House Price Prediction API")

# Explicit local development origins for frontend
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

model=joblib.load("house_model.joblib")
features=joblib.load("house_features.joblib")

# input schema
class HouseFeatures(BaseModel):
    MedInc: float = Field(gt=0, description="Median income in block group")
    HouseAge: float = Field(gt=0, description="Median house age in block group")
    AveRooms: float = Field(gt=0, description="Average number of rooms per household")
    AveBedrms: float = Field(gt=0, description="Average number of bedrooms per household")
    Population: float = Field(gt=0, description="Block group population")
    AveOccup: float = Field(gt=0, description="Average number of household members")
    Latitude: float = Field(ge=32, le=42, description="Block group latitude")
    Longitude: float = Field(ge=-125, le=-114, description="Block group longitude")

@app.get("/")
def home():
    return {"message": "Welcome to the California Housing Price Prediction API!",
            "status":"running",
            "endpoints": "send a POST request to /predict with the required features to get a prediction."}


@app.get("/health")
def health_check():
    return {"status": "healthy",
            "model": "RandomForestRegressor",
            "features": features,
            "average_error": "39,000 USD"}

@app.post("/predict")
def predict(house: HouseFeatures):
    try:
        input_data= pd.DataFrame([
            {"MedInc": house.MedInc,
            "HouseAge": house.HouseAge,
            "AveRooms": house.AveRooms,
            "AveBedrms": house.AveBedrms,
            "Population": house.Population,
            "AveOccup": house.AveOccup,
            "Latitude": house.Latitude,
            "Longitude": house.Longitude}
        ])

        predicted = model.predict(input_data)[0]
        price_USD = round(predicted * 100000, 2)  # Convert to USD

        return {"predicted_price":f"${price_USD:,.0f}",
                "predicted_price_short": f"${predicted:,.2f}hundred thousand dollar",
                "fidence_range":f"${price_USD - 39000:,.0f} to ${price_USD + 39000:,.0f}"
                }

    except Exception as e:
        raise HTTPException(
            status_code=500,
             detail="prediction failed. Please check the input data and try again.:" + str(e)
        )

@app.post("/predict-file")
async def predict_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV file.")

    contents = await file.read()

    df = pd.read_csv(io.BytesIO(contents))

    required_columns = [
        'MedInc',
        'HouseAge',
        'AveRooms',
        'AveBedrms',
        'Population',
        'AveOccup',
        'Latitude',
        'Longitude'
    ]

    missing_columns = [col for col in required_columns if col not in df.columns]

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing_columns)}"
        )

    try:
        predictions = model.predict(df[required_columns])
        df["predicted_price_USD"] = [
            f"${prediction * 100000:,.0f}" for prediction in predictions
        ]

        output = df.to_csv(index=False)
        return StreamingResponse(io.StringIO(output),
                                media_type="text/csv",
                                headers={"Content-Disposition": "attachment; filename=predictions.csv"})

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Prediction failed. Please check the input data and try again.:" + str(e)
        )