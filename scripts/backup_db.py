#!/usr/bin/env python3
"""
MongoDB Backup Script for House of Neelam E-Commerce
Creates a JSON backup of all collections in the database
"""

import os
import json
from datetime import datetime
from pymongo import MongoClient
from pathlib import Path

def backup_mongodb():
    # Configuration
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME = os.environ.get('DB_NAME', 'test_database')
    
    # Create backup directory
    backup_dir = Path('/app/backups')
    backup_dir.mkdir(exist_ok=True)
    
    # Create timestamped backup folder
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_folder = backup_dir / f'backup_{timestamp}'
    backup_folder.mkdir(exist_ok=True)
    
    print(f"Starting MongoDB backup...")
    print(f"Database: {DB_NAME}")
    print(f"Backup location: {backup_folder}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Get all collections
        collections = db.list_collection_names()
        print(f"\nFound {len(collections)} collections: {', '.join(collections)}")
        
        backup_summary = {
            'timestamp': timestamp,
            'database': DB_NAME,
            'collections': {}
        }
        
        # Backup each collection
        for collection_name in collections:
            collection = db[collection_name]
            documents = list(collection.find({}))
            
            # Convert ObjectId to string for JSON serialization
            for doc in documents:
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
                # Convert datetime objects to ISO format
                for key, value in doc.items():
                    if isinstance(value, datetime):
                        doc[key] = value.isoformat()
            
            # Save to JSON file
            output_file = backup_folder / f'{collection_name}.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(documents, f, indent=2, ensure_ascii=False)
            
            backup_summary['collections'][collection_name] = {
                'document_count': len(documents),
                'file': str(output_file)
            }
            
            print(f"✓ Backed up {collection_name}: {len(documents)} documents")
        
        # Save backup summary
        summary_file = backup_folder / 'backup_summary.json'
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(backup_summary, f, indent=2)
        
        print(f"\n✅ Backup completed successfully!")
        print(f"📁 Backup saved to: {backup_folder}")
        print(f"📊 Summary: {summary_file}")
        
        return str(backup_folder)
        
    except Exception as e:
        print(f"\n❌ Backup failed: {str(e)}")
        return None
    finally:
        client.close()

if __name__ == '__main__':
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv('/app/backend/.env')
    
    backup_location = backup_mongodb()
    
    if backup_location:
        print(f"\n💡 To restore this backup, use the restore_db.py script")
        print(f"   python /app/scripts/restore_db.py {backup_location}")
