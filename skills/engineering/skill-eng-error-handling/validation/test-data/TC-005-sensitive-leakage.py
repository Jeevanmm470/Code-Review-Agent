# TC-005: Sensitive Data Leakage in Error Responses
import traceback
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/api/query", methods=["POST"])
def execute_query():
    try:
        sql = request.json.get("query")
        result = db_engine.execute(sql)
        return jsonify(result)
    except Exception as exc:
        # VIOLATION (ERR05): Directly leaking internal trace and query to client
        return jsonify({
            "error": str(exc),
            "stackTrace": traceback.format_exc(),
            "internalQuery": request.json.get("query")
        }), 500

