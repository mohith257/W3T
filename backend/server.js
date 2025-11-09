require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');
const fetch = require('node-fetch');

const app = express();
// Restrict CORS to one or more frontend origins during development.
// Set FRONTEND_ORIGIN as a single origin or comma-separated list (e.g. http://localhost:8080,http://localhost:8081)
// By default allow common local dev ports 8080 and 8081 so Vite auto-port selection works.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080,http://localhost:8081';
const FRONTEND_ORIGINS = FRONTEND_ORIGIN.split(',').map(s => s.trim());

app.use(
	cors({
		origin: function(origin, callback) {
			// Allow non-browser requests (e.g. curl, server-to-server) when origin is undefined
			if (!origin) return callback(null, true);
			if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
			return callback(new Error('CORS policy: Origin not allowed'), false);
		},
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: false,
	})
);
app.use(express.json());
// In-memory nonce store (for demo). For production, persist nonces per address in DB.
const nonces = new Map();

function generateNonce() {
	return Math.floor(Math.random() * 1000000).toString();
}
// Serve static client helper from / (public folder)
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Configure multer for image uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadsDir = path.join(publicDir, 'uploads');
		if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
		cb(null, uploadsDir);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	}
});

const upload = multer({ 
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter: function (req, file, cb) {
		const allowedTypes = /jpeg|jpg|png|gif|webp/;
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = allowedTypes.test(file.mimetype);
		if (mimetype && extname) {
			return cb(null, true);
		}
		cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
	}
});

// Helper function to create composite NFT image with QR code
async function createNFTTicketImage(eventImageUrl, tokenId, eventName, tierName, participantCount = 1) {
	try {
		const nftDir = path.join(publicDir, 'nft-images');
		if (!fs.existsSync(nftDir)) fs.mkdirSync(nftDir, { recursive: true });
		
		const outputFilename = `nft-${tokenId}-${Date.now()}.png`;
		const outputPath = path.join(nftDir, outputFilename);
		
		// Determine if eventImageUrl is local or remote
		let eventImageBuffer;
		if (eventImageUrl.startsWith('http://') || eventImageUrl.startsWith('https://')) {
			// Fetch remote image
			const response = await fetch(eventImageUrl);
			if (!response.ok) throw new Error('Failed to fetch event image');
			eventImageBuffer = Buffer.from(await response.arrayBuffer());
		} else {
			// Local file path - extract filename from URL
			const filename = eventImageUrl.split('/uploads/').pop();
			const localPath = path.join(publicDir, 'uploads', filename);
			if (!fs.existsSync(localPath)) throw new Error('Event image not found locally');
			eventImageBuffer = fs.readFileSync(localPath);
		}
		
		// Create composite image: event image on top, info bar at bottom
		const eventImage = sharp(eventImageBuffer);
		const metadata = await eventImage.metadata();
		
		// Standardize dimensions for NFT (1200x800 recommended)
		const standardWidth = 1200;
		const standardHeight = 800;
		const imageWidth = standardWidth;
		const imageHeight = standardHeight;
		
		// Info section dimensions for ticket details
		const infoSectionHeight = 250;
		const totalHeight = imageHeight + infoSectionHeight;
		
		// Create white background section with ticket information
		const infoSection = Buffer.from(
			`<svg width="${imageWidth}" height="${infoSectionHeight}">
				<rect width="${imageWidth}" height="${infoSectionHeight}" fill="#ffffff"/>
				
				<!-- Token ID - Large and prominent -->
				<text x="${imageWidth / 2}" y="60" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#000000">TOKEN ID: ${tokenId}</text>
				
				<!-- Tier and Participants info -->
				<text x="${imageWidth / 2}" y="110" font-family="Arial, sans-serif" font-size="22" text-anchor="middle" fill="#333333">Tier: ${tierName}</text>
				<text x="${imageWidth / 2}" y="145" font-family="Arial, sans-serif" font-size="22" text-anchor="middle" fill="#333333">Participants: ${participantCount}</text>
				
				<!-- Instructions -->
				<text x="${imageWidth / 2}" y="195" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Show this Token ID at event entry for verification</text>
			</svg>`
		);
		
		// Resize event image to standard dimensions
		const resizedEventImage = await eventImage
			.resize(imageWidth, imageHeight, { fit: 'cover', position: 'center' })
			.toBuffer();
		
		// Composite everything together (no QR code needed)
		await sharp({
			create: {
				width: imageWidth,
				height: totalHeight,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 1 }
			}
		})
		.composite([
			{ input: resizedEventImage, top: 0, left: 0 },
			{ input: infoSection, top: imageHeight, left: 0 }
		])
		.png()
		.toFile(outputPath);
		
		const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
		return `${BASE_URL}/nft-images/${outputFilename}`;
	} catch (err) {
		console.error('NFT image creation error:', err);
		// Fallback to original image if composite fails
		return eventImageUrl;
	}
}

