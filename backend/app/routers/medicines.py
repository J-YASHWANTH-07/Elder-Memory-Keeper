"""Read-only medicine list."""

from typing import List
from fastapi import APIRouter, Depends
from ..auth import current_user
from ..models import Medicine
from .. import store

router = APIRouter(prefix="/medicines", tags=["medicines"])


@router.get("", response_model=List[Medicine])
def list_medicines(_: str = Depends(current_user)) -> List[Medicine]:
    return [Medicine(**m) for m in store.MEDICINES]
