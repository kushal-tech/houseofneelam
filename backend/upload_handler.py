from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List, Optional
from pathlib import Path
import uuid
import shutil
import os
from datetime import datetime, timezone

# Create uploads directory
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

router = APIRouter(prefix="/uploads", tags=["uploads"])


async def save_upload_file(upload_file: UploadFile) -> str:
    """Save uploaded file and return the file path"""
    # Validate file extension
    file_ext = Path(upload_file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    # Return relative URL
    return f"/api/uploads/{unique_filename}"


@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    """Upload a product image"""
    try:
        file_url = await save_upload_file(file)
        return {
            "url": file_url,
            "filename": file.filename,
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/multiple")
async def upload_multiple_images(files: List[UploadFile] = File(...)):
    """Upload multiple product images"""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed")
    
    uploaded_files = []
    for file in files:
        try:
            file_url = await save_upload_file(file)
            uploaded_files.append({
                "url": file_url,
                "filename": file.filename
            })
        except Exception as e:
            # Continue with other files even if one fails
            continue
    
    return {
        "uploaded": uploaded_files,
        "count": len(uploaded_files)
    }


@router.get("/{filename}")
async def get_image(filename: str):
    """Serve uploaded image"""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)


@router.delete("/{filename}")
async def delete_image(filename: str):
    """Delete uploaded image"""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    try:
        os.remove(file_path)
        return {"message": "Image deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))