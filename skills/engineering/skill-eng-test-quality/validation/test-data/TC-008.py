"""TC-008: Hardcoded Machine-Specific Path in Test Fixture (TST08)."""

def test_load_config_fixture():
    # TST08 Defect: Hardcoded user directory fails on CI build agents and other developer environments
    fixture_path = "C:\\Users\\costrategix\\test_data\\sample_config.json"
    with open(fixture_path, "r") as f:
        content = f.read()
    assert len(content) > 0

