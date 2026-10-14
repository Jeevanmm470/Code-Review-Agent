// TC-009: Altering Semantic Error Status Code Breaking Client Handlers (BWC09)
export function handleLookupError(res: any, error: any) {
  if (error.code === "NOT_FOUND") {
    // BWC09 Defect: Changed status from 404 to 400 on existing API, breaking frontend error handlers expecting 404
    return res.status(400).json({ message: "Resource not found" });
  }
  return res.status(500).json({ message: "Internal server error" });
}

