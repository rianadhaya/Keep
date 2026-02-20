# Keep Clone - Deployment Guide

This project is ready to be published on **Vercel**. Follow these steps to enable cloud synchronization.

## 1. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
<<<<<<< HEAD
2. Enable **Authentication** and add **Google** as a provider.
3. Enable **Firestore Database**.
4. Create a **Web App** in your Firebase project settings to get your configuration object.

## 2. Vercel Deployment

1. Upload this folder to a GitHub repository.
2. Connect the repository to [Vercel](https://vercel.com/).
3. **Crucial**: Add the following Environment Variables in Vercel settings (or update `src/firebase-config.js`):
=======
2. Enable **Firestore Database**.
3. Create a **Web App** in your Firebase project settings to get your configuration object.

## 2. Authentication

Project ini menggunakan login kustom:

- **Username**: `Selai`
- **Password**: `Kacang`

## 3. Vercel Configuration

1. Hubungkan repositori GitHub ke [Vercel](https://vercel.com/).
2. Tambahkan Environment Variables berikut:
>>>>>>> e3a695e (update file untuk vercel)
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

<<<<<<< HEAD
## 3. Local Configuration
=======
## 4. Local Configuration
>>>>>>> e3a695e (update file untuk vercel)

If you want to run it locally with your own Firebase:

1. Create a `.env` file in the root directory.
2. Add your keys using the `VITE_` prefix.
<<<<<<< HEAD
=======

## 5. Common Login Issues (Vercel)

Jika login gagal:

1. **Firestore Rules**: Pastikan "Rules" di Firestore Anda mengizinkan akses (bisa diatur ke "Test Mode").
2. **Environment Variables**: Pastikan semua kunci Firebase sudah diatur di Dashboard Vercel.
3. **Username/Password**: Gunakan `Selai` dan `Kacang` (case-sensitive).
>>>>>>> e3a695e (update file untuk vercel)
