#!/bin/bash

# Deployment Setup Helper Script
# This script helps you configure your environment variables after deployment

echo "================================================"
echo "  BeatChain Tickets - Deployment Setup Helper  "
echo "================================================"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Your existing .env file was not modified."
        exit 1
    fi
fi

echo "Let's configure your backend environment variables..."
echo ""

# CONTRACT_ADDRESS
echo "📝 Step 1: NFT Contract Address"
echo "   (From Remix after deploying TicketNFT.sol)"
read -p "   Enter CONTRACT_ADDRESS: " CONTRACT_ADDRESS

# MARKETPLACE_ADDRESS
echo ""
echo "📝 Step 2: Marketplace Contract Address"
echo "   (From Remix after deploying TicketResaleMarketplace.sol)"
read -p "   Enter MARKETPLACE_ADDRESS: " MARKETPLACE_ADDRESS

# PRIVATE_KEY
echo ""
echo "📝 Step 3: Your Wallet Private Key"
echo "   ⚠️  WARNING: Keep this SECRET! Never share it!"
echo "   (From MetaMask: Account Details → Export Private Key)"
read -p "   Enter PRIVATE_KEY: " PRIVATE_KEY

# RPC_URL
echo ""
echo "📝 Step 4: RPC Provider URL"
echo "   Choose your provider:"
echo "   1) Alchemy Sepolia (Recommended)"
echo "   2) Infura Sepolia"
echo "   3) Custom RPC URL"
read -p "   Enter choice (1-3): " rpc_choice

case $rpc_choice in
    1)
        echo ""
        echo "   Get your Alchemy API key from: https://www.alchemy.com/"
        read -p "   Enter Alchemy API Key: " ALCHEMY_KEY
        RPC_URL="https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_KEY"
        ;;
    2)
        echo ""
        echo "   Get your Infura API key from: https://www.infura.io/"
        read -p "   Enter Infura Project ID: " INFURA_KEY
        RPC_URL="https://sepolia.infura.io/v3/$INFURA_KEY"
        ;;
    3)
        echo ""
        read -p "   Enter custom RPC URL: " RPC_URL
        ;;
    *)
        echo "❌ Invalid choice. Using default localhost."
        RPC_URL="http://localhost:8545"
        ;;
esac

# Create .env file
echo ""
echo "📄 Creating .env file..."

cat > .env << EOF
# Backend Environment Variables for Blockchain Integration
# Generated on: $(date)

# ===== CONTRACT ADDRESSES =====
CONTRACT_ADDRESS=$CONTRACT_ADDRESS
MARKETPLACE_ADDRESS=$MARKETPLACE_ADDRESS

# ===== WALLET & RPC =====
PRIVATE_KEY=$PRIVATE_KEY
RPC_URL=$RPC_URL

# ===== SERVER CONFIGURATION =====
BASE_URL=http://localhost:4000
PORT=4000
FRONTEND_ORIGIN=http://localhost:8080,http://localhost:8081
EOF

echo "✅ .env file created successfully!"
echo ""

# Verify the configuration
echo "================================================"
echo "  Configuration Summary"
echo "================================================"
echo "CONTRACT_ADDRESS:     $CONTRACT_ADDRESS"
echo "MARKETPLACE_ADDRESS:  $MARKETPLACE_ADDRESS"
echo "RPC_URL:             $RPC_URL"
echo "PRIVATE_KEY:         ${PRIVATE_KEY:0:10}...${PRIVATE_KEY: -4} (hidden)"
echo ""

# Frontend setup
echo "================================================"
echo "  Frontend Configuration"
echo "================================================"
echo ""
echo "Now let's setup the frontend environment..."
echo ""

read -p "Press Enter to continue or Ctrl+C to exit..."

# Check frontend directory
FRONTEND_DIR="../quantum-pass-main"
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found at: $FRONTEND_DIR"
    echo "   Please configure manually."
    exit 1
fi

# Create frontend .env
cat > "$FRONTEND_DIR/.env" << EOF
# Frontend Environment Variables
# Generated on: $(date)

VITE_MARKETPLACE_ADDRESS=$MARKETPLACE_ADDRESS
VITE_API_URL=http://localhost:4000
EOF

echo "✅ Frontend .env file created at: $FRONTEND_DIR/.env"
echo ""

# Final instructions
echo "================================================"
echo "  🎉 Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "2. Start the frontend (in new terminal):"
echo "   cd quantum-pass-main"
echo "   npm run dev"
echo ""
echo "3. Open your browser and test!"
echo ""
echo "⚠️  IMPORTANT SECURITY REMINDERS:"
echo "   - NEVER commit the .env file to Git"
echo "   - NEVER share your private key"
echo "   - This is testnet - use separate wallet from mainnet"
echo ""
echo "📖 For detailed deployment guide, see:"
echo "   - REMIX_DEPLOYMENT_GUIDE.md"
echo "   - DEPLOYMENT_CHECKLIST.md"
echo ""
echo "================================================"
