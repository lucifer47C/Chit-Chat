# 🔐 Chit-Chat — Secure E2EE Messaging System

Chit-Chat is a **cryptography-first secure messaging frontend** designed to explore how **end-to-end encryption (E2EE)** systems are built in practice. The project intentionally follows a **zero-trust backend model**: the server only relays ciphertext and never has access to plaintext messages or private keys.

This repository focuses on **correct cryptographic design, trust boundaries, and architecture**, rather than being a production-ready chat application.

---

## ✨ Key Principles

- 🔒 End-to-End Encryption by design
- 🧠 All cryptography runs on the client
- 🚫 Backend is untrusted (ciphertext-only)
- 🧪 Educational & security-focused implementation

---

## 🏗️ Architecture Overview

- **Frontend:** React + TypeScript
- **Crypto:** WebCrypto API (ECDH, HKDF, AES-GCM)
- **Backend (external):** WebSocket relay + REST APIs
- **Storage:** IndexedDB (client-side)

The backend is responsible only for:
- Authenticating users
- Relaying encrypted messages
- Storing ciphertext and public keys

---

## 📊 Project Status (Honest Assessment)

This section clearly documents **what is implemented**, **what is partially complete**, and **what is planned but not yet built**.

---

## ✅ Phase 1: Core Cryptography Engine — **Substantially Complete (≈85–90%)**

This is the most complete and mature part of the project.

### What is implemented

**Client-Side Crypto Module**
- Identity key generation using WebCrypto (ECDH-based)
- ECDH key exchange for shared secret derivation
- HKDF-based session key derivation
- AES-256-GCM authenticated encryption & decryption
- Key serialization and safe encoding/decoding
- Centralized cryptographic constants

**Secure Key Storage (Foundational)**
- IndexedDB schema for keys, sessions, and messages
- Encrypted key backup primitives (PBKDF2-based)

### What is pending
- Wiring encrypted key storage into full app lifecycle
- UI flow for password-protected key backup & recovery
- Key fingerprint display for manual verification

**Status:** Cryptographically correct and architecturally complete; missing UX and integration polish.

---

## 🟡 Phase 2: Authentication System — **Started (UI & State Scaffolding Only, ≈30–40%)**

### What is implemented
- Authentication page UI
- Authentication context and state management scaffolding

### What is pending
- Email/password authentication logic
- Google & GitHub OAuth integration
- JWT storage, refresh, and session persistence
- Signup → identity key generation flow
- Public key upload to backend during onboarding

**Status:** UI exists, but no real authentication or onboarding logic is implemented yet.

---

## 🟡 Phase 3: Chat Interface — **UI Complete, Logic Pending (≈50–60%)**

### What is implemented
- Chat layout and page structure
- Conversation sidebar UI
- Message thread with bubble-style messages
- Timestamps and placeholder encryption indicator
- Visual online/offline presence indicators

### What is pending
- Connecting UI to real conversation/message data
- Wiring chat UI to crypto engine
- Functional unread indicators
- Typing indicators and live presence updates
- Encryption status driven by real session state

**Status:** Visually complete but currently powered by static/demo data.

---

## 🟠 Phase 4: Real-Time Communication Layer — **Skeleton Only (≈10–15%)**

### What is implemented
- WebSocket client entry file

### What is pending
- WebSocket connection & reconnection logic
- JWT-based WebSocket authentication handshake
- Encrypt → send → receive → decrypt message pipeline
- Secure session establishment with key exchange
- Offline message queueing
- Heartbeat / keep-alive mechanism

**Status:** Planned and scaffolded, but not yet implemented.

---

## 🟠 Phase 5: Message History & Storage — **Schema Defined (≈10–20%)**

### What is implemented
- IndexedDB schema for messages and sessions
- Message interfaces including sync metadata

### What is pending
- Encrypted-at-rest message storage logic
- CRUD operations for local messages
- Server-side encrypted history retrieval
- Pagination and scroll-based loading
- Offline message access and sync reconciliation

**Status:** Data model exists; no operational logic yet.

---

## 🧭 What This Project Is (and Is Not)

### ✅ This project is
- A correct exploration of E2EE design
- A cryptography-first frontend architecture
- A realistic zero-trust messaging model

### ❌ This project is not
- A production-ready secure messenger
- A Signal/WhatsApp replacement
- A fully functional chat application (yet)

---

## 🎯 Motivation

Chit-Chat was built to understand **how secure messaging systems work in practice**, including:
- Trust boundaries
- Client-side cryptography
- Real-world architectural tradeoffs

Rather than maximizing features, the focus is on **correctness, clarity, and security principles**.

---

## ⚠️ Disclaimer

This project is for **educational purposes only** and has not undergone formal security audits. It should not be used to protect sensitive real-world communications without further hardening, review, and testing.

---

## 📌 Next Steps

- Implement Phase 4 (WebSocket message flow)
- Wire crypto engine into chat UI
- Add key backup & recovery UX
- Complete local encrypted message storage

---

🔐 *Designed with security first. Built to learn how E2EE really works.*