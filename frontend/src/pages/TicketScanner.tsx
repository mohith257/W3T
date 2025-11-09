import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Scan, CheckCircle2, XCircle, Users, Ticket, Calendar, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TicketScanner = () => {
  const [tokenId, setTokenId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!tokenId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Token ID",
        variant: "destructive"
      });
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:4000/verify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: tokenId.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          valid: true,
          ...data.ticket
        });
        toast({
          title: "✅ Valid Ticket",
          description: data.message
        });
      } else {
        setResult({
          valid: false,
          error: data.error || "Invalid ticket"
        });
        toast({
          title: "❌ Invalid Ticket",
          description: data.error || "Ticket verification failed",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setResult({
        valid: false,
        error: err.message || "Failed to verify ticket"
      });
      toast({
        title: "Error",
        description: "Failed to verify ticket",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  const handleClear = () => {
    setTokenId("");
    setResult(null);
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-32 pb-16 max-w-3xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-4 mb-12"
        >
          <div className="flex items-center justify-center gap-3">
            <Scan className="h-12 w-12 text-neon" />
            <h1 className="text-5xl font-bold">
              Ticket <span className="gradient-text">Scanner</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Verify tickets at event entry
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">Enter Token ID</CardTitle>
              <CardDescription>
                Enter the Token ID shown on the NFT ticket to verify authenticity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4 text-neon" />
                  Token ID:
                </label>
                <Input
                  type="text"
                  placeholder="Enter Token ID (e.g., 1, 2, 3...)"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                  className="glass-card border-neon/30 focus:border-neon text-lg font-mono h-12"
                />
                <p className="text-xs text-muted-foreground">
                  The Token ID is displayed prominently on the NFT ticket
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="hero"
                  className="flex-1"
                  size="lg"
                  onClick={handleScan}
                  disabled={scanning || !tokenId.trim()}
                >
                  <Scan className="mr-2 h-5 w-5" />
                  {scanning ? "Verifying..." : "Verify Ticket"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClear}
                  disabled={scanning}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {result && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            <Card className={`glass-card ${result.valid ? 'border-green-500/50' : 'border-red-500/50'}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {result.valid ? (
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  ) : (
                    <XCircle className="h-12 w-12 text-red-500" />
                  )}
                  <div>
                    <CardTitle className={result.valid ? "text-green-500" : "text-red-500"}>
                      {result.valid ? "✅ Valid Ticket" : "❌ Invalid Ticket"}
                    </CardTitle>
                    <CardDescription>
                      {result.valid ? "Allow entry" : "Do not allow entry"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              {result.valid && (
                <CardContent className="space-y-4">
                  <div className="glass-card p-4 rounded-lg bg-neon/5 border border-neon/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-5 w-5 text-neon" />
                        <span className="font-semibold">Token ID:</span>
                      </div>
                      <span className="font-mono font-bold text-2xl text-neon">{result.tokenId}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Ticket className="h-4 w-4" />
                        <span>Event</span>
                      </div>
                      <p className="font-bold text-lg">{result.eventName}</p>
                    </div>

                    <div className="glass-card p-4 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Tier</span>
                      </div>
                      <p className="font-bold text-lg">{result.tierName}</p>
                    </div>
                  </div>

                  <div className="glass-card p-6 rounded-lg bg-gradient-to-r from-neon/10 to-ether/10 border-2 border-neon/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-neon" />
                        <div>
                          <p className="text-sm text-muted-foreground">Participants</p>
                          <p className="text-3xl font-bold text-neon">{result.participants}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Allow entry for</p>
                        <p className="text-2xl font-bold">
                          {result.participants} {result.participants === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                    <p className="text-green-500 font-bold text-lg">
                      ✅ ALLOW {result.participants} {result.participants === 1 ? 'PERSON' : 'PEOPLE'} TO ENTER
                    </p>
                  </div>
                </CardContent>
              )}

              {!result.valid && (
                <CardContent>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-500 font-semibold">
                      Error: {result.error}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">📱 How to Scan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">How to verify tickets:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Ask attendee to show their NFT ticket</li>
                  <li>Look for the Token ID displayed at the bottom of the ticket</li>
                  <li>Enter the Token ID in the field above</li>
                  <li>Click "Verify Ticket" to check authenticity</li>
                  <li>Review event name, tier, and participant count</li>
                  <li>Allow entry based on the number shown</li>
                </ol>
              </div>

              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground mb-2">What you'll see:</p>
                <ul className="space-y-1 ml-2">
                  <li>✅ Event name and date</li>
                  <li>✅ Ticket tier (VIP, General, etc.)</li>
                  <li>✅ Number of participants allowed</li>
                  <li>✅ Green validation status</li>
                </ul>
              </div>

              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground mb-2">Security note:</p>
                <p className="text-xs">
                  Each Token ID is unique and verified against the blockchain. 
                  Invalid or non-existent IDs will be rejected immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketScanner;
