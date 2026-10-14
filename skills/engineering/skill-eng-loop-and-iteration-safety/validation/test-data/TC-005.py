"""
Test Case: TC-005
Rule: LPS05 - Recursive Convergence & Base Case Verification
Description: Recursive function lacking base case for negative integers and non-converging recursive step.
"""

def resolve_nested_references(ref_id, registry, depth=0):
    # VIOLATION (LPS05): Lacks depth limit or visited tracking, causing stack overflow on cyclic references
    node = registry.get(ref_id)
    if not node:
        return []
    
    dependencies = []
    for child_id in node.get("dependencies", []):
        dependencies.append(child_id)
        # Unbounded recursion without cycle detection or base case on recursion depth
        dependencies.extend(resolve_nested_references(child_id, registry, depth + 1))
    return dependencies

