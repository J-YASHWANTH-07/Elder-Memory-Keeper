"""Today's schedule, dose actions, and weekly history."""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from ..auth import current_user
from ..models import HistoryResponse, TodaySchedule
from .. import schedule_service, store

router = APIRouter(tags=["schedule"])


@router.get("/schedule/today", response_model=TodaySchedule)
def get_today(_: str = Depends(current_user)) -> TodaySchedule:
    return schedule_service.today_schedule()


def _log(dose_id: str, outcome: str) -> TodaySchedule:
    if not schedule_service.dose_exists(dose_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Dose not found")
    store.DOSE_LOG[(date.today().isoformat(), dose_id)] = outcome
    return schedule_service.today_schedule()


@router.post("/doses/{dose_id}/taken", response_model=TodaySchedule)
def mark_taken(dose_id: str, _: str = Depends(current_user)) -> TodaySchedule:
    return _log(dose_id, "taken")


@router.post("/doses/{dose_id}/skip", response_model=TodaySchedule)
def mark_skipped(dose_id: str, _: str = Depends(current_user)) -> TodaySchedule:
    return _log(dose_id, "skipped")


@router.get("/history", response_model=HistoryResponse)
def get_history(_: str = Depends(current_user)) -> HistoryResponse:
    return HistoryResponse(days=schedule_service.history())
