# Chit-Chat
## Secure Real-Time Communication System (E2EE)
### Overview
This project is a secure real-time communication system designed to explore end-to-end encryption, key management, and cloud deployment in a realistic full-stack environment. The primary goal is to ensure message confidentiality even if the backend infrastructure is compromised.

The system uses client-side encryption with modern cryptographic primitives and a WebSocket-based backend that acts only as a message relay.

### Architecture

<p align="center">
  <img src="docs/architecture-e2ee-chat.png" alt="Chit-Chat Secure E2EE Architecture" width="900"/>
</p>

**Figure:** End-to-end encrypted real-time messaging architecture where the backend acts only as a relay and ciphertext storage layer.


- Frontend: React + TypeScript
- Backend: Node.js (WebSocket + REST)
- Database: PostgreSQL / MongoDB
- Cloud: AWS (EC2 / ECS, ALB, IAM)
- CI/CD: GitHub Actions

All cryptographic operations are performed on the client. The server never has access to plaintext messages or private keys.

### Security Design
**Message Flow**
- Client A generates an ephemeral session key
- Client A performs X25519 key exchange with Client B's public key
- Shared secret derived using HKDF
- Message encrypted using AES-256-GCM
- Ciphertext sent via WebSocket
- Server relays ciphertext only
- Client B decrypts locally
  
#### Threat Model

**Assumed threats**
- Compromised server or database
- Network interception
- Unauthorized read access to stored messages

**Out of scope**
- Compromised client devices
- Malware/keylogging
- Social engineering

**End-to-End Encryption**
- Each client generates a long-term identity key pair locally
- The design uses X25519 + HKDF for session key derivation.
- Messages are encrypted using AES-256-GCM
- Only the ciphertext is transmitted and stored

**Key Management**
- Private keys never leave the client
- Session keys are ephemeral
- Server stores only public keys and encrypted payloads
- Compromise of one session does not affect others

**Tradeoffs & Limitations**
- Metadata (timestamps, routing info) is visible to the server
- No content moderation due to E2EE
- Client compromise is not mitigated
- These tradeoffs were accepted to prioritize confidentiality and system simplicity.

**Some Questions**
- Why X25519: Chosen for strong security guarantees and performance in modern secure messaging systems.
- Why AES-GCM: Provides authenticated encryption, ensuring both confidentiality and message integrity.
- Why client-side encryption: Ensures that even if the backend infrastructure is compromised, message confidentiality remains protected.
- How is the [plan and status](docs/Plan.md) of this project?

#### **Motivation**
This project was built to understand better how secure communication systems operate in practice, beyond theoretical cryptography—focusing on real-world constraints such as deployment, reliability, and system boundaries.
