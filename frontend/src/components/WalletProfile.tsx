import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, LogOut } from "lucide-react";

interface WalletProfileProps {
  address: string;
  onSignOut: () => void;
}

function shortAddress(addr: string) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export const WalletProfile: React.FC<WalletProfileProps> = ({ address, onSignOut }) => {
  const [open, setOpen] = React.useState(false);

  // placeholder data; in future fetch from backend or chain
  const walletType = 'MetaMask';
  const tickets: Array<{ id: string; name: string }> = [];
  const nfts: Array<{ id: string; name: string }> = [];

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => setOpen((s) => !s)}>
        <span className="font-mono text-sm">{shortAddress(address)}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Connected as</div>
                <div className="font-medium">{shortAddress(address)}</div>
                <div className="text-xs text-muted-foreground">{walletType}</div>
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={() => { onSignOut(); setOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-sm font-semibold mb-2">Tickets</div>
              {tickets.length === 0 ? (
                <div className="text-xs text-muted-foreground">No tickets purchased yet</div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} className="text-sm">{t.name}</div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-sm font-semibold mb-2">NFTs</div>
              {nfts.length === 0 ? (
                <div className="text-xs text-muted-foreground">No NFTs</div>
              ) : (
                nfts.map((n) => (
                  <div key={n.id} className="text-sm">{n.name}</div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WalletProfile;
