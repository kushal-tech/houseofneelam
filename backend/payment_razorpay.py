"""
Razorpay Payment Integration for House of Neelam
Handles order creation, payment verification, and webhooks
"""

from fastapi import HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
import razorpay
import os
import uuid
from datetime import datetime, timezone
from typing import Dict
import logging

logger = logging.getLogger(__name__)

# Razorpay client will be initialized in main server
razorpay_client = None

def init_razorpay(key_id: str, key_secret: str):
    global razorpay_client
    razorpay_client = razorpay.Client(auth=(key_id, key_secret))
    return razorpay_client


async def create_razorpay_order(order: Dict, db):
    """Create Razorpay order for payment"""
    # Convert amount to paise (Razorpay uses smallest currency unit)
    amount_in_paise = int(order["total_amount"] * 100)
    
    try:
        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": order["order_id"][:40],  # Receipt field max 40 chars
            "payment_capture": 1
        })
        
        # Create payment transaction
        transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
        await db.payment_transactions.insert_one({
            "transaction_id": transaction_id,
            "razorpay_order_id": razorpay_order["id"],
            "order_id": order["order_id"],
            "amount": order["total_amount"],
            "currency": "INR",
            "status": "created",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc)
        })
        
        # Update order with razorpay_order_id
        await db.orders.update_one(
            {"order_id": order["order_id"]},
            {"$set": {"razorpay_order_id": razorpay_order["id"]}}
        )
        
        return {
            "razorpay_order_id": razorpay_order["id"],
            "amount": amount_in_paise,
            "currency": "INR",
            "order_id": order["order_id"]
        }
    except Exception as e:
        logger.error(f"Razorpay order creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create payment session")


async def verify_razorpay_payment(payment_data: Dict, db):
    """Verify Razorpay payment signature"""
    try:
        razorpay_order_id = payment_data.get("razorpay_order_id")
        razorpay_payment_id = payment_data.get("razorpay_payment_id")
        razorpay_signature = payment_data.get("razorpay_signature")
        
        # Verify signature
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        
        # Update transaction
        transaction = await db.payment_transactions.find_one(
            {"razorpay_order_id": razorpay_order_id}, 
            {"_id": 0}
        )
        
        if transaction and transaction["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"razorpay_order_id": razorpay_order_id},
                {"$set": {
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                    "status": "complete",
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            # Update order
            await db.orders.update_one(
                {"razorpay_order_id": razorpay_order_id},
                {"$set": {
                    "payment_status": "paid",
                    "status": "confirmed",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
        
        return {"status": "success", "message": "Payment verified successfully"}
        
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        logger.error(f"Payment verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment verification failed")


async def get_razorpay_payment_status(razorpay_order_id: str, db):
    """Get payment status by Razorpay order ID"""
    transaction = await db.payment_transactions.find_one(
        {"razorpay_order_id": razorpay_order_id}, 
        {"_id": 0}
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "status": transaction.get("status"),
        "payment_status": transaction.get("payment_status"),
        "amount": transaction.get("amount"),
        "currency": transaction.get("currency"),
        "razorpay_order_id": razorpay_order_id
    }
