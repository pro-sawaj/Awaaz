import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# 1. GitHub Secrets se Firebase Key read karna
key_json = os.environ.get('FIREBASE_JSON_KEY')

if not key_json:
    print("Error: Key nahi mili!")
    exit()

# 2. Firebase connect karna
if not firebase_admin._apps:
    cred = credentials.Certificate(json.loads(key_json))
    firebase_admin.initialize_app(cred)

db = firestore.client()

# 3. Amazon Deal (Abhi testing ke liye)
# Baad mein hum yahan automation wala link scraper daalenge
test_data = {
    "title": "Amazon Special Deal",
    "link": "https://amazon.in",
    "category": "Offers",
    "status": "Active"
}

# 4. Database mein save karna
db.collection('deals').add(test_data)
print("Deal successfully save ho gayi!")
