import hashlib
import hmac
import json
import os
from dataclasses import asdict, dataclass
from typing import Dict, List, Optional

from fastapi import FastAPI, Header, HTTPException, Request
from pydantic import BaseModel, Field
from redis.asyncio import Redis
from irt.engine import choose_next_item, is_catsim_available

app = FastAPI(title="GradifyHub ML Sidecar", version="0.1.0")

SHARED_SECRET = os.getenv("ML_SHARED_SECRET", "")
ML_ADMIN_TOKEN = os.getenv("ML_ADMIN_TOKEN", "")
DEFAULT_TOTAL = int(os.getenv("ASSESSMENT_QUESTION_LIMIT", "15"))
ATTEMPT_TTL_SECONDS = int(os.getenv("ASSESSMENT_ATTEMPT_TTL_SECONDS", "86400"))
REDIS_URL = os.getenv("UPSTASH_REDIS_URL") or os.getenv("REDIS_URL")


@dataclass
class AttemptState:
    attempt_id: str
    user_id: str
    total_questions: int
    item_sequence: List[str]
    asked_item_ids: List[str]
    response_correctness: List[bool]
    theta: float


ATTEMPTS: Dict[str, AttemptState] = {}
redis_client: Optional[Redis] = None


class StartAttemptInput(BaseModel):
    attempt_id: str
    user_id: str
    total_questions: int = Field(default=DEFAULT_TOTAL, ge=1, le=100)
    item_sequence: List[str] = Field(default_factory=list)


class RespondInput(BaseModel):
    answered_count: int = Field(ge=0, le=100)
    total_questions: int = Field(default=DEFAULT_TOTAL, ge=1, le=100)
    item_id: Optional[str] = None
    item_sequence: Optional[List[str]] = None
    is_correct: Optional[bool] = None


class AttemptProgressOutput(BaseModel):
    attempt_id: str
    next_index: int
    next_item_id: Optional[str] = None
    done: bool


def verify_admin_token(token: str | None) -> None:
    if not ML_ADMIN_TOKEN:
        raise HTTPException(status_code=500, detail="ML_ADMIN_TOKEN not configured")
    if token != ML_ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden")


@app.on_event("startup")
async def startup() -> None:
    global redis_client
    if REDIS_URL:
        redis_client = Redis.from_url(REDIS_URL, decode_responses=True)


@app.on_event("shutdown")
async def shutdown() -> None:
    if redis_client is not None:
        await redis_client.aclose()


def storage_mode() -> str:
    return "redis" if redis_client is not None else "memory"


def attempt_key(attempt_id: str) -> str:
    return f"assessment:attempt:{attempt_id}"


async def save_attempt_state(state: AttemptState) -> None:
    if redis_client is not None:
        await redis_client.setex(attempt_key(state.attempt_id), ATTEMPT_TTL_SECONDS, json.dumps(asdict(state)))
        return
    ATTEMPTS[state.attempt_id] = state


async def load_attempt_state(attempt_id: str) -> Optional[AttemptState]:
    if redis_client is not None:
        raw = await redis_client.get(attempt_key(attempt_id))
        if not raw:
            return None
        data = json.loads(raw)
        return AttemptState(**data)
    return ATTEMPTS.get(attempt_id)


async def delete_attempt_state(attempt_id: str) -> None:
    if redis_client is not None:
        await redis_client.delete(attempt_key(attempt_id))
        return
    ATTEMPTS.pop(attempt_id, None)


def verify_signature(raw_body: bytes, signature: str | None) -> None:
    if not SHARED_SECRET:
        raise HTTPException(status_code=500, detail="ML_SHARED_SECRET not configured")
    if not signature:
        raise HTTPException(status_code=401, detail="Missing signature")

    digest = hmac.new(SHARED_SECRET.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(digest, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "service": "ml-sidecar",
        "storage": storage_mode(),
        "attempts_in_memory": len(ATTEMPTS),
        "attempt_ttl_seconds": ATTEMPT_TTL_SECONDS,
        "irt": {
            "catsim_available": is_catsim_available(),
        },
    }


@app.post("/attempts/start", response_model=AttemptProgressOutput)
async def start_attempt(request: Request, x_gradify_signature: str | None = Header(default=None)):
    raw_body = await request.body()
    verify_signature(raw_body, x_gradify_signature)
    payload = StartAttemptInput.model_validate_json(raw_body)

    state = AttemptState(
        attempt_id=payload.attempt_id,
        user_id=payload.user_id,
        total_questions=payload.total_questions,
        item_sequence=payload.item_sequence,
        asked_item_ids=[],
        response_correctness=[],
        theta=0.0,
    )
    await save_attempt_state(state)

    next_item_id = payload.item_sequence[0] if payload.item_sequence else None
    return AttemptProgressOutput(
        attempt_id=payload.attempt_id,
        next_index=0,
        next_item_id=next_item_id,
        done=False,
    )


@app.post("/attempts/{attempt_id}/respond", response_model=AttemptProgressOutput)
async def respond(attempt_id: str, request: Request, x_gradify_signature: str | None = Header(default=None)):
    raw_body = await request.body()
    verify_signature(raw_body, x_gradify_signature)
    payload = RespondInput.model_validate_json(raw_body)

    state = await load_attempt_state(attempt_id)
    total = state.total_questions if state else payload.total_questions
    item_sequence = state.item_sequence if state else (payload.item_sequence or [])
    asked_item_ids = list(state.asked_item_ids) if state else []
    response_correctness = list(state.response_correctness) if state else []
    theta = state.theta if state else 0.0

    if payload.item_id and payload.item_id not in asked_item_ids:
        asked_item_ids.append(payload.item_id)

    if payload.is_correct is not None:
        response_correctness.append(payload.is_correct)

    decision = choose_next_item(
        answered_count=payload.answered_count,
        total_questions=total,
        item_sequence=item_sequence,
        asked_item_ids=asked_item_ids,
        theta=theta,
        response_correctness=response_correctness,
    )

    if done := decision.done:
        await delete_attempt_state(attempt_id)
    elif state is not None:
        await save_attempt_state(
            AttemptState(
                attempt_id=state.attempt_id,
                user_id=state.user_id,
                total_questions=state.total_questions,
                item_sequence=state.item_sequence,
                asked_item_ids=asked_item_ids,
                response_correctness=response_correctness,
                theta=decision.theta,
            )
        )
    else:
        await save_attempt_state(
            AttemptState(
                attempt_id=attempt_id,
                user_id="unknown",
                total_questions=total,
                item_sequence=item_sequence,
                asked_item_ids=asked_item_ids,
                response_correctness=response_correctness,
                theta=decision.theta,
            )
        )

    return AttemptProgressOutput(
        attempt_id=attempt_id,
        next_index=decision.next_index,
        next_item_id=decision.next_item_id,
        done=done,
    )


@app.get("/attempts/{attempt_id}/state")
async def get_attempt_state(attempt_id: str, x_ml_admin_token: str | None = Header(default=None)):
    verify_admin_token(x_ml_admin_token)
    state = await load_attempt_state(attempt_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Attempt not found")

    return {
        "attempt_id": state.attempt_id,
        "user_id": state.user_id,
        "total_questions": state.total_questions,
        "asked_count": len(state.asked_item_ids),
        "asked_item_ids": state.asked_item_ids,
        "response_correctness": state.response_correctness,
        "theta": state.theta,
        "remaining_item_ids": [
            item_id for item_id in state.item_sequence if item_id not in state.asked_item_ids
        ],
    }
