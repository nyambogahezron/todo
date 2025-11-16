# Firebase Setup Instructions

This app uses Firebase for authentication and data storage. Follow these steps to configure Firebase for your project.

## Prerequisites

- A Firebase account (create one at [firebase.google.com](https://firebase.google.com))
- Node.js installed on your machine

## Setup Steps

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the prompts
3. Give your project a name (e.g., "2do-app")
4. Choose whether to enable Google Analytics (optional)

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click "Get started"
3. Enable **Email/Password** as a sign-in method
4. Click "Save"

### 3. Create a Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (you can update security rules later)
4. Select a Cloud Firestore location
5. Click "Enable"

### 4. Get Your Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "2do-web-app")
6. Copy the Firebase configuration object

### 5. Configure the App

You have two options to configure your Firebase credentials:

#### Option A: Use Environment Variables (Recommended)

1. Create a `.env` file in the root of your project:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

2. Replace the values with your actual Firebase configuration

#### Option B: Update Firebase Config File Directly

1. Open `lib/firebase.ts`
2. Replace the `firebaseConfig` object with your Firebase configuration:
   ```typescript
   const firebaseConfig = {
     apiKey: "your_api_key",
     authDomain: "your_auth_domain",
     projectId: "your_project_id",
     storageBucket: "your_storage_bucket",
     messagingSenderId: "your_sender_id",
     appId: "your_app_id",
   };
   ```

### 6. Update Firestore Security Rules (Optional)

For production, you should update your Firestore security rules to secure your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write only their own data
    match /todos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    match /notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    match /shoppingLists/{listId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    match /shoppingItems/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### 7. Run the App

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## Features

- **Authentication**: Email/password sign-in and sign-up
- **Todos**: Create, read, update, and delete todo items
- **Notes**: Create, read, update, and delete notes with tags
- **Shopping Lists**: Manage shopping lists with items, quantities, and prices
- **Real-time sync**: Data is automatically synced across devices

## Troubleshooting

### "User must be authenticated" Error

This error occurs when trying to access data without being logged in. Make sure to:
1. Sign up for a new account or sign in with existing credentials
2. Check that Firebase Authentication is properly enabled in your Firebase project

### Firebase Configuration Not Found

If you see errors about Firebase not being initialized:
1. Verify that your `.env` file exists and contains the correct values
2. Make sure the environment variables start with `EXPO_PUBLIC_`
3. Restart the development server after making changes to `.env`

### Firestore Permission Denied

If you get permission errors when accessing Firestore:
1. Check that you're signed in
2. Verify your Firestore security rules
3. In development, you can temporarily use test mode rules (not recommended for production)

## Support

For more information, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
