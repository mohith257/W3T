import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Shield, TrendingUp } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MintModal } from "@/components/MintModal";
import event1 from "@/assets/event-1.jpg";
import nftTicket from "@/assets/nft-ticket.jpg";

const EventDetail = () => {
  const { id } = useParams();
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  
  const [eventData, setEventData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Default ticket tiers as fallback if event does not provide tiers
  const defaultTicketTiers = [
    {
      name: "General Admission",
      price: "0.05 ETH",
      usd: "$185",
      available: 1200,
      total: 3000,
      features: ["Event Entry", "Digital NFT Ticket", "Secondary Market Access"]
    },
    {
      name: "VIP Experience",
      price: "0.15 ETH",
      usd: "$555",
      available: 80,
      total: 200,
      features: ["Priority Entry", "VIP Lounge Access", "Exclusive NFT Art", "Meet & Greet Pass"]
    },
    {
      name: "Platinum Backstage",
      price: "0.5 ETH",
      usd: "$1,850",
      available: 5,
      total: 50,
      features: ["All VIP Benefits", "Backstage Access", "Limited Edition NFT", "Premium Merchandise"]
    }
  ];

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/events');
        if (!res.ok) throw new Error('failed to fetch events');
        const list = await res.json();
        const found = list.find((e: any) => String(e.id) === String(id));
        if (found) setEventData(found);
      } catch (err) {
        console.error('load event error', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);
  
  return (
    <div className="min-h-screen gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Event Image */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="relative rounded-3xl overflow-hidden glass-card neon-glow">
              <img
                src={eventData?.image || event1}
                alt={eventData?.name || 'Event'}
                className="w-full aspect-video object-cover"
              />
              <Badge className="absolute top-6 left-6 bg-ether/90 backdrop-blur-sm border-0 text-lg px-4 py-2">
                {eventData?.category || 'Music'}
              </Badge>
            </div>
            
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-neon" />
                Verified NFT Tickets
              </h3>
              <img src={nftTicket} alt="NFT Preview" className="w-full rounded-xl" />
              <p className="text-sm text-muted-foreground">
                Each ticket is a unique NFT on Ethereum, ensuring authenticity and enabling secure resale with artist royalties.
              </p>
            </div>
          </motion.div>
          
          {/* Event Details */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl font-bold">
                {eventData ? eventData.name : (loading ? 'Loading...' : 'Neon Nights: Electronic Music Festival')}
              </h1>
              <p className="text-xl text-muted-foreground">
                {eventData ? eventData.description : 'Join us for an unforgettable night of electronic music featuring world-class DJs and cutting-edge production.'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-xl space-y-2">
                <Calendar className="h-5 w-5 text-neon" />
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-semibold">{eventData ? new Date(eventData.date).toLocaleDateString() : 'March 15, 2025'}</div>
                </div>
              </div>
              
              <div className="glass-card p-4 rounded-xl space-y-2">
                <Clock className="h-5 w-5 text-neon" />
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-semibold">{eventData ? new Date(eventData.date).toLocaleTimeString() : '8:00 PM PST'}</div>
                </div>
              </div>
              
              <div className="glass-card p-4 rounded-xl space-y-2">
                <MapPin className="h-5 w-5 text-neon" />
                <div>
                  <div className="text-sm text-muted-foreground">Venue</div>
                  <div className="font-semibold">{eventData ? eventData.venue : 'Crypto Arena'}</div>
                </div>
              </div>
              
              <div className="glass-card p-4 rounded-xl space-y-2">
                <Users className="h-5 w-5 text-neon" />
                <div>
                  <div className="text-sm text-muted-foreground">Attending</div>
                  <div className="font-semibold">{eventData ? ((eventData.attendees || 0) + ' people') : '5,000+ people'}</div>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-neon" />
                <span className="font-semibold">Live Stats</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Tickets</span>
                  <span className="font-semibold">{eventData && eventData.ticketTiers ? eventData.ticketTiers.reduce((acc:any, t:any)=> acc + (t.total || 0), 0) : '3,250'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tickets Sold</span>
                  <span className="font-semibold gradient-text">{eventData ? ((eventData.attendees || 0) + ' (' + (eventData.ticketTiers ? Math.round(((eventData.attendees||0) / (eventData.ticketTiers.reduce((acc:any,t:any)=> acc + (t.total||0),0) || 1)) * 100) : '60') + '%)') : '1,965 (60%)'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Floor Price</span>
                  <span className="font-semibold">{eventData && eventData.ticketTiers && eventData.ticketTiers[0] ? eventData.ticketTiers[0].price : '0.05 ETH'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Ticket Tiers */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold">
              Choose Your <span className="gradient-text">Experience</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Select your ticket tier and mint your NFT
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {(eventData ? eventData.ticketTiers : defaultTicketTiers).map((tier:any, index:number) => (
              <motion.div
                key={tier.name}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`glass-card-hover p-8 rounded-2xl space-y-6 ${
                  index === 1 ? 'neon-glow border-neon' : ''
                }`}
              >
                {index === 1 && (
                  <Badge className="bg-neon text-void font-bold">MOST POPULAR</Badge>
                )}
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold gradient-text">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.usd}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-semibold">{tier.available} / {tier.total}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-neon to-ether transition-all"
                      style={{ width: `${(tier.available / (tier.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {(tier.features || []).map((feature:any) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-neon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={index === 1 ? "hero" : "outline"}
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    setSelectedTier(tier);
                    setMintModalOpen(true);
                  }}
                >
                  Mint NFT Ticket
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {selectedTier && (
        <MintModal 
          open={mintModalOpen} 
          onOpenChange={setMintModalOpen}
          ticketTier={selectedTier}
          eventId={eventData?.id}
          eventData={eventData}
        />
      )}
    </div>
  );
};

export default EventDetail;