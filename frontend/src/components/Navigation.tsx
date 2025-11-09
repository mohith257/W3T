import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Ticket, Wallet, Scan } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { WalletModal } from "./WalletModal";
import WalletProfile from "./WalletProfile";

export const Navigation = () => {
  const location = useLocation();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  // initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('walletAddress');
      if (stored) setAddress(stored);
    } catch (e) {}
  }, []);

  useEffect(() => {
    const onConnect = (e: any) => setAddress(e?.detail?.address || localStorage.getItem('walletAddress'));
    const onDisconnect = () => setAddress(null);
    window.addEventListener('wallet:connected', onConnect as EventListener);
    window.addEventListener('wallet:disconnected', onDisconnect as EventListener);
    return () => {
      window.removeEventListener('wallet:connected', onConnect as EventListener);
      window.removeEventListener('wallet:disconnected', onDisconnect as EventListener);
    };
  }, []);
  
  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Ticket className="h-8 w-8 text-neon group-hover:rotate-12 transition-transform" />
              <div className="absolute inset-0 bg-neon blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-2xl font-bold gradient-text">W3T</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              to="/events" 
              className={`text-sm font-medium transition-colors ${
                location.pathname.includes('/events') 
                  ? 'text-neon' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Explore Events
            </Link>
            
            <Link 
              to="/organizer" 
              className={`text-sm font-medium transition-colors ${
                location.pathname.includes('/organizer') 
                  ? 'text-neon' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Organizers
            </Link>
            
            <Link 
              to="/scanner" 
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/scanner'
                  ? 'text-neon' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Scan Tickets
              </div>
            </Link>
            
            {!address ? (
              <Button 
                variant="hero" 
                size="sm" 
                className="gap-2"
                onClick={() => setWalletModalOpen(true)}
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <WalletProfile address={address} onSignOut={() => {
                try { localStorage.removeItem('walletAddress'); } catch (e) {}
                window.dispatchEvent(new CustomEvent('wallet:disconnected'));
                setAddress(null);
              }} />
            )}
          </div>
        </div>
      </motion.nav>
      
      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </>
  );
};