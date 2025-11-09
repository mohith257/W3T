const QRCode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createDemoNFT() {
  try {
    const publicDir = path.join(__dirname, 'public');
    const nftDir = path.join(publicDir, 'nft-images');
    if (!fs.existsSync(nftDir)) fs.mkdirSync(nftDir, { recursive: true });

    // Generate QR code with demo ticket data
    const qrData = JSON.stringify({
      tokenId: '1731196800000',
      eventName: 'Cyber Security Conference 2025',
      tierName: 'VIP Access',
      verified: true
    });

    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });

    // Image dimensions
    const imageWidth = 800;
    const imageHeight = 600;
    const qrSectionHeight = 250;
    const totalHeight = imageHeight + qrSectionHeight;

    // Create white verification section with text
    const qrSection = Buffer.from(
      `<svg width="${imageWidth}" height="${qrSectionHeight}">
        <rect width="${imageWidth}" height="${qrSectionHeight}" fill="#ffffff"/>
        <text x="${imageWidth / 2}" y="30" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#000000">TICKET VERIFICATION</text>
        <text x="${imageWidth / 2}" y="55" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666666">Scan QR code at entry</text>
      </svg>`
    );

    // Create mock event image (simulating the Consolidated Intelligence dashboard)
    const mockEventImage = await sharp({
      create: {
        width: imageWidth,
        height: imageHeight,
        channels: 4,
        background: { r: 45, g: 55, b: 72, alpha: 1 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="${imageWidth}" height="${imageHeight}">
          <rect width="${imageWidth}" height="${imageHeight}" fill="#2D3748"/>
          <text x="${imageWidth / 2}" y="${imageHeight / 2 - 60}" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#FFFFFF">Consolidated Intelligence</text>
          <text x="${imageWidth / 2}" y="${imageHeight / 2}" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#A0AEC0">Security Analytics Dashboard</text>
          <text x="${imageWidth / 2}" y="${imageHeight / 2 + 40}" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#CBD5E0">Cyber Security Conference 2025</text>
          <text x="${imageWidth / 2}" y="${imageHeight / 2 + 80}" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#E2E8F0">VIP Access • Premium Seating</text>
        </svg>`
      ),
      top: 0,
      left: 0
    }])
    .png()
    .toBuffer();

    // Position QR code in center of white section
    const qrX = Math.floor((imageWidth - 200) / 2);
    const qrY = 70;

    // Composite everything together
    const outputPath = path.join(nftDir, 'demo-nft-with-qr.png');
    await sharp({
      create: {
        width: imageWidth,
        height: totalHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([
      { input: mockEventImage, top: 0, left: 0 },
      { input: qrSection, top: imageHeight, left: 0 },
      { input: qrCodeBuffer, top: imageHeight + qrY, left: qrX }
    ])
    .png()
    .toFile(outputPath);

    console.log('✅ NFT demo image created successfully!');
    console.log('📁 Location:', outputPath);
    console.log('🌐 URL: http://localhost:4000/nft-images/demo-nft-with-qr.png');
    console.log('\n📱 QR Code contains:');
    console.log(JSON.stringify(JSON.parse(qrData), null, 2));
  } catch (err) {
    console.error('❌ Error creating demo NFT:', err);
  }
}

createDemoNFT();
