# ⚡ FlashBack: Resurrect Your Memories in Space

![Project Status](https://img.shields.io/badge/Status-Active_Development-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-PWA%20%7C%20Mobile-orange?style=for-the-badge)

> **"Music triggers memories. Locations hold them."**
>
> **FlashBack** is an AR-based social platform that allows users to bury their cherished moments—songs, stories, and emotions—into physical locations ("Memory Spots"). Experience the world not just through sight, but through the emotional echoes of the past.

---

## 📖 Table of Contents
- [The Problem & Solution](#-the-problem--solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Roadmap](#-roadmap)

---

## 🎯 The Problem & Solution

**The Problem:** Current social media focuses on fleeting, real-time sharing. We lack a way to organically preserve deep, personal memories tied to specific physical spaces and music.

**The Solution:** FlashBack bridges this gap. It's a **"Time Capsule for Places."**
* **Drop:** Leave a song and a story at a specific GPS location.
* **Discover:** Pass by that spot later (or let others pass by) to unlock the memory.
* **Connect:** Feel the "Vibe" of the city through the collective memories of its people.

---

## ✨ Key Features

* **📍 Memory Spots (LBS):** Precise location-based content delivery using **Google Maps API**.
* **🎵 Music Integration:** Search and embed songs directly via **iTunes Search API**.
* **🧠 Emotional AI Curator:** An AI persona that understands your mood and recommends memories using **Google Vertex AI (Gemini)**.
* **🗣️ Voice-First Experience:** Interactive voice conversations with the app using **ElevenLabs** (Low Latency TTS).
* **📱 Progressive Web App (PWA):** Installable on iOS/Android without an app store, offering a native-like experience.

---

## 🛠 Tech Stack

### Frontend (Mobile PWA)
| Tech | Role |
| :--- | :--- |
| ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | UI Framework |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) | Type Safety & Logic |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | Build Tool (Lightning Fast) |
| ![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white) | App Capability (Installable) |

### Backend & AI
| Tech | Role |
| :--- | :--- |
| ![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat&logo=Firebase&logoColor=white) | Firestore (DB) & Functions (Serverless) |
| ![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat&logo=google-cloud&logoColor=white) | Vertex AI (Gemini Pro) |
| ![ElevenLabs](https://img.shields.io/badge/ElevenLabs-000000?style=flat&logo=audio-technica&logoColor=white) | Realistic Voice Synthesis (TTS) |

---

## 🏗 System Architecture

The core innovation lies in the **Voice-AI Pipeline**, designed for natural, emotional interaction.

```mermaid
graph LR
    User[User Voice] -->|Input| STT[Speech-to-Text]
    STT -->|Text| Brain[Gemini (Vertex AI)]
    Brain -->|Function Calling| DB[(Firestore Memory)]
    DB -->|Context| Brain
    Brain -->|Response| TTS[ElevenLabs Turbo v2]
    TTS -->|Audio Stream| User
