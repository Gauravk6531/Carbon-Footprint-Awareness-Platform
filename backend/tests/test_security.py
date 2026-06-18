"""Tests for security helper functions."""

import pytest
from fastapi import HTTPException

from app.security import sanitize, validate_session_id, validate_user_id


class TestSanitize:
    def test_escapes_html_tags(self):
        assert sanitize("<script>alert('x')</script>") == "&lt;script&gt;alert('x')&lt;/script&gt;"

    def test_preserves_plain_text(self):
        assert sanitize("Hello world") == "Hello world"

    def test_non_string_passthrough(self):
        assert sanitize(42) == 42


class TestValidateUserId:
    def test_accepts_valid_ids(self):
        assert validate_user_id("user-abc123") == "user-abc123"
        assert validate_user_id("anonymous") == "anonymous"

    def test_rejects_path_traversal(self):
        with pytest.raises(HTTPException) as exc:
            validate_user_id("../admin")
        assert exc.value.status_code == 400

    def test_rejects_empty_string(self):
        with pytest.raises(HTTPException):
            validate_user_id("")

    def test_rejects_overly_long_id(self):
        with pytest.raises(HTTPException):
            validate_user_id("a" * 65)


class TestValidateSessionId:
    def test_accepts_valid_session_ids(self):
        assert validate_session_id("session-12345") == "session-12345"

    def test_rejects_invalid_characters(self):
        with pytest.raises(HTTPException) as exc:
            validate_session_id("session/id")
        assert exc.value.status_code == 400

    def test_rejects_empty_session(self):
        with pytest.raises(HTTPException):
            validate_session_id("")
