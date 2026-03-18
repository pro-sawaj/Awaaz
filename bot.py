import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# 1. GitHub se secret key uthana
# Dhyan rahe ye wahi naam hai jo aapne Secret mein rakha tha
encoded_key = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')

if encoded_key:
    # 2. JSON ko load karna
    cred_json = json.loads(encoded_key)
    
    # 3. Firebase ko chalu karna
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_json)
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    print("Mubarak ho! Firebase se connection ban gaya.")
    
    # Yahan aap apna data daalne ka code likh sakte hain
    db.collection('logs').add({'message': 'Bot successfully chala!', 'time': 'now'})
else:
    print("Error: Secret Key nahi mili. GitHub Settings check karein.")
    
