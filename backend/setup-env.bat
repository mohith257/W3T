@echo off
setlocal enabledelayedexpansion

:: Deployment Setup Helper Script for Windows
:: This script helps you configure your environment variables after deployment

echo ================================================
echo   BeatChain Tickets - Deployment Setup Helper  
echo ================================================
echo.

:: Check if .env exists
if exist .env (
    echo WARNING: .env file already exists!
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "!overwrite!"=="y" (
        echo Cancelled. Your existing .env file was not modified.
        pause
        exit /b 1
    )
)

echo Let's configure your backend environment variables...
echo.

:: CONTRACT_ADDRESS
echo Step 1: NFT Contract Address
echo    (From Remix after deploying TicketNFT.sol)
set /p CONTRACT_ADDRESS="   Enter CONTRACT_ADDRESS: "

:: MARKETPLACE_ADDRESS
echo.
echo Step 2: Marketplace Contract Address
echo    (From Remix after deploying TicketResaleMarketplace.sol)
set /p MARKETPLACE_ADDRESS="   Enter MARKETPLACE_ADDRESS: "

:: PRIVATE_KEY
echo.
echo Step 3: Your Wallet Private Key
echo    WARNING: Keep this SECRET! Never share it!
echo    (From MetaMask: Account Details -^> Export Private Key)
set /p PRIVATE_KEY="   Enter PRIVATE_KEY: "

:: RPC_URL
echo.
echo Step 4: RPC Provider URL
echo    Choose your provider:
echo    1) Alchemy Sepolia (Recommended)
echo    2) Infura Sepolia
echo    3) Custom RPC URL
set /p rpc_choice="   Enter choice (1-3): "

if "!rpc_choice!"=="1" (
    echo.
    echo    Get your Alchemy API key from: https://www.alchemy.com/
    set /p ALCHEMY_KEY="   Enter Alchemy API Key: "
    set RPC_URL=https://eth-sepolia.g.alchemy.com/v2/!ALCHEMY_KEY!
) else if "!rpc_choice!"=="2" (
    echo.
    echo    Get your Infura API key from: https://www.infura.io/
    set /p INFURA_KEY="   Enter Infura Project ID: "
    set RPC_URL=https://sepolia.infura.io/v3/!INFURA_KEY!
) else if "!rpc_choice!"=="3" (
    echo.
    set /p RPC_URL="   Enter custom RPC URL: "
) else (
    echo Invalid choice. Using default localhost.
    set RPC_URL=http://localhost:8545
)

:: Create .env file
echo.
echo Creating .env file...

(
echo # Backend Environment Variables for Blockchain Integration
echo # Generated on: %date% %time%
echo.
echo # ===== CONTRACT ADDRESSES =====
echo CONTRACT_ADDRESS=!CONTRACT_ADDRESS!
echo MARKETPLACE_ADDRESS=!MARKETPLACE_ADDRESS!
echo.
echo # ===== WALLET ^& RPC =====
echo PRIVATE_KEY=!PRIVATE_KEY!
echo RPC_URL=!RPC_URL!
echo.
echo # ===== SERVER CONFIGURATION =====
echo BASE_URL=http://localhost:4000
echo PORT=4000
echo FRONTEND_ORIGIN=http://localhost:8080,http://localhost:8081
) > .env

echo .env file created successfully!
echo.

:: Verify the configuration
echo ================================================
echo   Configuration Summary
echo ================================================
echo CONTRACT_ADDRESS:     !CONTRACT_ADDRESS!
echo MARKETPLACE_ADDRESS:  !MARKETPLACE_ADDRESS!
echo RPC_URL:             !RPC_URL!
echo PRIVATE_KEY:         !PRIVATE_KEY:~0,10!...!PRIVATE_KEY:~-4! (hidden)
echo.

:: Frontend setup
echo ================================================
echo   Frontend Configuration
echo ================================================
echo.
echo Now let's setup the frontend environment...
echo.
pause

:: Check frontend directory
set FRONTEND_DIR=..\quantum-pass-main
if not exist "%FRONTEND_DIR%" (
    echo Frontend directory not found at: %FRONTEND_DIR%
    echo    Please configure manually.
    pause
    exit /b 1
)

:: Create frontend .env
(
echo # Frontend Environment Variables
echo # Generated on: %date% %time%
echo.
echo VITE_MARKETPLACE_ADDRESS=!MARKETPLACE_ADDRESS!
echo VITE_API_URL=http://localhost:4000
) > "%FRONTEND_DIR%\.env"

echo Frontend .env file created at: %FRONTEND_DIR%\.env
echo.

:: Final instructions
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Next steps:
echo.
echo 1. Start the backend server:
echo    cd backend
echo    npm start
echo.
echo 2. Start the frontend (in new terminal):
echo    cd quantum-pass-main
echo    npm run dev
echo.
echo 3. Open your browser and test!
echo.
echo IMPORTANT SECURITY REMINDERS:
echo    - NEVER commit the .env file to Git
echo    - NEVER share your private key
echo    - This is testnet - use separate wallet from mainnet
echo.
echo For detailed deployment guide, see:
echo    - REMIX_DEPLOYMENT_GUIDE.md
echo    - DEPLOYMENT_CHECKLIST.md
echo.
echo ================================================
echo.
pause
