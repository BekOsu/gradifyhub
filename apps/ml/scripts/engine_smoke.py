#!/usr/bin/env python3
"""Tiny runner for IRT engine scaffold."""

from pathlib import Path
import sys

APP_ROOT = Path(__file__).resolve().parents[1]
if str(APP_ROOT) not in sys.path:
    sys.path.insert(0, str(APP_ROOT))

from irt.engine import choose_next_item, is_catsim_available


def main() -> None:
    print("catsim_available:", is_catsim_available())

    sequence = ["q1", "q2", "q3", "q4"]
    asked: list[str] = []
    correctness: list[bool] = []
    theta = 0.0

    for answered in [0, 1, 2, 4]:
        decision = choose_next_item(
            answered_count=answered,
            total_questions=4,
            item_sequence=sequence,
            asked_item_ids=asked,
            theta=theta,
            response_correctness=correctness,
        )
        print(answered, "->", decision)
        theta = decision.theta
        if decision.next_item_id:
            asked.append(decision.next_item_id)
            correctness.append(answered % 2 == 0)


if __name__ == "__main__":
    main()
