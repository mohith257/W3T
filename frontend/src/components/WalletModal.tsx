import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const wallets = [
  {
    name: "MetaMask",
    description: "Connect using MetaMask wallet",
    icon: "🦊"
  },
  {
    name: "Phantom",
    description: "Connect using Phantom wallet",
    icon: "👻"
  },
  {
    name: "WalletConnect",
    description: "Scan with WalletConnect",
    icon: "🔗"
  },
  {
    name: "Coinbase Wallet",
    description: "Connect using Coinbase",
    icon: "💼"
  }
];

export const WalletModal = ({ open, onOpenChange }: WalletModalProps) => {
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">Connect Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose your preferred wallet to continue
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {wallets.map((wallet, index) => (
            <motion.div
              key={wallet.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-4 h-auto py-4 glass-card-hover"
                onClick={async () => {
                  if (wallet.name !== 'MetaMask') {
                    toast({ title: `${wallet.name} not supported`, description: 'Only MetaMask is supported in this demo' });
                    return;
                  }

                  try {
                    const eth = (window as any).ethereum;
                    if (!eth) {
                      toast({ title: 'MetaMask not found', description: 'Please install MetaMask extension' });
                      return;
                    }

                    // Request accounts
                    const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
                    const address = accounts && accounts[0];
                    if (!address) throw new Error('No account returned');

                    // Request nonce from backend
                    const nonceResp = await fetch('http://localhost:4000/auth/nonce', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ address })
                    });
                    if (!nonceResp.ok) {
                      const txt = await nonceResp.text();
                      throw new Error('Failed to get nonce: ' + txt);
                    }
                    const { nonce } = await nonceResp.json();
                    const message = `Login nonce: ${nonce}`;

                    // Ask MetaMask to sign
                    const signature: string = await eth.request({ method: 'personal_sign', params: [message, address] });

                    // Verify signature with backend
                    const verifyResp = await fetch('http://localhost:4000/auth/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ address, signature })
                    });
                    if (!verifyResp.ok) {
                      const txt = await verifyResp.text();
                      throw new Error('Verification failed: ' + txt);
                    }
                    const result = await verifyResp.json();

                    if (result.ok) {
                      toast({ title: 'Wallet connected', description: `${address}` });
                      onOpenChange(false);
                      // store address locally for demo
                      localStorage.setItem('walletAddress', address);
                      // emit global event so other components can react
                      window.dispatchEvent(new CustomEvent('wallet:connected', { detail: { address } }));
                    } else {
                      throw new Error('Signature verification failed');
                    }
                  } catch (err: any) {
                    console.error(err);
                    toast({ title: 'Connection error', description: err?.message || String(err) });
                  }
                }}
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground">{wallet.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
};