// Upload image endpoint
app.post('/upload', upload.single('image'), (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
		const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT || 4000}`;
		const imageUrl = `${BASE_URL}/uploads/${req.file.filename}`;
		return res.json({ ok: true, imageUrl, filename: req.file.filename });
	} catch (err) {
		console.error('upload error', err);
		return res.status(500).json({ error: 'upload failed', detail: String(err) });
	}
});

// Request a nonce for an address
app.post('/auth/nonce', (req, res) => {
	const { address } = req.body || {};
	if (!address) return res.status(400).json({ error: 'address required' });
	const addr = address.toLowerCase();
	const nonce = generateNonce();
	nonces.set(addr, nonce);
	return res.json({ nonce });
});

// Verify signature of the nonce
app.post('/auth/verify', (req, res) => {
	const { address, signature } = req.body || {};
	if (!address || !signature) return res.status(400).json({ error: 'address and signature required' });
	const addr = address.toLowerCase();
	const nonce = nonces.get(addr);
	if (!nonce) return res.status(400).json({ error: 'nonce not found for address' });
	const message = `Login nonce: ${nonce}`;
	try {
		const recovered = ethers.utils.verifyMessage(message, signature);
		if (recovered.toLowerCase() === addr) {
			// Authentication successful. For demo, we remove nonce so it can't be reused.
			nonces.delete(addr);
			return res.json({ ok: true, address: recovered });
		}
		return res.status(401).json({ ok: false, error: 'signature mismatch' });
	} catch (err) {
		console.error('verify error', err);
		return res.status(500).json({ error: 'verification failed' });
	}
});

// Mint NFT endpoint
// Expects body: { toAddress, eventName, time, location, tier, attendees, imageUrl }
app.post('/mint', async (req, res) => {
	const { toAddress, eventName, time, location, tier, attendees, imageUrl } = req.body || {};
	if (!toAddress || !eventName || !time || !location || !tier || !attendees || !imageUrl) {
		return res.status(400).json({ error: 'missing required fields' });
	}

	try {
		// Build metadata JSON following common NFT metadata schema
		const metadata = {
			name: `${eventName} - ${tier} Ticket`,
			description: `Ticket for ${eventName} (${tier})`,
			image: imageUrl,
			properties: {
				eventName,
				time,
				location,
				tier,
				attendees: Number(attendees)
			}
		};

		const metadataString = JSON.stringify(metadata, null, 2);

		// Prepare storage path (local fallback). In production, use IPFS / nft.storage and set NFT_STORAGE_KEY.
		const metadataDir = path.join(publicDir, 'metadata');
		if (!fs.existsSync(metadataDir)) fs.mkdirSync(metadataDir, { recursive: true });

		const id = Date.now().toString();
		const filename = `${id}.json`;
		const filepath = path.join(metadataDir, filename);
		fs.writeFileSync(filepath, metadataString, 'utf8');

		const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
		const tokenURI = `${BASE_URL}/metadata/${filename}`;

		// Compute a metadata hash to store on-chain for verification
		const metadataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(metadataString));

		// Mint on-chain by calling the deployed contract
		const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
		const PRIVATE_KEY = process.env.PRIVATE_KEY;
		const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';

		if (!CONTRACT_ADDRESS || !PRIVATE_KEY) {
			return res.status(500).json({ error: 'CONTRACT_ADDRESS and PRIVATE_KEY must be set in env to mint' });
		}

		// Minimal ABI for the mint function and tokenURI/metadataHash getters
		const ABI = [
			{
				"inputs": [
					{ "internalType": "address", "name": "to", "type": "address" },
					{ "internalType": "uint256", "name": "tokenId", "type": "uint256" },
					{ "internalType": "string", "name": "tokenURI", "type": "string" },
					{ "internalType": "string", "name": "metadataHash", "type": "string" }
				],
				"name": "mint",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{ "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "metadataHash", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
			{ "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "tokenURI", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }
		];

		const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
		const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
		const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

		// Choose a tokenId (simple approach: timestamp). For production you might want a sequential counter.
		const tokenId = BigInt(Date.now());

		const tx = await contract.mint(toAddress, tokenId, tokenURI, metadataHash);
		const receipt = await tx.wait();

		return res.json({ ok: true, tokenId: tokenId.toString(), tokenURI, metadataHash, txHash: receipt.transactionHash });
	} catch (err) {
		console.error('mint error', err);
		return res.status(500).json({ error: 'mint failed', detail: String(err) });
	}
});

// Create and store metadata JSON (no on-chain mint) - used by frontend prior to atomic buy
// Expects: { eventId, eventName, tierName, time, location, attendees, imageUrl, participantCount }
app.post('/metadata', async (req, res) => {
	try {
		const { eventId, eventName, tierName, time, location, attendees, imageUrl, extra, participantCount } = req.body;
		if (!eventId || !eventName || !tierName || !imageUrl) return res.status(400).json({ error: 'missing required metadata fields' });

		// Generate unique tokenId for this metadata
		const tokenId = Date.now().toString();
		
		const actualParticipants = participantCount || 1;
		
		// Create composite NFT image with QR code at the bottom (includes participant count)
		const nftImageUrl = await createNFTTicketImage(imageUrl, tokenId, eventName, tierName, actualParticipants);
		
		const metadata = {
			name: `${eventName} - ${tierName} Ticket`,
			description: `Ticket for ${eventName} (${tierName}) - Valid for ${actualParticipants} participant${actualParticipants > 1 ? 's' : ''}`,
			image: nftImageUrl, // Use the composite image with QR code
			attributes: [
				{ trait_type: "Event", value: eventName },
				{ trait_type: "Tier", value: tierName },
				{ trait_type: "Date", value: time || "TBA" },
				{ trait_type: "Location", value: location || "TBA" },
				{ trait_type: "Token ID", value: tokenId },
				{ trait_type: "Participants", value: String(actualParticipants) }
			],
			properties: {
				eventId,
				eventName,
				tierName,
				time: time || null,
				location: location || null,
				attendees: attendees ? Number(attendees) : 0,
				tokenId,
				participantCount: actualParticipants,
				extra: extra || null
			}
		};

		const metadataString = JSON.stringify(metadata, null, 2);
		const metadataDir = path.join(publicDir, 'metadata');
		if (!fs.existsSync(metadataDir)) fs.mkdirSync(metadataDir, { recursive: true });
		const id = Date.now().toString();
		const filename = `${id}.json`;
		const filepath = path.join(metadataDir, filename);
		fs.writeFileSync(filepath, metadataString, 'utf8');

		const BASE_URL = process.env.BASE_URL || `http://localhost:4000`;
		const tokenURI = `${BASE_URL}/metadata/${filename}`;
		const metadataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(metadataString));

		return res.json({ ok: true, tokenURI, metadataHash, filename, id, tokenId, nftImageUrl });
	} catch (err) {
		console.error('metadata create error', err);
		return res.status(500).json({ error: 'metadata creation failed', detail: String(err) });
	}
});

