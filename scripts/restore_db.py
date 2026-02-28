#!/usr/bin/env python3
"""
MongoDB Restore Script for House of Neelam E-Commerce
Restores database from JSON backup files
"""

import os
import json
import sys
from datetime import datetime
from pymongo import MongoClient
from pathlib import Path

def restore_mongodb(backup_folder):
    # Configuration
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME = os.environ.get('DB_NAME', 'test_database')
    
    backup_path = Path(backup_folder)
    
    if not backup_path.exists():
        print(f"❌ Backup folder not found: {backup_folder}")
        return False
    
    print(f"Starting MongoDB restore...")
    print(f"Database: {DB_NAME}")
    print(f"Backup location: {backup_path}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Get all JSON files in backup folder
        json_files = list(backup_path.glob('*.json'))
        json_files = [f for f in json_files if f.name != 'backup_summary.json']
        
        print(f"\nFound {len(json_files)} collection backups")
        
        # Restore each collection
        for json_file in json_files:
            collection_name = json_file.stem
            
            with open(json_file, 'r', encoding='utf-8') as f:
                documents = json.load(f)
            
            if not documents:
                print(f"⚠️  Skipping empty collection: {collection_name}")
                continue
            
            # Clear existing collection
            db[collection_name].delete_many({})
            
            # Convert ISO strings back to datetime where needed
            for doc in documents:
                for key, value in doc.items():
                    if isinstance(value, str) and 'T' in value:
                        try:
                            doc[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                        except:
                            pass
            
            # Insert documents
            if documents:
                db[collection_name].insert_many(documents)
            
            print(f"✓ Restored {collection_name}: {len(documents)} documents")
        
        print(f"\n✅ Restore completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Restore failed: {str(e)}")
        return False
    finally:
        client.close()

if __name__ == '__main__':
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv('/app/backend/.env')
    
    if len(sys.argv) < 2:
        print("Usage: python restore_db.py <backup_folder_path>")
        print("\nAvailable backups:")
        backup_dir = Path('/app/backups')
        if backup_dir.exists():
            backups = sorted(backup_dir.glob('backup_*'), reverse=True)
            for backup in backups:
                print(f"  - {backup}")
        sys.exit(1)
    
    backup_folder = sys.argv[1]
    restore_mongodb(backup_folder)
