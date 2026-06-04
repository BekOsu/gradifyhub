#!/usr/bin/env python3
"""Minimal sidecar smoke test.

Usage:
  export ML_SHARED_SECRET=dev-shared-secret
  python scripts/smoke_test.py http://localhost:8000
"""

import hashlib
import hmac
import json
import os
import sys
from urllib import request

SECRET = os.getenv("ML_SHARED_SECRET", "")


def sign(body: bytes) -> str:
    return hmac.new(SECRET.encode("utf-8"), body, hashlib.sha256).hexdigest()


def post(base: str, path: str, payload: dict) -> dict:
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(
        f"{base}{path}",
        data=body,
        method="POST",
        headers={
            "content-type": "application/json",
            "x-gradify-signature": sign(body),
        },
    )
    with request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> None:
    if not SECRET:
        raise SystemExit("ML_SHARED_SECRET is required")

    base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

    start = post(
        base,
        "/attempts/start",
        {
            "attempt_id": "smoke-attempt-1",
            "user_id": "smoke-user",
            "total_questions": 3,
            "item_sequence": ["q1", "q2", "q3"],
        },
    )
    print("start:", start)

    r1 = post(base, "/attempts/smoke-attempt-1/respond", {"answered_count": 1, "total_questions": 3})
    print("respond1:", r1)

    r2 = post(base, "/attempts/smoke-attempt-1/respond", {"answered_count": 3, "total_questions": 3})
    print("respond2:", r2)

    assert start["done"] is False
    assert r1["done"] is False
    assert r2["done"] is True
    print("OK")


if __name__ == "__main__":
    main()

