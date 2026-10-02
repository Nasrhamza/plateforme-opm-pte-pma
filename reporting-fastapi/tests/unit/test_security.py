from app.core.security import hash_password, verify_password, create_access_token, decode_token


def test_password_round_trip():
    h = hash_password("s3cret")
    assert verify_password("s3cret", h)
    assert not verify_password("wrong", h)


def test_jwt_round_trip():
    tok = create_access_token({"sub": "user-1", "role": "admin"})
    claims = decode_token(tok)
    assert claims["sub"] == "user-1"
    assert claims["role"] == "admin"
