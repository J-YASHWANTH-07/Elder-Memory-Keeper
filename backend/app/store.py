"""In-memory data store with seeded mock data. Resets on restart."""

from datetime import date, timedelta
from typing import Dict, Tuple

MEDICINES = [
    {"id": "m1", "name": "Metformin", "dose": "500 mg · 1 tablet", "instruction": "Take with breakfast", "times": ["08:00", "20:00"], "color": "#2563EB"},
    {"id": "m2", "name": "Amlodipine", "dose": "5 mg · 1 tablet", "instruction": "Take after food", "times": ["09:00"], "color": "#059669"},
    {"id": "m3", "name": "Vitamin D3", "dose": "1 capsule", "instruction": "Take with lunch", "times": ["13:00"], "color": "#D97706"},
    {"id": "m4", "name": "Atorvastatin", "dose": "10 mg · 1 tablet", "instruction": "Take before sleep", "times": ["21:30"], "color": "#7C3AED"},
]

SESSIONS: Dict[str, str] = {}                 # token -> mobile
DOSE_LOG: Dict[Tuple[str, str], str] = {}     # (date_iso, dose_id) -> taken | skipped


def seed_history() -> None:
    """Pre-fill the past six days so the History screen has data."""
    today = date.today()
    pattern = [
        ["m1-08:00", "m2-09:00", "m3-13:00", "m1-20:00", "m4-21:30"],
        ["m1-08:00", "m2-09:00", "m1-20:00", "m4-21:30"],
        ["m1-08:00", "m2-09:00", "m3-13:00", "m1-20:00", "m4-21:30"],
        ["m1-08:00", "m3-13:00", "m1-20:00"],
        ["m1-08:00", "m2-09:00", "m3-13:00", "m1-20:00", "m4-21:30"],
        ["m1-08:00", "m2-09:00", "m3-13:00", "m4-21:30"],
    ]
    for offset, taken_ids in enumerate(pattern, start=1):
        day = (today - timedelta(days=offset)).isoformat()
        for dose_id in taken_ids:
            DOSE_LOG[(day, dose_id)] = "taken"


seed_history()
