import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { BrowserProvider, Contract, parseEther, keccak256, toUtf8Bytes } from 'ethers';
import { useToast } from "@/hooks/use-toast";

interface MintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketTier: {
    name: string;
    price: string; // e.g. "0.05 ETH" or "0.05"
    usd: string;
    maxParticipants?: number;
  };
  eventId?: string | number;
  eventData?: any;
}

export const MintModal = ({ open, onOpenChange, ticketTier, eventId, eventData }: MintModalProps) => {
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const { toast } = useToast();
  
  const handleMint = async () => {
    // Validate participant count
    if (!participantCount || participantCount < 1) {
      toast({ 
        title: 'Invalid participant count', 
        description: 'Please enter at least 1 participant',
        variant: 'destructive'
      });
      return;
    }
    
    setMinting(true);
    try {
      // create metadata on the backend so we have a tokenURI and metadataHash
      const baseApi = (import.meta.env.VITE_API_URL || 'http://localhost:4000');
      const metaResp = await fetch(baseApi + '/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventId || (eventData && eventData.id),
          eventName: eventData?.name || 'Event',
          tierName: ticketTier.name,
          time: eventData?.date,
          location: eventData?.venue,
          attendees: eventData?.attendees || 0,
          imageUrl: eventData?.image || '',
          participantCount: participantCount
        })
      });
      if (!metaResp.ok) throw new Error('failed to create metadata');
      const meta = await metaResp.json();

      // call marketplace contract to buy and mint
      const eth = (window as any).ethereum;
      if (!eth) throw new Error('wallet not available');
      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();

      const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS;
      if (!marketplaceAddress) throw new Error('MARKETPLACE_ADDRESS not configured');

      // Updated ABI to include royaltyBps parameter
      const abi = ["function buyAndMint(address organizer,uint256 tokenId,string tokenURI,string metadataHash,uint256 royaltyBps) payable"];
      const contract = new Contract(marketplaceAddress, abi, signer);

      // price parsing: allow strings like "0.05 ETH" or "0.05"
      let priceStr = String(ticketTier.price || '0');
      priceStr = priceStr.replace(/\s*ETH\s*/i, '').trim();
      const basePriceWei = parseEther(priceStr || '0');
      
      // Multiply price by participant count
      const priceWei = basePriceWei * BigInt(participantCount);

      // choose a tokenId — use timestamp to avoid collisions (for production use sequential id or let contract assign)
      const tokenId = BigInt(Date.now()).toString();

      // organizer address must be present on eventData
      const organizer = eventData?.organizerAddress || eventData?.organizer || eventData?.owner;
      if (!organizer) throw new Error('organizer address not found for event');

      // Convert royalty percentage to basis points (5% = 500, 10% = 1000, etc.)
      const royaltyBps = Math.floor((eventData?.royaltyPercentage || 5.0) * 100);

      const tx = await contract.buyAndMint(organizer, tokenId, meta.tokenURI, meta.metadataHash, royaltyBps, { value: priceWei });
      await tx.wait();

      // Update ticket availability after successful mint
      try {
        const updateResp = await fetch(baseApi + '/tickets/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: eventId || (eventData && eventData.id),
            tierName: ticketTier.name,
            participantCount: participantCount
          })
        });
        
        if (!updateResp.ok) {
          console.warn('Failed to update ticket availability, but NFT was minted');
        }
      } catch (updateErr) {
        console.warn('Error updating ticket availability:', updateErr);
        // Don't fail the whole transaction if ticket update fails
      }

      setMinted(true);
      toast({ title: 'Minted', description: 'Your NFT was minted successfully.' });
      setTimeout(() => {
        setMinted(false);
        onOpenChange(false);
        // Refresh the page to show updated ticket count
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('buy+mint error', err);
      toast({ title: 'Mint failed', description: err?.message || String(err) });
    } finally {
      setMinting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border sm:max-w-md">
        {!minted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl gradient-text">Mint NFT Ticket</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Confirm your purchase to mint your NFT ticket
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              <div className="glass-card p-6 rounded-xl space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket Tier</span>
                  <span className="font-semibold">{ticketTier.name}</span>
                </div>
                
                {/* Participant Count Input - No limit */}
                <div className="space-y-2 border-2 border-neon/30 rounded-lg p-4 bg-neon/5">
                  <Label htmlFor="participantCount" className="flex items-center gap-2 text-base font-semibold">
                    <Users className="h-5 w-5 text-neon" />
                    How many participants? *
                  </Label>
                  <Input
                    id="participantCount"
                    type="number"
                    min="1"
                    value={participantCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setParticipantCount(Math.max(1, val));
                    }}
                    className="glass-card border-border text-lg font-bold text-center"
                    placeholder="Enter number of people"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    💡 Total price = {ticketTier.price} × {participantCount} = <span className="font-bold text-neon">{(parseFloat(ticketTier.price.replace(/\s*ETH\s*/i, '')) * participantCount).toFixed(4)} ETH</span>
                  </p>
                </div>
                
                <div className="border-t border-border pt-4"></div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price (per person)</span>
                  <div className="text-right">
                    <div className="font-semibold">{ticketTier.price}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center bg-gradient-to-r from-ether/20 to-neon/20 rounded-lg p-4 border-2 border-ether/30">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-ether" />
                    <span className="font-semibold">× {participantCount} participant{participantCount > 1 ? 's' : ''}</span>
                  </div>
                  <span className="font-bold text-xl text-ether">
                    {(parseFloat(ticketTier.price.replace(/\s*ETH\s*/i, '')) * participantCount).toFixed(4)} ETH
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gas Fee (est.)</span>
                  <span className="font-semibold">~$5</span>
                </div>
                
                <div className="border-t-2 border-border pt-4 flex justify-between text-xl">
                  <span className="font-bold">Total Payment</span>
                  <span className="font-bold gradient-text text-2xl">
                    {(parseFloat(ticketTier.price.replace(/\s*ETH\s*/i, '')) * participantCount).toFixed(4)} ETH
                  </span>
                </div>
              </div>
              
              <Button
                variant="hero"
                className="w-full"
                size="lg"
                onClick={handleMint}
                disabled={minting}
              >
                {minting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Minting NFT...
                  </>
                ) : (
                  <>
                    Pay {(parseFloat(ticketTier.price.replace(/\s*ETH\s*/i, '')) * participantCount).toFixed(4)} ETH & Mint
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Your NFT ticket for {participantCount} participant{participantCount > 1 ? 's' : ''} will be minted to your wallet
              </p>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle2 className="h-20 w-20 text-neon mx-auto" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold gradient-text">Success!</h3>
              <p className="text-muted-foreground">
                Your NFT ticket has been minted successfully
              </p>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};