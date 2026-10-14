#!/usr/bin/env python3
import os
import sys
import json

def validate_skill_md(skill_path):
    print("=== VALIDATION: SKILL.md ===")
    failures = 0

    if not os.path.exists(skill_path):
        print(f"  [FAIL] {skill_path} does not exist")
        return 1

    with open(skill_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    line_count = len(lines)
    if line_count <= 150:
        print(f"  [PASS] SKILL.md strictly within line limit target: {line_count} lines")
    else:
        print(f"  [FAIL] SKILL.md exceeds 150 lines: {line_count} lines")
        failures += 1

    content = "".join(lines)

    if content.startswith("---"):
        print("  [PASS] Frontmatter starts with ---")
    else:
        print("  [FAIL] Frontmatter does not start with ---")
        failures += 1

    if "name: skill-ui-tailwind-css" in content:
        print("  [PASS] name: skill-ui-tailwind-css")
    else:
        print("  [FAIL] Missing 'name: skill-ui-tailwind-css'")
        failures += 1

    if "description: >-" in content:
        print("  [PASS] Folded description (>-)")
    else:
        print("  [FAIL] Missing folded description (>-)")
        failures += 1

    # Check for core rule IDs TW01 through TW08
    for i in range(1, 9):
        rule_id = f"TW{i:02d}"
        if rule_id in content:
            print(f"  [PASS] Core rule present: {rule_id}")
        else:
            print(f"  [FAIL] Missing core rule: {rule_id}")
            failures += 1

    return failures

def validate_test_suite_json(test_suite_path, base_dir):
    print("\n=== VALIDATION: test-suite.json & test-data fixtures ===")
    failures = 0

    if not os.path.exists(test_suite_path):
        print(f"  [FAIL] {test_suite_path} does not exist")
        return 1

    try:
        with open(test_suite_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("  [PASS] Valid JSON in test-suite.json")
    except Exception as e:
        print(f"  [FAIL] Invalid JSON in {test_suite_path}: {e}")
        return 1

    test_cases = data.get("testCases", [])
    if test_cases:
        print(f"  [PASS] testCases array present with {len(test_cases)} test cases")
    else:
        print("  [FAIL] Empty or missing testCases array")
        failures += 1

    for tc in test_cases:
        tc_id = tc.get("id", "UNKNOWN")
        input_file = tc.get("inputFile", "")
        full_input_path = os.path.join(base_dir, input_file)

        if os.path.exists(full_input_path):
            print(f"  [PASS] {tc_id}: Input fixture exists ({input_file})")
            with open(full_input_path, 'r', encoding='utf-8') as f:
                code_content = f.read()

            target_symbol = tc.get("targetSymbol")
            if target_symbol and target_symbol in code_content:
                print(f"  [PASS] {tc_id}: Target symbol '{target_symbol}' verified in {os.path.basename(input_file)}")
            else:
                print(f"  [FAIL] {tc_id}: Target symbol '{target_symbol}' missing in {os.path.basename(input_file)}")
                failures += 1

            safe_cp = tc.get("safeCounterpart", {})
            safe_symbol = safe_cp.get("targetSymbol")
            if safe_symbol:
                if safe_symbol in code_content:
                    print(f"  [PASS] {tc_id}: Safe counterpart '{safe_symbol}' verified")
                else:
                    print(f"  [FAIL] {tc_id}: Safe counterpart '{safe_symbol}' missing")
                    failures += 1
        else:
            print(f"  [FAIL] {tc_id}: Input fixture missing ({input_file})")
            failures += 1

    return failures

def main():
    val_dir = os.path.dirname(os.path.abspath(__file__))
    skill_dir = os.path.dirname(val_dir)
    skill_md = os.path.join(skill_dir, "SKILL.md")
    test_suite_json = os.path.join(val_dir, "test-suite.json")

    print(f"Starting validation for: {os.path.basename(skill_dir)}\n")
    total_failures = 0

    total_failures += validate_skill_md(skill_md)
    total_failures += validate_test_suite_json(test_suite_json, skill_dir)

    print("\n=== SUMMARY ===")
    if total_failures == 0:
        print("All validation checks passed successfully!")
        sys.exit(0)
    else:
        print(f"Validation failed with {total_failures} errors.")
        sys.exit(1)

if __name__ == "__main__":
    main()

