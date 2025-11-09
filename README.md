# 🎫 BeatChain Tickets - Blockchain NFT Ticketing Platform

A decentralized event ticketing platform built on Ethereum blockchain that issues NFT tickets with participant count management and seamless verification system.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Blockchain](https://img.shields.io/badge/blockchain-Ethereum-purple.svg)
![Network](https://img.shields.io/badge/network-Sepolia-orange.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Ticket Verification System](#ticket-verification-system)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

BeatChain Tickets revolutionizes event ticketing by leveraging blockchain technology to create secure, transparent, and fraud-proof NFT tickets. Each ticket is a unique digital asset that can accommodate multiple participants, with prices automatically calculated based on the participant count.

### Why BeatChain Tickets?

- **🔒 Fraud Prevention**: Blockchain-verified tickets that cannot be counterfeited
- **👥 Flexible Participants**: Purchase tickets for multiple people with dynamic pricing
- **⚡ Instant Verification**: Quick Token ID-based verification at event entry
- **💰 Direct Payments**: Smart contract-based payments with no intermediaries
- **🎨 NFT Collectibles**: Tickets are permanent digital collectibles with event artwork
- **📊 Transparent Tracking**: Complete visibility of ticket sales and attendance

## ✨ Features

### For Event Organizers

- **Create Events**: Upload event details, images, date, location, and venue capacity
- **Multi-Tier Pricing**: Set up different ticket tiers (VIP, General Admission, etc.)
- **Dynamic Supply Management**: Control ticket availability for each tier
- **Real-Time Sales Dashboard**: Monitor ticket sales and revenue
- **Attendance Tracking**: Track total participants across all tickets
- **Token ID Verification**: Simple verification system at event entry
- **Blockchain Security**: All sales recorded on Ethereum blockchain

### For Ticket Buyers

- **Browse Events**: Explore upcoming events with detailed information
- **MetaMask Integration**: Secure wallet connection for purchases
- **Participant Count Selection**: Buy tickets for 1 or more people
- **Dynamic Price Calculation**: See total price update based on participant count
- **NFT Ticket Ownership**: Receive unique NFT tickets in your wallet
- **Easy Verification**: Show your Token ID at event entry
- **Digital Collectibles**: Keep tickets as permanent blockchain artifacts

### For Entry Staff

- **Scanner Interface**: Dedicated ticket verification page
- **Token ID Lookup**: Enter Token ID to verify ticket authenticity
- **Instant Validation**: Real-time verification against blockchain data
- **Participant Count Display**: See how many people are allowed entry
- **Event & Tier Info**: View complete ticket details
- **Color-Coded Results**: Green for valid, red for invalid tickets

## 🛠 Technology Stack

### Frontend

- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Shadcn/ui** - Component library
- **ethers.js v6** - Ethereum blockchain interaction
- **React Router** - Client-side routing

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **ethers.js v5** - Smart contract interaction
- **Sharp** - Image processing for NFT generation
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Blockchain

- **Ethereum** - Blockchain network
- **Sepolia Testnet** - Development network
- **Solidity** - Smart contract language
- **MetaMask** - Web3 wallet provider
- **ERC-721** - NFT token standard

### Infrastructure

- **Local Storage** - Event and ticket data persistence
- **File System** - NFT image storage
- **JSON** - Data serialization

## 🏗 Architecture

### System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │◄────────┤  Express API    │◄────────┤  Ethereum       │
│  (Port 8080)    │         │  (Port 4000)    │         │  Blockchain     │
│                 │         │                 │         │  (Sepolia)      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                           │
        │                           │                           │
        ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  MetaMask       │         │  Local Storage  │         │  Smart          │
│  Wallet         │         │  (events.json)  │         │  Contracts      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Data Flow

1. **Event Creation**: Organizer creates event → Backend stores data → Smart contract initialized
2. **Ticket Purchase**: User selects participants → Frontend calculates price → Smart contract mints NFT
3. **NFT Generation**: Backend creates image with Token ID → Uploads to storage → Returns URI
4. **Verification**: Staff enters Token ID → Backend searches database → Returns ticket details

## 📜 Smart Contracts

### TicketNFT Contract

**Address**: `0x60CcE6f4058661AB5DE636Af3d6dD8e64D9c8A5a`

Main NFT contract implementing ERC-721 standard for ticket minting.

**Key Functions**:

- `mint(address to, string uri, bytes32 metadataHash)` - Mint new ticket NFT
- `tokenURI(uint256 tokenId)` - Get ticket metadata URI
- `ownerOf(uint256 tokenId)` - Get ticket owner address
- `balanceOf(address owner)` - Get number of tickets owned

### Marketplace Contract

**Address**: `0xce58401fCDF6CF3dF6F85e3A0c3C21e75ED2fc58`

Handles ticket purchasing logic and payments to organizers.

**Key Functions**:

- `purchaseTicket(uint256 ticketId, address organizer)` - Buy ticket with ETH
- `getTicketPrice(uint256 ticketId)` - Get ticket price
- `withdraw()` - Organizer withdraws earnings

### Contract Deployment

Contracts are deployed on **Sepolia Testnet**. To deploy your own:

```solidity
// Deploy TicketNFT
const TicketNFT = await ethers.getContractFactory("TicketNFT");
const ticketNFT = await TicketNFT.deploy();
await ticketNFT.deployed();

// Deploy Marketplace
const Marketplace = await ethers.getContractFactory("Marketplace");
const marketplace = await Marketplace.deploy(ticketNFT.address);
await marketplace.deployed();
```

## 📥 Installation

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **MetaMask** browser extension
- **Git** for version control
- **Sepolia testnet ETH** (get from faucet)

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/beat-chain-tickets.git
cd beat-chain-tickets-main
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start backend server
node server.js
```

Backend will run on `http://localhost:4000`

### Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd quantum-pass-main

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:8080` (or 8081 if 8080 is busy)

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=4000
BASE_URL=http://localhost:4000

# Frontend CORS Origins (comma-separated)
FRONTEND_ORIGIN=http://localhost:8080,http://localhost:8081

# Ethereum Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key_here

# Smart Contract Addresses
TICKET_NFT_ADDRESS=0x60CcE6f4058661AB5DE636Af3d6dD8e64D9c8A5a
MARKETPLACE_ADDRESS=0xce58401fCDF6CF3dF6F85e3A0c3C21e75ED2fc58

# Optional: IPFS/NFT.Storage (for production)
NFT_STORAGE_KEY=your_nft_storage_api_key
```

### Frontend Configuration

Update contract addresses in frontend if deploying your own contracts:

**File**: `quantum-pass-main/src/config/contracts.ts`

```typescript
export const TICKET_NFT_ADDRESS = "0x60CcE6f4058661AB5DE636Af3d6dD8e64D9c8A5a";
export const MARKETPLACE_ADDRESS = "0xce58401fCDF6CF3dF6F85e3A0c3C21e75ED2fc58";
export const NETWORK_ID = 11155111; // Sepolia
```

### MetaMask Setup

1. Install MetaMask browser extension
2. Create or import wallet
3. Switch to **Sepolia Test Network**
4. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

## 🚀 Usage

### Creating an Event (Organizer)

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Navigate**: Click "For Organizers" → "Create Event"
3. **Fill Details**:
   - Event name, description, location
   - Date and time
   - Venue capacity
   - Upload event image
4. **Add Ticket Tiers**:
   - Tier name (e.g., "VIP", "General Admission")
   - Base price per person (in ETH)
   - Supply/quantity available
5. **Submit**: Click "Create Event" and confirm transaction
6. **Wait**: Backend processes and deploys to blockchain

### Purchasing Tickets (Buyer)

1. **Connect Wallet**: Ensure MetaMask is connected
2. **Browse Events**: Go to "Explore Events"
3. **Select Event**: Click on event card for details
4. **Choose Tier**: Click "Get Ticket" on desired tier
5. **Set Participants**: Enter number of people (1 or more)
6. **Review Price**: Total = Base Price × Participant Count
7. **Purchase**: Click "Purchase Ticket" → Approve transaction in MetaMask
8. **Receive NFT**: NFT ticket minted to your wallet

### Verifying Tickets (Entry Staff)

1. **Access Scanner**: Click "Scan Tickets" in navigation
2. **Get Token ID**: Ask attendee to show their NFT ticket
3. **Enter ID**: Type the Token ID displayed on their ticket
4. **Verify**: Click "Verify Ticket"
5. **Check Results**:
   - ✅ **Green**: Valid ticket - allow entry
   - ❌ **Red**: Invalid ticket - deny entry
6. **View Details**: See event, tier, and participant count
7. **Allow Entry**: Let the specified number of people in

## 🎫 Ticket Verification System

### How It Works

Each NFT ticket contains:

- **Token ID**: Unique identifier (e.g., 1, 2, 3...)
- **Event Name**: Which event the ticket is for
- **Tier**: Type of ticket (VIP, General, etc.)
- **Participants**: Number of people allowed entry
- **Organizer**: Who created the event

### Verification Process

```
1. Attendee shows NFT → Staff sees Token ID
2. Staff enters Token ID → API queries database
3. System searches all events → Finds matching ticket
4. Returns ticket details → Display on scanner
5. Staff checks participant count → Allows entry
```

### NFT Ticket Display

Each NFT image shows:

```
┌─────────────────────────────────┐
│                                 │
│     EVENT IMAGE (1200x800)      │
│                                 │
├─────────────────────────────────┤
│     TOKEN ID: 123              │
│     Tier: VIP                   │
│     Participants: 3             │
│     Show this ID at entry       │
└─────────────────────────────────┘
```

### Scanner Interface

**Input**:

```
Token ID: [___________]
         [Verify Ticket]
```

**Output (Valid)**:

```
✅ Valid Ticket

TOKEN ID: 123
Event: Summer Music Festival
Tier: VIP Backstage Pass
Participants: 3

✅ ALLOW 3 PEOPLE TO ENTER
```

**Output (Invalid)**:

```
❌ Invalid Ticket

Error: Ticket not found - Invalid Token ID
```

## 📡 API Documentation

### Base URL

```
http://localhost:4000
```

### Endpoints

#### 1. Create Event

```http
POST /events
Content-Type: application/json

{
  "name": "Summer Music Festival",
  "description": "Annual music festival",
  "date": "2025-07-15T18:00:00Z",
  "location": "Central Park, NYC",
  "capacity": 5000,
  "imageUrl": "http://localhost:4000/uploads/image.jpg",
  "organizer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "ticketTiers": [
    {
      "name": "VIP",
      "price": "0.05",
      "supply": 100
    }
  ]
}

Response: {
  "success": true,
  "eventId": "evt_123456789",
  "message": "Event created successfully"
}
```

#### 2. Get All Events

```http
GET /events

Response: [
  {
    "id": "evt_123456789",
    "name": "Summer Music Festival",
    "date": "2025-07-15T18:00:00Z",
    "location": "Central Park, NYC",
    "capacity": 5000,
    "attendees": 0,
    "imageUrl": "http://localhost:4000/uploads/image.jpg",
    "ticketTiers": [...]
  }
]
```

#### 3. Get Single Event

```http
GET /events/:id

Response: {
  "id": "evt_123456789",
  "name": "Summer Music Festival",
  "description": "Annual music festival",
  "date": "2025-07-15T18:00:00Z",
  "location": "Central Park, NYC",
  "capacity": 5000,
  "attendees": 150,
  "imageUrl": "http://localhost:4000/uploads/image.jpg",
  "organizer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "ticketTiers": [...],
  "tickets": [...]
}
```

#### 4. Purchase Ticket

```http
POST /tickets/purchase
Content-Type: application/json

{
  "eventId": "evt_123456789",
  "tier": "VIP",
  "buyer": "0x123...",
  "participants": 3,
  "transactionHash": "0xabc..."
}

Response: {
  "success": true,
  "tokenId": "123",
  "message": "Ticket purchased successfully"
}
```

#### 5. Generate NFT Metadata

```http
POST /metadata
Content-Type: application/json

{
  "eventId": "evt_123456789",
  "tokenId": "123",
  "tier": "VIP",
  "participants": 3
}

Response: {
  "success": true,
  "metadataUrl": "http://localhost:4000/metadata/123.json",
  "imageUrl": "http://localhost:4000/nft-images/nft-123.png"
}
```

#### 6. Verify Ticket

```http
POST /verify-ticket
Content-Type: application/json

{
  "tokenId": "123"
}

Response: {
  "success": true,
  "valid": true,
  "ticket": {
    "tokenId": "123",
    "eventName": "Summer Music Festival",
    "tierName": "VIP",
    "participants": 3,
    "purchaser": "0x123...",
    "purchaseDate": "2025-11-09T10:30:00Z"
  },
  "message": "Valid ticket for 3 participants"
}
```

#### 7. Upload Image

```http
POST /upload
Content-Type: multipart/form-data

image: [file]

Response: {
  "success": true,
  "imageUrl": "http://localhost:4000/uploads/image-123.jpg"
}
```

#### 8. Authentication (Nonce)

```http
GET /auth/nonce?address=0x123...

Response: {
  "nonce": "abc123def456"
}

POST /auth/verify
Content-Type: application/json

{
  "address": "0x123...",
  "signature": "0xsignature..."
}

Response: {
  "ok": true,
  "address": "0x123..."
}
```

## 📁 Project Structure

```
beat-chain-tickets-main/
├── backend/
│   ├── server.js                 # Main Express server
│   ├── package.json              # Backend dependencies
│   ├── .env                      # Environment variables
│   ├── data/
│   │   └── events.json          # Event storage
│   └── public/
│       ├── uploads/             # Event images
│       ├── nft-images/          # Generated NFT tickets
│       └── metadata/            # NFT metadata JSON files
│
├── quantum-pass-main/           # Frontend (React + Vite)
│   ├── src/
│   │   ├── main.jsx            # App entry point
│   │   ├── App.jsx             # Main app component
│   │   ├── index.css           # Global styles
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page
│   │   │   ├── Events.jsx      # Event listing
│   │   │   ├── EventDetail.jsx # Single event view
│   │   │   ├── Dashboard.jsx   # User dashboard
│   │   │   ├── CreateEvent.jsx # Event creation form
│   │   │   ├── Marketplace.jsx # Ticket marketplace
│   │   │   ├── TicketScanner.tsx # Verification interface
│   │   │   ├── Auth.jsx        # Authentication
│   │   │   └── NotFound.jsx    # 404 page
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation bar
│   │   │   ├── Navigation.tsx  # Main navigation
│   │   │   ├── Footer.jsx      # Footer component
│   │   │   ├── WalletModal.tsx # Wallet connection
│   │   │   └── ui/            # Shadcn UI components
│   │   ├── hooks/
│   │   │   ├── use-mobile.jsx  # Mobile detection
│   │   │   └── use-toast.js    # Toast notifications
│   │   └── lib/
│   │       └── utils.js        # Utility functions
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.ts          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── tsconfig.json           # TypeScript config
│
├── contracts/                   # Smart contracts (optional)
│   ├── TicketNFT.sol
│   └── Marketplace.sol
│
├── README.md                    # This file
├── TOKEN_ID_SCANNER_UPDATE.md  # Scanner documentation
└── QR_SCANNER_GUIDE.md         # QR system guide
```

## 📸 Screenshots

### Home Page

Landing page with hero section and event highlights.

### Event Listing

Browse all available events with filters and search.

### Event Details

View complete event information, ticket tiers, and purchase options.

### Ticket Purchase Modal

Select participant count and see dynamic price calculation.

### NFT Ticket

Generated NFT with event image, Token ID, tier, and participant count.

### Scanner Interface

Simple Token ID input for quick ticket verification.

### Organizer Dashboard

Event management and sales analytics for organizers.

## 🔧 Troubleshooting

### Common Issues

#### 1. MetaMask Connection Fails

**Problem**: "Please install MetaMask" error
**Solution**:

- Install MetaMask extension from [metamask.io](https://metamask.io)
- Refresh the page
- Check that MetaMask is unlocked

#### 2. Transaction Fails

**Problem**: Transaction rejected or fails
**Solution**:

- Ensure you're on Sepolia testnet
- Check you have enough test ETH
- Verify gas price is reasonable
- Try increasing gas limit manually

#### 3. Images Not Loading

**Problem**: Event or NFT images show broken
**Solution**:

- Check backend is running on port 4000
- Verify `BASE_URL` in `.env` is correct
- Check file permissions in `public/uploads`
- Clear browser cache

#### 4. Port Already in Use

**Problem**: `EADDRINUSE: address already in use`
**Solution**:

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9

# Or change port in .env
PORT=4001
```

#### 5. CORS Errors

**Problem**: Cross-origin request blocked
**Solution**:

- Update `FRONTEND_ORIGIN` in `.env`
- Make sure frontend port matches
- Restart backend server

#### 6. Smart Contract Error

**Problem**: "Contract execution failed"
**Solution**:

- Check contract addresses are correct
- Verify you're on correct network (Sepolia)
- Ensure contract has proper approvals
- Check account has sufficient ETH

#### 7. Token ID Not Found

**Problem**: Scanner shows "Ticket not found"
**Solution**:

- Verify Token ID is correct
- Check ticket was successfully minted
- Ensure backend data is not corrupted
- Verify `events.json` file exists

### Debug Mode

Enable debug logging:

**Backend** (`server.js`):

```javascript
// Add at top of file
process.env.DEBUG = "true";
```

**Frontend** (Browser Console):

```javascript
localStorage.setItem("debug", "true");
```

### Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/YOUR_USERNAME/beat-chain-tickets/issues)
- **Documentation**: Check `TOKEN_ID_SCANNER_UPDATE.md` and `QR_SCANNER_GUIDE.md`
- **Community**: Join our Discord/Telegram (add links)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** thoroughly
6. **Commit**: `git commit -m 'Add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

### Contribution Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Add comments for complex logic
- Update documentation for new features
- Test on multiple browsers
- Ensure backwards compatibility
- Keep pull requests focused and small

### Areas for Contribution

- 🎨 UI/UX improvements
- 🔐 Security enhancements
- 📱 Mobile responsiveness
- 🌐 Internationalization (i18n)
- 🧪 Test coverage
- 📚 Documentation improvements
- 🐛 Bug fixes
- ✨ New features

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow open source best practices

## 🔒 Security

### Best Practices Implemented

- ✅ Private key stored in `.env` (never commit!)
- ✅ CORS configured for specific origins
- ✅ Input validation on all endpoints
- ✅ Blockchain verification for all transactions
- ✅ MetaMask signature authentication
- ✅ No direct database queries (JSON file storage)

### Security Considerations

⚠️ **Important Notes**:

1. **Private Keys**: Never share or commit your private keys
2. **Testnet Only**: Current setup is for Sepolia testnet
3. **Production**: Use IPFS/Arweave for image storage in production
4. **Authentication**: Implement proper JWT-based auth for production
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **HTTPS**: Use HTTPS in production
7. **Environment Variables**: Keep `.env` files secure

### Reporting Vulnerabilities

Found a security issue? Please email: security@yourdomain.com

**Do not** create public issues for security vulnerabilities.

## 📄 License

This project is licensed under the **MIT License** - see below for details:

```
MIT License

Copyright (c) 2025 BeatChain Tickets

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **OpenZeppelin**: Smart contract libraries
- **Ethereum Foundation**: Blockchain infrastructure
- **MetaMask**: Web3 wallet integration
- **Shadcn/ui**: Beautiful UI components
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework

## 🗺 Roadmap

### Version 1.0 (Current)

- ✅ Basic event creation and management
- ✅ NFT ticket minting
- ✅ Participant count system
- ✅ Token ID verification
- ✅ Multi-tier pricing
- ✅ MetaMask integration

### Version 1.1 (Upcoming)

- 📱 Mobile app (React Native)
- 📸 QR code camera scanning
- 🔄 Secondary ticket marketplace
- 💬 Event chat/community
- 📊 Advanced analytics dashboard
- 🎟️ Batch ticket purchases

### Version 2.0 (Future)

- 🌍 Multi-chain support (Polygon, BSC)
- 🎭 NFT ticket customization
- 🎫 Ticket transfer functionality
- 💎 Royalties on resales
- 🏆 Loyalty rewards system
- 🤖 AI-powered fraud detection
- 📧 Email notifications
- 💳 Credit card payments (via Stripe)

## 📞 Contact & Support

- **GitHub**: [Your GitHub Profile](https://github.com/YOUR_USERNAME)
- **Email**: your.email@example.com
- **Twitter**: [@YourTwitter](https://twitter.com/YOUR_HANDLE)
- **Discord**: [Join our server](https://discord.gg/YOUR_INVITE)
- **Website**: [yourwebsite.com](https://yourwebsite.com)

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/beat-chain-tickets?style=social)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/beat-chain-tickets?style=social)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/beat-chain-tickets)
![GitHub pull requests](https://img.shields.io/github/issues-pr/YOUR_USERNAME/beat-chain-tickets)

---

<div align="center">

**Made with ❤️ by the BeatChain Team**

[⭐ Star this repo](https://github.com/YOUR_USERNAME/beat-chain-tickets) • [🐛 Report Bug](https://github.com/YOUR_USERNAME/beat-chain-tickets/issues) • [✨ Request Feature](https://github.com/YOUR_USERNAME/beat-chain-tickets/issues)

</div>
