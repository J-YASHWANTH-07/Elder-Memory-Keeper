"""Mobile number + OTP login. Demo OTP is fixed."""

import uuid
from fastapi import APIRouter, HTTPException, status
from ..config import DEMO_OTP
from ..models import AuthResponse, Message, OtpRequest, OtpVerify, User
from .. import store

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/request-otp", response_model=Message)
def request_otp(body: OtpRequest) -> Message:
    if not body.mobile.isdigit():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Enter digits only")
    return Message(message=f"OTP sent to {body.mobile}. Demo OTP is {DEMO_OTP}.")


@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp(body: OtpVerify) -> AuthResponse:
    if body.otp != DEMO_OTP:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Wrong OTP. Please try again.")
    token = uuid.uuid4().hex
    store.SESSIONS[token] = body.mobile
    return AuthResponse(token=token, user=User(name="Lakshmi", mobile=body.mobile))
