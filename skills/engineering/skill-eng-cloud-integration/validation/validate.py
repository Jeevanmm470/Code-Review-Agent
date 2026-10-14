#!/usr/bin/env python3
"""
Automated Validator and Test Runner for skill-eng-cloud-integration.
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

ALL_RULES = [f"CLD{str(i).zfill(2)}" for i in range(1, 11)]
RULE_NAMES = {
    "CLD01": "Cloud Identity & Managed Authentication",
    "CLD02": "Secrets Management & Dynamic Resolution",
    "CLD03": "Network Timeouts & Cancellation Propagation",
    "CLD04": "Cloud SDK Client Lifecycle & Connection Reuse",
    "CLD05": "Cloud Pagination & Quota Control",
    "CLD06": "Transient Throttling & Backoff Alignment",
    "CLD07": "Object Storage Streaming & Integrity",
    "CLD08": "Object Path Safety & Access Scoping",
    "CLD09": "Cloud Resource Lifecycle & Cleanup",
    "CLD10": "Infrastructure & Environment Parity",
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
    check("name: skill-eng-cloud-integration", "name: skill-eng-cloud-integration" in skill)
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

    for rid in ALL_RULES:
        check(f"{rid} referenced in scoring-guide.md", rid in scoring)
    check("Severity levels defined", all(s in scoring for s in ["critical", "high", "medium", "low"]))
    check("Score calculation formula", "deduction" in scoring and "multiplier" in scoring.lower())
    check("Blocking threshold defined", "Blocking" in scoring and ("9.0" in scoring or "9/10" in scoring))

def validate_test_suite():
    print("\n=== VALIDATION: test-suite.json & test fixtures ===")
    if not os.path.exists(SUITE_JSON):
        check("test-suite.json exists", False, SUITE_JSON)
        return

    with open(SUITE_JSON, encoding="utf-8") as f:
        suite = json.load(f)

    check("Valid JSON in test-suite.json", True)
    tc_count = len(suite.get("testCases", []))
    check("testCases array present", tc_count >= 10, f"{tc_count} test cases")
    check("Local schema exists", os.path.exists(SCHEMA_JSON))

    covered_rules = set()
    for tc in suite["testCases"]:
        for rid in tc.get("ruleIds", []):
            covered_rules.add(rid)
    missing = set(ALL_RULES) - covered_rules
    check("All 10 rules covered in testCases", not missing, f"Missing: {missing}" if missing else "")

    for tc in suite["testCases"]:
        input_rel = tc.get("inputFile")
        if input_rel:
            full_path = os.path.join(BASE_DIR, "validation", input_rel)
            check(f"Fixture exists for {tc['id']}", os.path.exists(full_path), input_rel)

def main():
    print("=" * 60)
    print("ENGINEERING CLOUD INTEGRATION: VALIDATION RUNNER")
    print("=" * 60)

    validate_skill_md()
    validate_checklist()
    validate_scoring()
    validate_test_suite()

    print("\n" + "=" * 60)
    print(f"SUMMARY: Total failures: {len(failures)}")
    print("=" * 60)

    if failures:
        print("Failed checks:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    else:
        print("ALL VALIDATION CHECKS PASSED (0 FAILURES).")
        sys.exit(0)

if __name__ == "__main__":
    main()

