from app.etl.extract import _extract_list


def test_envelope_keys():
    assert _extract_list({"items": [{"_id": "a"}, {"_id": "b"}]}) == [{"_id": "a"}, {"_id": "b"}]
    assert _extract_list({"data": [{"_id": "a"}]}) == [{"_id": "a"}]
    assert _extract_list([{"_id": "a"}]) == [{"_id": "a"}]
    assert _extract_list({"unknown": "x"}) == []
