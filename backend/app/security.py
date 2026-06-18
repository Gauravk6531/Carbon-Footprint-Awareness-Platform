"""Security helpers for input validation and output sanitization."""

import html
import re

from fastapi import HTTPException

USER_ID_PATTERN = re.compile(r"^[\w\-]{1,64}$")
SESSION_ID_PATTERN = re.compile(r"^[\w\-]{1,64}$")


def sanitize(text: str) -> str:
    """HTML-escape AI-sourced strings before sending to client."""
    return html.escape(text) if isinstance(text, str) else text


def validate_user_id(user_id: str) -> str:
    """Allow only safe characters; prevents path traversal."""
    if not USER_ID_PATTERN.match(user_id):
        raise HTTPException(status_code=400, detail="Invalid user_id format")
    return user_id


def validate_session_id(session_id: str) -> str:
    """Validate session identifiers used in chat history routes."""
    if not SESSION_ID_PATTERN.match(session_id):
        raise HTTPException(status_code=400, detail="Invalid session_id format")
    return session_id
