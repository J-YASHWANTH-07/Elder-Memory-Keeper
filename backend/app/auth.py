"""Bearer-token dependency for protected routes."""

from fastapi import Header, HTTPException, status
from . import store


def current_user(authorization: str = Header(default="")) -> str:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or token not in store.SESSIONS:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Please log in again")
    return store.SESSIONS[token]
