# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import db, models
from pydantic import BaseModel
import joblib
import os
import pandas as pd
from typing import Optional, List, Any
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body
from typing import Dict

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",  
    "http://127.0.0.1:3001", 
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- load model & scaler relative to this file (safe) ---

PIPELINE_PATH = "C:\\Users\\AKARSH RAJ M H\OneDrive\\Desktop\\Akarsh_Infosys_internship\\milestone 3\\real-estate-app\\backend\\models\\pipeline_v1.pkl"

pipeline = None
if os.path.exists(PIPELINE_PATH):
    try:
        pipeline = joblib.load(PIPELINE_PATH)
        print("Pipeline loaded successfully.")
    except Exception as e:
        print("Failed to load pipeline:", e)
else:
    print("Pipeline file not found at:", PIPELINE_PATH)

FEATURES_42 = [
    'area_num', 'bhk', 'listing_domain_score', 'is_furnished', 'is_rera_registered',
    'is_apartment', 'price_per_bhk', 'area_per_bhk', 'price_per_bath', 'demand_density',
    'price_dev_locality', 'luxury_index', 'dist_city_center',
    'loc_Andheri West', 'loc_Borivali West', 'loc_Chembur', 'loc_Dombivali',
    'loc_Dwarka Mor', 'loc_Kalyan West', 'loc_Kandivali East', 'loc_Kandivali West',
    'loc_Kharghar', 'loc_Malad West', 'loc_Mira Road East', 'loc_New Town',
    'loc_Panvel', 'loc_Powai', 'loc_Rajarhat', 'loc_Thane West', 'loc_Ulwe',
    'loc_Uttam Nagar', 'loc_Virar', 'loc_other',
    'city_Bangalore', 'city_Chennai', 'city_Delhi', 'city_Hyderabad',
    'city_Kolkata', 'city_Lucknow', 'city_Mumbai',
    'area_cat_medium', 'area_cat_large'
]

# --- DB session ---
def get_db():
    db_sess = db.SessionLocal()
    try:
        yield db_sess
    finally:
        db_sess.close()

# --- Pydantic models ---
class PropertyIn(BaseModel):
    property_name: Optional[str] = None
    city_id: Optional[int] = None
    area_sqft: Optional[float] = None
    bhk: Optional[int] = None
    is_furnished: Optional[bool] = None
    listing_score: Optional[float] = None

class PredictShort(BaseModel):
    id: Optional[int] = None
    area_sqft: Optional[float] = None
    bhk: Optional[int] = None
    listing_score: Optional[float] = None
    is_furnished: Optional[bool] = None
    city_id: Optional[int] = None

class Predict42In(BaseModel):
    area_num: float
    bhk: int
    listing_domain_score: float
    is_furnished: int
    is_rera_registered: int
    is_apartment: int
    price_per_bhk: float
    area_per_bhk: float
    price_per_bath: float
    demand_density: float
    price_dev_locality: float
    luxury_index: float
    dist_city_center: float
    loc_Andheri_West: int
    loc_Borivali_West: int
    loc_Chembur: int
    loc_Dombivali: int
    loc_Dwarka_Mor: int
    loc_Kalyan_West: int
    loc_Kandivali_East: int
    loc_Kandivali_West: int
    loc_Kharghar: int
    loc_Malad_West: int
    loc_Mira_Road_East: int
    loc_New_Town: int
    loc_Panvel: int
    loc_Powai: int
    loc_Rajarhat: int
    loc_Thane_West: int
    loc_Ulwe: int
    loc_Uttam_Nagar: int
    loc_Virar: int
    loc_other: int
    city_Bangalore: int
    city_Chennai: int
    city_Delhi: int
    city_Hyderabad: int
    city_Kolkata: int
    city_Lucknow: int
    city_Mumbai: int
    area_cat_medium: int
    area_cat_large: int

# --- Helper: convert SQLAlchemy model -> dict ---
def property_to_dict(p: models.Property) -> dict:
    return {
        "id": p.id,
        "property_name": p.property_name,
        "city_id": p.city_id,
        "area_sqft": p.area_sqft,
        "bhk": p.bhk,
        "is_furnished": p.is_furnished,
        "listing_score": p.listing_score,
    }

@app.get("/")
def root():
    return {"message": "🏡 Real Estate Prediction API is running successfully!"}

@app.post("/api/properties")
def create_property(payload: PropertyIn, session: Session = Depends(get_db)):
    try:
        prop = models.Property(**payload.dict())
        session.add(prop)
        session.commit()
        session.refresh(prop)
        return {"id": prop.id, "property_name": prop.property_name}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail="DB error: " + str(e))

@app.get("/api/properties", response_model=List[dict])
def list_properties(limit: int = 50, session: Session = Depends(get_db)):
    props = session.query(models.Property).limit(limit).all()
    return [property_to_dict(p) for p in props]

@app.post("/api/predict42")
def predict42(payload: Predict42In):
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Pipeline not loaded")

    # Convert payload to DataFrame in correct order
    data_dict = payload.dict()
    X = pd.DataFrame([data_dict], columns=FEATURES_42)

    try:
        pred = pipeline.predict(X)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {e}")

    return {"prediction": float(pred*5)}

    # python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

@app.post("/api/predict_bulk")
def predict_bulk(items: List[PredictShort] = Body(...)):
    """
    Accepts a list of simple property inputs and returns [{id, prediction}, ...].
    """
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Pipeline not loaded")

    # build rows for each item using the FEATURES_42 mapping logic
    rows = []
    ids = []
    for it in items:
        ids.append(it.id)
        # initialize all features to 0
        row = {f: 0 for f in FEATURES_42}
        # map main fields
        row["area_num"] = float(it.area_sqft or 0)
        row["bhk"] = int(it.bhk or 0)
        row["listing_domain_score"] = float(it.listing_score or 0)
        row["is_furnished"] = int(bool(it.is_furnished))
        # derived
        row["area_per_bhk"] = (float(it.area_sqft) / it.bhk) if it.area_sqft and it.bhk else 0.0

        # city one-hot map (extend as needed)
        city_map = {
            1: "city_Bangalore",
            2: "city_Chennai",
            3: "city_Delhi",
            4: "city_Hyderabad",
            5: "city_Kolkata",
            6: "city_Lucknow",
            7: "city_Mumbai",
        }
        if it.city_id in city_map:
            row[city_map[it.city_id]] = 1

        rows.append(row)

    # make DataFrame in the correct column order
    X = pd.DataFrame(rows, columns=FEATURES_42)

    try:
        preds = pipeline.predict(X)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {e}")

    # return list of dicts with id and prediction
    out = []
    for i, p in enumerate(preds):
        out.append({"id": ids[i], "prediction": float(p*5)})

    return out

# python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000