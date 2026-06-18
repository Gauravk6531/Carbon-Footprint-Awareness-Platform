"""Chat endpoints powered by Gemini AI."""

import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from app.carbon_engine import CarbonCalculator
from app.database import ChatHistory, get_db
from app.dependencies import get_gemini_client
from app.gemini_ai import GeminiClient
from app.models import ChatRequest, ChatResponse
from app.recommendations import generate_recommendations
from app.security import sanitize, validate_session_id
from app.text_extraction import extract_from_text, local_chat_response

logger = logging.getLogger("app.routers.chat")

router = APIRouter(prefix="/api", tags=["Chat"])


def _build_carbon_result(extracted_data: dict) -> Optional[dict]:
    """Run carbon engine when extraction confidence is sufficient."""
    if extracted_data.get("confidence") not in ("high", "medium"):
        return None

    region = extracted_data.get("region", "india")
    chat_calc = CarbonCalculator(region=region)
    result = chat_calc.calculate_full_footprint(
        daily_car_km=extracted_data.get("daily_car_km", 0),
        car_fuel_type=extracted_data.get("car_fuel_type", "petrol"),
        monthly_flights=extracted_data.get("monthly_flights", 0),
        flight_type=extracted_data.get("flight_type", "domestic"),
        public_transport_km=extracted_data.get("public_transport_km", 0),
        public_transport_type=extracted_data.get("public_transport_type", "bus"),
        monthly_electricity_kwh=extracted_data.get("monthly_electricity_kwh", 0),
        ac_hours_daily=extracted_data.get("ac_hours_daily", 0),
        lpg_kg_monthly=extracted_data.get("lpg_kg_monthly", 0),
        household_size=extracted_data.get("household_size", 1),
    )
    recommendations = generate_recommendations(result.major_contributors)
    return {
        "monthly_kg": result.monthly_kg,
        "annual_tonnes": result.annual_tonnes,
        "sources": result.sources,
        "major_contributors": result.major_contributors,
        "confidence": result.confidence,
        "recommendations": recommendations,
    }


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    db=Depends(get_db),
    gemini_client: Optional[GeminiClient] = Depends(get_gemini_client),
):
    """Chat interface for conversational carbon footprint assessment."""
    if not gemini_client:
        raise HTTPException(status_code=503, detail="Gemini AI is not available")

    try:
        session_id = request.session_id or str(uuid.uuid4())
        user_id = request.user_id or "anonymous"

        db.add(ChatHistory(
            id=str(uuid.uuid4()),
            session_id=session_id,
            user_id=user_id,
            role="user",
            content=request.message,
        ))

        extracted_data = gemini_client.extract_carbon_data(request.message)
        gemini_failed = extracted_data.pop("gemini_failed", False) or not gemini_client.api_available

        if gemini_failed:
            local_data = extract_from_text(request.message)
            if local_data.get("confidence") in ("high", "medium"):
                extracted_data = local_data

        needs_followup = extracted_data.get("needs_followup", False)
        carbon_result = _build_carbon_result(extracted_data)

        structured_data = None
        if carbon_result:
            structured_data = gemini_client.build_deterministic_structured_response(extracted_data, carbon_result)
            summary = gemini_client.build_deterministic_summary(extracted_data, carbon_result)
            response_msg = sanitize(
                f"{summary}\n\nLet me share some personalized actions you can take to reduce your footprint."
            )
        elif gemini_failed:
            response_msg = sanitize(local_chat_response(request.message, extracted_data))
        else:
            try:
                raw_reply = gemini_client.generate_general_chat(request.message)
                response_msg = sanitize(raw_reply)
            except Exception as exc:
                logger.error("Chat generation error: %s", exc)
                response_msg = sanitize(local_chat_response(request.message, extracted_data))

        db.add(ChatHistory(
            id=str(uuid.uuid4()),
            session_id=session_id,
            user_id=user_id,
            role="assistant",
            content=response_msg,
        ))
        db.commit()

        return ChatResponse(
            message=response_msg,
            extracted_data=extracted_data,
            carbon_result=carbon_result,
            session_id=session_id,
            follow_up_needed=needs_followup,
            structured_data=structured_data,
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Chat processing failed. Please try again.")


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, db=Depends(get_db)):
    """Get chat history for a session."""
    try:
        validate_session_id(session_id)
        messages = db.query(ChatHistory).filter(ChatHistory.session_id == session_id).all()
        return {
            "session_id": session_id,
            "messages": [
                {
                    "role": m.role,
                    "content": m.content,
                    "timestamp": m.timestamp.isoformat() if m.timestamp else None,
                }
                for m in messages
            ],
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve chat history.")
