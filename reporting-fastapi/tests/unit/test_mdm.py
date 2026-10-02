from app.etl.mdm import normalize_email, merge_user_into_person


def test_normalize_email():
    assert normalize_email(" Foo@Bar.COM ") == "foo@bar.com"
    assert normalize_email(None) is None


def test_merge_user_picks_richest_non_null():
    base = {"email_norm": "a@b.c", "full_name": "Alice", "department": None}
    new = {"email_norm": "a@b.c", "full_name": "Alice Doe", "department": "Eng"}
    merged = merge_user_into_person(base, new)
    assert merged["full_name"] == "Alice Doe"
    assert merged["department"] == "Eng"
