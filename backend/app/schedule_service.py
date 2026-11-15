"""Builds dose lists and statuses from medicines plus the dose log."""

from datetime import date, datetime, timedelta
from typing import List, Optional
from .config import DUE_WINDOW_MINUTES, GRACE_MINUTES, HISTORY_DAYS
from .models import Dose, HistoryDay, TodaySchedule
from . import store


def _period(time_str: str) -> str:
    hour = int(time_str[:2])
    if hour < 12:
        return "Morning"
    if hour < 17:
        return "Afternoon"
    if hour < 20:
        return "Evening"
    return "Night"


def _status(day: str, dose_id: str, scheduled: datetime, now: datetime) -> str:
    logged = store.DOSE_LOG.get((day, dose_id))
    if logged:
        return logged
    if now > scheduled + timedelta(minutes=GRACE_MINUTES):
        return "missed"
    if now >= scheduled - timedelta(minutes=DUE_WINDOW_MINUTES):
        return "due"
    return "upcoming"


def doses_for(day: date, now: Optional[datetime] = None) -> List[Dose]:
    now = now or datetime.now()
    doses: List[Dose] = []
    for med in store.MEDICINES:
        for time_str in med["times"]:
            dose_id = f"{med['id']}-{time_str}"
            scheduled = datetime.combine(day, datetime.strptime(time_str, "%H:%M").time())
            doses.append(Dose(
                id=dose_id, medicine_id=med["id"], name=med["name"], dose=med["dose"],
                instruction=med["instruction"], time=time_str, period=_period(time_str),
                status=_status(day.isoformat(), dose_id, scheduled, now), color=med["color"],
            ))
    doses.sort(key=lambda d: d.time)
    return doses


def today_schedule() -> TodaySchedule:
    today = date.today()
    doses = doses_for(today)
    pending = sorted(
        (d for d in doses if d.status in ("due", "upcoming")),
        key=lambda d: (d.status != "due", d.time),
    )
    return TodaySchedule(
        date=today.isoformat(), doses=doses,
        taken=sum(1 for d in doses if d.status == "taken"), total=len(doses),
        next_dose=pending[0] if pending else None,
    )


def dose_exists(dose_id: str) -> bool:
    return any(d.id == dose_id for d in doses_for(date.today()))


def history() -> List[HistoryDay]:
    today = date.today()
    days: List[HistoryDay] = []
    for offset in range(HISTORY_DAYS - 1, -1, -1):
        day = today - timedelta(days=offset)
        doses = doses_for(day)
        label = "Today" if offset == 0 else "Yesterday" if offset == 1 else day.strftime("%A")
        days.append(HistoryDay(
            date=day.isoformat(), label=label,
            taken=sum(1 for d in doses if d.status == "taken"),
            missed=sum(1 for d in doses if d.status in ("missed", "skipped")),
            total=len(doses),
        ))
    return days
