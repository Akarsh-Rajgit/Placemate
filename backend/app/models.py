# backend/app/models.py
from sqlalchemy import Column, Integer, String, Float, Boolean, TIMESTAMP, ForeignKey, Text, func
from .db import Base

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String(100), unique=True, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)

class Property(Base):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True, index=True)
    property_name = Column(Text)
    city_id = Column(Integer, ForeignKey("cities.id"))
    area_sqft = Column(Float)
    bhk = Column(Integer)
    is_furnished = Column(Boolean)
    is_rera_registered = Column(Boolean)
    is_apartment = Column(Boolean)
    listing_score = Column(Float)
    price = Column(Float)
    price_per_sqft = Column(Float)
    luxury_index = Column(Float)
    date_posted = Column(TIMESTAMP, server_default=func.now())

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"))
    predicted_price = Column(Float)
    model_used = Column(String(50))
    created_at = Column(TIMESTAMP, server_default=func.now())
