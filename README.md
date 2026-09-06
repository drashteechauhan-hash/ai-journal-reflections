# AI Journal & Reflections

A secure, user-authenticated AI journaling web app built with **Google AI Studio** and deployed on **Google Cloud Run**. Users sign in, write multi-turn reflections, and converse with the Gemini Flash API. All entries are stored in a user-isolated Cloud Firestore database.

## Features
- 🔐 User authentication via **Firebase Authentication** (Google Sign-In)
- 💬 Multi-turn interaction with the **Gemini Flash API**
- 🗂️ User-isolated **Cloud Firestore** document storage (users can't read each other's entries)
- 🔑 Secure API key retrieval via **Google Cloud Secret Manager**

## Tech Stack
| Component | Technology |
| :--- | :--- |
| Frontend | TypeScript / Vite |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| AI Engine | Gemini Flash API |
| Hosting | Google Cloud Run |
| Secrets | Google Cloud Secret Manager |

## Prerequisites
- A Google Cloud project with billing enabled
- `gcloud` CLI installed and authenticated (or use Cloud Shell)
- APIs enabled: Cloud Run, Secret Manager, Firestore

## Secret Manager Setup
```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Firestore Security Rules
Owner-bound rules ensure each user can only access their own entries (see `firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Deploy to Cloud Run
```bash
gcloud run deploy ai-journal-reflections \
  --source . \
  --region=asia-southeast1 \
  --allow-unauthenticated
```

## Challenge Verification Label
```bash
gcloud run services update ai-journal-reflections \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-southeast1
```

## Live Demo
Deployed on Cloud Run: `https://ai-journal-reflections-0.ai.studio`
