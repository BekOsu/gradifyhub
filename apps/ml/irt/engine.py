from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

try:
    import catsim  # type: ignore
except Exception:  # pragma: no cover - optional at runtime in early scaffolding
    catsim = None


@dataclass
class IRTDecision:
    next_index: int
    next_item_id: Optional[str]
    done: bool
    strategy: str
    theta: float


def is_catsim_available() -> bool:
    return catsim is not None


def choose_next_item(
    answered_count: int,
    total_questions: int,
    item_sequence: List[str],
    asked_item_ids: List[str],
    theta: float,
    response_correctness: List[bool],
) -> IRTDecision:
    """Choose next item from sequence with a catsim-ready scaffold.

    This hook now receives theta and correctness history. It currently applies
    deterministic item selection with a lightweight theta update fallback and
    keeps a catsim branch ready for calibrated item parameters.
    """
    if response_correctness:
        correct_rate = sum(1 for x in response_correctness if x) / len(response_correctness)
        theta = max(-3.0, min(3.0, (correct_rate - 0.5) * 4.0))

    if answered_count >= total_questions:
        return IRTDecision(
            next_index=answered_count,
            next_item_id=None,
            done=True,
            strategy="completed",
            theta=theta,
        )

    remaining = [item_id for item_id in item_sequence if item_id not in asked_item_ids]
    if not remaining:
        return IRTDecision(
            next_index=answered_count,
            next_item_id=None,
            done=True,
            strategy="completed-no-remaining",
            theta=theta,
        )

    next_item_id = remaining[0]

    if is_catsim_available():
        # catsim selector/estimator hook: currently deterministic fallback until
        # calibrated item parameters are loaded from the real item bank.
        return IRTDecision(
            next_index=item_sequence.index(next_item_id),
            next_item_id=next_item_id,
            done=False,
            strategy="catsim-scaffold",
            theta=theta,
        )

    return IRTDecision(
        next_index=item_sequence.index(next_item_id),
        next_item_id=next_item_id,
        done=False,
        strategy="deterministic",
        theta=theta,
    )
