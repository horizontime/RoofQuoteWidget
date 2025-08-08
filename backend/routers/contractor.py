from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Contractor
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter()

class ContractorBase(BaseModel):
    company_name: str
    email: str
    phone: str = None
    address: str = None
    website: str = None

class ContractorCreate(ContractorBase):
    pass

class ContractorUpdate(BaseModel):
    company_name: str = None
    email: str = None
    phone: str = None
    address: str = None
    website: str = None

class ContractorResponse(ContractorBase):
    id: int
    widget_id: str
    created_at: datetime
    updated_at: datetime = None
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[ContractorResponse])
async def get_contractors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    contractors = db.query(Contractor).offset(skip).limit(limit).all()
    return contractors

@router.get("/{contractor_id}", response_model=ContractorResponse)
async def get_contractor(contractor_id: int, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    return contractor

@router.post("/", response_model=ContractorResponse)
async def create_contractor(contractor: ContractorCreate, db: Session = Depends(get_db)):
    existing = db.query(Contractor).filter(Contractor.email == contractor.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_contractor = Contractor(
        **contractor.dict(),
        widget_id=str(uuid.uuid4())
    )
    db.add(db_contractor)
    db.commit()
    db.refresh(db_contractor)
    return db_contractor

@router.put("/{contractor_id}", response_model=ContractorResponse)
async def update_contractor(
    contractor_id: int, 
    contractor: ContractorUpdate, 
    db: Session = Depends(get_db)
):
    db_contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not db_contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    update_data = contractor.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_contractor, field, value)
    
    db.commit()
    db.refresh(db_contractor)
    return db_contractor

@router.delete("/{contractor_id}")
async def delete_contractor(contractor_id: int, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    db.delete(contractor)
    db.commit()
    return {"message": "Contractor deleted successfully"}