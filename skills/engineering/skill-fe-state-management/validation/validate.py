#!/usr/bin/env python3
"""
Automated Validator and Test Runner for skill-fe-state-management.
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

ALL_RULES = [f"FSM{str(i).zfill(2)}" for i in range(1, 11)]
RULE_NAMES = {
    "FSM01": "State Ownership & Duplication Prevention",
    "FSM02": "Derived State & Synchronized Computations",
    "FSM03": "Async Race Conditions & Sequence Safety",
    "FSM04": "State Transitions & Invariant Integrity",
    "FSM05": "Shared & Global State Store Isolation",
    "FSM06": "Cache Invalidation & Optimistic Rollbacks",
    "FSM07": "Persistence Schema & State Restoration",
    "FSM08": "Lifecycle Subscriptions & Stale Closures",
    "FSM09": "State Mutation & Change Detection Safety",
    "FSM10": "Multi-Layer Data Flow & Boundary Contracts",
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
    check("name: skill-fe-state-management", "name: skill-fe-state-management" in skill)
    check("Folded description (>-)", "description: >-" in skill)
    check("Activation clause", "Activate when" in skill)
    check("No prohibited: license", "license:" not in skill)
    check("No prohibited: compatibility", "compatibility:" not in skill)
    check("No prohibited: metadata", not re.search(r"^metadata:", skill, re.MULTILINE))
    check("Reference: checklist.md", "references/checklist.md" in skill)
    check("Reference: scoring-guide.md", "references/scoring-guide.md" in skill)
    check("Reference: test-suite.json", "validation/test-suite.json" in skill)

    desc_match = re.search(r"description: >-\n([\s\S]*?)(?=\n\w|\n---)", skill)
    if desc_match:
        desc = " ".join(desc_match.group(1).split())
        check("Description <= 1024 chars", len(desc) <= 1024, f"{len(desc)} chars")
    else:
        check("Description parseable", False, "Could not extract description block")

    check("Purpose & Activation present", "## 1. Purpose & Activation" in skill)
    check("Technology Context present", "## 2. Technology Context" in skill)
    check("Compact table format present", "| ID | Rule | Objective |" in skill)

    missing_rules = [r for r in ALL_RULES if r not in skill]
    check("All 10 rule IDs in SKILL.md", not missing_rules, f"Missing: {missing_rules}" if missing_rules else "")
    for rid, name in RULE_NAMES.items():
        check(f"{rid} rule name present in SKILL.md", name in skill)

def validate_checklist():
    print("\n=== VALIDATION: references/checklist.md ===")
    if not os.path.exists(CHECKLIST_MD):
        check("checklist.md exists", False, CHECKLIST_MD)
        return

    with open(CHECKLIST_MD, encoding="utf-8") as f:
        checklist = f.read()

    for rid in ALL_RULES:
        check(f"{rid} covered in checklist.md", rid in checklist)

    for field in ["Purpose", "Detect", "Evidence", "Avoid", "Remediation", "Severity"]:
        count = checklist.count(f"**{field}:**")
        check(f"Checklist field '{field}' appears >= 10 times", count >= 10, f"Found {count}")

def validate_scoring():
    print("\n=== VALIDATION: references/scoring-guide.md ===")
    if not os.path.exists(SCORING_MD):
        check("scoring-guide.md exists", False, SCORING_MD)
        return

    with open(SCORING_MD, encoding="utf-8") as f:
        scoring = f.read()

    check("Native 0-10 scale defined", "0.0–10.0 scale" in scoring or "0.0 to 10.0 scale" in scoring)
    check("Merge block threshold defined", "9.0" in scoring)
    check("Critical severity listed", "**critical**" in scoring)
    check("High severity listed", "**high**" in scoring)
    check("Medium severity listed", "**medium**" in scoring)
    check("Low severity listed", "**low**" in scoring)

def validate_test_suite():
    print("\n=== VALIDATION: validation/test-suite.json ===")
    if not os.path.exists(SUITE_JSON):
        check("test-suite.json exists", False, SUITE_JSON)
        return
    if not os.path.exists(SCHEMA_JSON):
        check("test-suite.schema.json exists", False, SCHEMA_JSON)
        return

    with open(SUITE_JSON, encoding="utf-8") as f:
        suite = json.load(f)

    test_cases = suite.get("test_cases", [])
    check("test-cases array has >= 11 items", len(test_cases) >= 11, f"{len(test_cases)} items")

    covered_rules = set()
    for tc in test_cases:
        tc_id = tc.get("id")
        target = tc.get("target_file")
        target_path = os.path.join(BASE_DIR, target)
        check(f"Target fixture exists for {tc_id}", os.path.exists(target_path), target)
        for finding in tc.get("expected_findings", []):
            covered_rules.add(finding.get("rule_id"))

    missing_rules = [r for r in ALL_RULES if r not in covered_rules]
    check("All 10 rules covered by test cases", not missing_rules, f"Missing: {missing_rules}" if missing_rules else "")

def main():
    print("============================================================")
    print("  Validation Runner: skill-fe-state-management")
    print("============================================================")

    validate_skill_md()
    validate_checklist()
    validate_scoring()
    validate_test_suite()

    print("\n============================================================")
    if failures:
        print(f"FAILED: {len(failures)} checks failed:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    else:
        print("SUCCESS: All validation checks passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()

