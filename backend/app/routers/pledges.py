"""Pledge management endpoints."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from app.database import UserPledge, get_db
from app.models import ActionPledge
from app.security import validate_user_id

router = APIRouter(prefix="/api", tags=["Pledges"])


@router.post("/pledge")
async def create_pledge(pledge: ActionPledge, user_id: Optional[str] = None, db=Depends(get_db)):
    """Create a carbon action pledge."""
    try:
        uid = user_id or "anonymous"
        if user_id:
            validate_user_id(uid)
        user_pledge = UserPledge(
            id=str(uuid.uuid4()),
            user_id=uid,
            action=pledge.action,
            estimated_co2_reduction=pledge.estimated_co2_reduction,
            deadline=pledge.deadline,
            status="active",
        )
        db.add(user_pledge)
        db.commit()
        return {
            "id": user_pledge.id,
            "status": "created",
            "message": f"Great! You've committed to: {pledge.action}",
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to create pledge.")


@router.get("/pledges/{user_id}")
async def get_user_pledges(user_id: str, db=Depends(get_db)):
    """Get all pledges for a user."""
    try:
        validate_user_id(user_id)
        pledges = db.query(UserPledge).filter(UserPledge.user_id == user_id).all()
        return {
            "user_id": user_id,
            "pledges": [
                {
                    "id": p.id,
                    "action": p.action,
                    "co2_reduction_kg": p.estimated_co2_reduction,
                    "status": p.status,
                    "deadline": p.deadline,
                }
                for p in pledges
            ],
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve pledges.")
