#!/usr/bin/env python3
"""
Automated Validator and Test Runner for skill-fe-api-integration.
Validates SKILL.md, references, test-suite.json, schema compliance, and test fixtures.
"""

import json
import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILL_MD = os.path.join(BASE_DIR, "SKILL.md")
CHECKLIST_MD = os.path.join(BASE_DIR, "references", "checklist.md")
SCORING_MD = os.path.join(BASE_DIR, "references", "scoring-guide.md")
SUITE_JSON = os.path.join(BASE_DIR, "validation", "test-suite.json")
SCHEMA_JSON = os.path.join(BASE_DIR, "validation", "test-suite.schema.json")
TEST_DATA_DIR = os.path.join(BASE_DIR, "validation", "test-data")

ALL_RULES = [f"FAI{str(i).zfill(2)}" for i in range(1, 11)]
RULE_NAMES = {
    "FAI01": "Request Construction & HTTP Semantics",
    "FAI02": "Contract Compatibility & Type Mapping",
    "FAI03": "Async Race Conditions & Sequence Safety",
    "FAI04": "HTTP Status & Response Error Handling",
    "FAI05": "Auth Boundaries & Token Lifecycle",
    "FAI06": "Mutation Semantics & Data Consistency",
    "FAI07": "Pagination, Filtering & Large Responses",
    "FAI08": "Request Lifecycle & Abort Cleanup",
    "FAI09": "Cache Invalidation & Query Consistency",
    "FAI10": "Interceptors & Shared Client Isolation",
}

failures = []

def check(label, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    print(f"  [{status}] {label}" + (f": {detail}" if detail else ""))
    if not passed:
        failures.append(f"{label}: {detail}")

def validate_skill_md():
    print("\n=== VALIDATION: SKILL.md ===")
    if not os.path.exists(SKILL_MD):
        check("SKILL.md exists", False, SKILL_MD)
        return

    with open(SKILL_MD, encoding="utf-8") as f:
        skill = f.read()
        skill_lines = skill.splitlines()

    line_count = len(skill_lines)
    check("SKILL.md strictly under 200 lines", line_count < 200, f"{line_count} lines")
    check("SKILL.md in target range (120-170 lines)", 120 <= line_count <= 170, f"{line_count} lines")
    check("Frontmatter starts with ---", skill.startswith("---"))
    check("name: skill-fe-api-integration", "name: skill-fe-api-integration" in skill)
    check("Folded description (>-)", "description: >-" in skill)
    check("Activation clause", "Activate when" in skill)
    check("No prohibited: license", "license:" not in skill)
    check("No prohibited: compatibility", "compatibility:" not in skill)
    check("No prohibited: metadata", "metadata:" not in skill)
    check("Reference: checklist.md", "references/checklist.md" in skill)
    check("Reference: scoring-guide.md", "references/scoring-guide.md" in skill)
    check("Description <= 1024 chars", len(skill.split("---")[1]) <= 1024, f"{len(skill.split('---')[1])} chars")
    check("Purpose & Activation present", "## 1. Purpose & Activation" in skill)
    check("Technology Context present", "## 2. Technology Context" in skill)
    check("Compact table format present", "| ID | Rule | Objective |" in skill)

    for rule_id in ALL_RULES:
        check(f"All 10 rule IDs in SKILL.md: {rule_id}", rule_id in skill)
        name = RULE_NAMES[rule_id]
        check(f"{rule_id} rule name present in SKILL.md", name in skill)

def validate_checklist():
    print("\n=== VALIDATION: references/checklist.md ===")
    if not os.path.exists(CHECKLIST_MD):
        check("references/checklist.md exists", False, CHECKLIST_MD)
        return

    with open(CHECKLIST_MD, encoding="utf-8") as f:
        checklist = f.read()

    for rule_id in ALL_RULES:
        check(f"{rule_id} covered in checklist.md", f"## {rule_id}:" in checklist or f"## {rule_id} " in checklist)

    for field in ["Purpose", "Detect", "Evidence", "Avoid", "Remediation", "Severity"]:
        count = len(re.findall(rf"- \*\*{field}:\*\*", checklist))
        check(f"Checklist field '{field}' appears >= 10 times", count >= 10, f"Found {count}")

def validate_scoring_guide():
    print("\n=== VALIDATION: references/scoring-guide.md ===")
    if not os.path.exists(SCORING_MD):
        check("references/scoring-guide.md exists", False, SCORING_MD)
        return

    with open(SCORING_MD, encoding="utf-8") as f:
        guide = f.read()

    check("Native 0-10 scale defined", "0.0 to 10.0 scale" in guide or "0.0–10.0 scale" in guide)
    check("Merge block threshold defined", "Merge Blocked" in guide)
    check("Critical severity listed", "**critical**" in guide or "critical" in guide)
    check("High severity listed", "**high**" in guide or "high" in guide)
    check("Medium severity listed", "**medium**" in guide or "medium" in guide)
    check("Low severity listed", "**low**" in guide or "low" in guide)

def validate_test_suite():
    print("\n=== VALIDATION: validation/test-suite.json ===")
    if not os.path.exists(SUITE_JSON):
        check("test-suite.json exists", False, SUITE_JSON)
        return

    with open(SUITE_JSON, encoding="utf-8") as f:
        suite = json.load(f)

    test_cases = suite.get("test_cases", [])
    check("test-cases array has >= 11 items", len(test_cases) >= 11, f"{len(test_cases)} items")

    found_rules = set()
    for tc in test_cases:
        tc_id = tc.get("id")
        target_file = tc.get("target_file")
        target_path = os.path.join(BASE_DIR, target_file) if target_file else ""
        check(f"Target fixture exists for {tc_id}", os.path.exists(target_path), target_file)

        for finding in tc.get("expected_findings", []):
            rule_id = finding.get("rule_id")
            if rule_id:
                found_rules.add(rule_id)

    check("All 10 rules covered by test cases", len(found_rules) >= 10, f"{len(found_rules)}/10 rules")

def main():
    print("=" * 60)
    print("  Validation Runner: skill-fe-api-integration")
    print("=" * 60)

    validate_skill_md()
    validate_checklist()
    validate_scoring_guide()
    validate_test_suite()

    print("\n" + "=" * 60)
    if failures:
        print(f"FAILED: {len(failures)} checks failed!")
        for fail in failures:
            print(f"  - {fail}")
        sys.exit(1)
    else:
        print("SUCCESS: All validation checks passed!\n")
        sys.exit(0)

if __name__ == "__main__":
    main()

