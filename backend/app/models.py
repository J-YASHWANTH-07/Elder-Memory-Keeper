"""Pydantic schemas shared by routers."""

from typing import List, Optional
from pydantic import BaseModel, Field


class OtpRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=15)


class OtpVerify(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)


class User(BaseModel):
    name: str
    mobile: str


class AuthResponse(BaseModel):
    token: str
    user: User


class Message(BaseModel):
    message: str


class Medicine(BaseModel):
    id: str
    name: str
    dose: str
    instruction: str
    times: List[str]
    color: str


class Dose(BaseModel):
    id: str
    medicine_id: str
    name: str
    dose: str
    instruction: str
    time: str
    period: str   # Morning | Afternoon | Evening | Night
    status: str   # upcoming | due | taken | skipped | missed
    color: str


class TodaySchedule(BaseModel):
    date: str
    doses: List[Dose]
    taken: int
    total: int
    next_dose: Optional[Dose]


class HistoryDay(BaseModel):
    date: str
    label: str
    taken: int
    missed: int
    total: int


class HistoryResponse(BaseModel):
    days: List[HistoryDay]