// QR Code verification endpoint for entry scanning
// Expects: { qrData } - the scanned QR code data
app.post('/verify-ticket', async (req, res) => {
	try {
		const { qrData } = req.body || {};
		if (!qrData) return res.status(400).json({ error: 'qrData required' });
		
		// Parse QR data
		let ticketData;
		try {
			ticketData = JSON.parse(qrData);
		} catch (e) {
			return res.status(400).json({ error: 'invalid QR code format', valid: false });
		}
		
		const { tokenId, eventName, tierName, verified } = ticketData;
		
		if (!tokenId) {
			return res.status(400).json({ error: 'missing tokenId in QR code', valid: false });
		}
		
		// In a production system, you would:
		// 1. Check if tokenId exists on-chain
		// 2. Verify ownership hasn't been transferred
		// 3. Check if ticket hasn't been used already (maintain used tickets DB)
		// 4. Verify the event is happening today/now
		
		// For now, basic validation
		if (verified === true && tokenId && eventName && tierName) {
			return res.json({
				valid: true,
				tokenId,
				eventName,
				tierName,
				message: 'Ticket verified successfully! Entry granted.',
				timestamp: new Date().toISOString()
			});
		}
		
		return res.json({
			valid: false,
			message: 'Invalid ticket',
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		console.error('verify ticket error', err);
		return res.status(500).json({ error: 'verification failed', detail: String(err), valid: false });
	}
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Backend server listening on http://localhost:${PORT}`);
	console.log(`Serving static files from ${publicDir}`);
});

// Simple events storage (persist to disk under backend/data/events.json)
const dataDir = path.join(__dirname, 'data');
const eventsFile = path.join(dataDir, 'events.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(eventsFile)) fs.writeFileSync(eventsFile, JSON.stringify([]), 'utf8');

function readEvents() {
	try {
		const raw = fs.readFileSync(eventsFile, 'utf8');
		return JSON.parse(raw);
	} catch (e) {
		return [];
	}
}

function writeEvents(events) {
	fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2), 'utf8');
}

// GET list of events
app.get('/events', (req, res) => {
	const events = readEvents();
	res.json(events);
});

// POST create event
app.post('/events', (req, res) => {
	const { name, description, category, image, date, endDate, venue, location, ticketTiers, organizerAddress, royaltyPercentage } = req.body || {};
	if (!name || !date || !venue || !location) return res.status(400).json({ error: 'missing required fields' });
	if (!organizerAddress) return res.status(400).json({ error: 'organizerAddress required' });
	
	// Validate royalty percentage (0-20%)
	let royalty = parseFloat(royaltyPercentage) || 5.0; // Default 5%
	if (royalty < 0) royalty = 0;
	if (royalty > 20) royalty = 20; // Max 20%
	
	const events = readEvents();
	const id = Date.now().toString();
	const ev = {
		id,
		name,
		description: description || '',
		category: category || '',
		image: image || '',
		date,
		endDate: endDate || null,
		venue,
		location,
		ticketTiers: ticketTiers || [],
		attendees: 0,
		price: ticketTiers && ticketTiers[0] ? ticketTiers[0].price : 'TBA',
		organizerAddress: organizerAddress.toLowerCase(),
		royaltyPercentage: royalty, // Store organizer's custom royalty %
		createdAt: new Date().toISOString(),
	};
	events.unshift(ev);
	writeEvents(events);
	return res.json(ev);
});

// GET events by organizer address
app.get('/events/organizer/:address', (req, res) => {
	const address = req.params.address?.toLowerCase();
	if (!address) return res.status(400).json({ error: 'address required' });
	const events = readEvents();
	const organizerEvents = events.filter(e => e.organizerAddress?.toLowerCase() === address);
	
	// Calculate statistics
	const totalEvents = organizerEvents.length;
	const activeEvents = organizerEvents.filter(e => new Date(e.date) > new Date()).length;
	const totalTicketsSold = organizerEvents.reduce((sum, e) => sum + (e.attendees || 0), 0);
	const totalTickets = organizerEvents.reduce((sum, e) => {
		if (e.ticketTiers && Array.isArray(e.ticketTiers)) {
			return sum + e.ticketTiers.reduce((tierSum, t) => tierSum + (t.total || 0), 0);
		}
		return sum;
	}, 0);
	
	// Calculate revenue (sum of ticket prices * attendees per event)
	let totalRevenue = 0;
	organizerEvents.forEach(e => {
		if (e.ticketTiers && Array.isArray(e.ticketTiers)) {
			e.ticketTiers.forEach(tier => {
				const priceStr = String(tier.price || '0').replace(/\s*ETH\s*/i, '').trim();
				const price = parseFloat(priceStr) || 0;
				const sold = (tier.total || 0) - (tier.available || 0);
				totalRevenue += price * sold;
			});
		}
	});

	return res.json({
		events: organizerEvents,
		stats: {
			totalEvents,
			activeEvents,
			totalTicketsSold,
			totalTickets,
			totalRevenue: totalRevenue.toFixed(4) + ' ETH'
		}
	});
});

// POST endpoint to reduce ticket availability after purchase
app.post('/tickets/purchase', (req, res) => {
	try {
		const { eventId, tierName, participantCount } = req.body;
		if (!eventId || !tierName) {
			return res.status(400).json({ error: 'eventId and tierName required' });
		}

		const actualParticipants = participantCount || 1;
		const events = readEvents();
		const eventIndex = events.findIndex(e => e.id === eventId);
		
		if (eventIndex === -1) {
			return res.status(404).json({ error: 'event not found' });
		}

		const event = events[eventIndex];
		const tierIndex = event.ticketTiers?.findIndex(t => t.name === tierName);
		
		if (tierIndex === -1 || tierIndex === undefined) {
			return res.status(404).json({ error: 'ticket tier not found' });
		}

		const tier = event.ticketTiers[tierIndex];
		
		if (tier.available <= 0) {
			return res.status(400).json({ error: 'no tickets available' });
		}

		// Reduce available count (1 NFT sold regardless of participant count)
		tier.available -= 1;
		// Increment attendees by actual participant count
		event.attendees = (event.attendees || 0) + actualParticipants;
		
		// Save updated events
		events[eventIndex] = event;
		writeEvents(events);

		return res.json({ 
			success: true, 
			event, 
			tier: {
				name: tier.name,
				available: tier.available,
				total: tier.total
			},
			participantCount: actualParticipants
		});
	} catch (err) {
		console.error('ticket purchase update error:', err);
		return res.status(500).json({ error: 'failed to update ticket availability' });
	}
});

// Verify QR code for entry - for organizers/staff
app.post('/verify-ticket', (req, res) => {
	try {
		const { tokenId } = req.body;
		if (!tokenId) {
			return res.status(400).json({ error: 'Token ID required' });
		}

		// Search for the ticket across all events
		let foundTicket = null;
		let foundEvent = null;

		for (const event of events) {
			const ticket = event.tickets?.find(t => t.tokenId === tokenId);
			if (ticket) {
				foundTicket = ticket;
				foundEvent = event;
				break;
			}
		}

		if (!foundTicket) {
			return res.status(404).json({ 
				success: false,
				valid: false,
				error: 'Ticket not found - Invalid Token ID' 
			});
		}

		// Return ticket information for organizer
		return res.json({
			success: true,
			valid: true,
			ticket: {
				tokenId: foundTicket.tokenId,
				eventName: foundEvent.name,
				tierName: foundTicket.tier,
				participants: foundTicket.participants || 1,
				purchaser: foundTicket.owner,
				purchaseDate: foundTicket.purchaseDate
			},
			message: `Valid ticket for ${foundTicket.participants || 1} participant${(foundTicket.participants || 1) > 1 ? 's' : ''}`
		});
	} catch (err) {
		console.error('ticket verification error:', err);
		return res.status(500).json({ error: 'failed to verify ticket' });
	}
});


