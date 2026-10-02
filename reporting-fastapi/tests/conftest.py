import pytest

from app.core.security import get_current_user
from app.main import app


@pytest.fixture(autouse=True)
def authenticated_test_user():
    """Keep production routes protected while tests run as a known viewer."""
    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "test-user",
        "role": "viewer",
    }
    yield
    app.dependency_overrides.pop(get_current_user, None)
