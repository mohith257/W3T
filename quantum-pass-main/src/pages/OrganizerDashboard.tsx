import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Ticket, 
  DollarSign,
  Calendar,
  Eye,
  Edit,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const OrganizerDashboard = () => {
  const { toast } = useToast();
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [organizerAddress, setOrganizerAddress] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrganizerData() {
      setLoading(true);
      try {
        // Get connected wallet address
        let address = localStorage.getItem('walletAddress');
        
        // Fallback: try parsing from 'wallet' key (if stored as JSON)
        if (!address) {
          const walletData = localStorage.getItem('wallet');
          if (walletData) {
            try {
              const wallet = JSON.parse(walletData);
              address = wallet.address;
            } catch (e) {
              console.error('parse wallet error', e);
            }
          }
        }
        
        if (!address) {
          toast({ title: 'Not connected', description: 'Please connect your wallet to view your dashboard.' });
          setLoading(false);
          return;
        }

        setOrganizerAddress(address);

        // Fetch organizer's events and stats
        const baseApi = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const resp = await fetch(`${baseApi}/events/organizer/${address}`);
        if (!resp.ok) throw new Error('failed to fetch organizer data');
        
        const data = await resp.json();
        setOrganizerEvents(data.events || []);
        setStats(data.stats || {});
      } catch (err: any) {
        console.error('load organizer data error', err);
        toast({ title: 'Load failed', description: err?.message || String(err) });
      } finally {
        setLoading(false);
      }
    }
    loadOrganizerData();
  }, [toast]);

  const statsCards = [
    {
      title: "Total Revenue",
      value: stats?.totalRevenue || "0 ETH",
      change: "+0%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Active Events",
      value: String(stats?.activeEvents || 0),
      change: `${stats?.totalEvents || 0} total`,
      icon: Calendar,
      trend: "up"
    },
    {
      title: "Tickets Sold",
      value: String(stats?.totalTicketsSold || 0),
      change: `/${stats?.totalTickets || 0} total`,
      icon: Ticket,
      trend: "up"
    },
    {
      title: "Total Events",
      value: String(stats?.totalEvents || 0),
      change: "",
      icon: Users,
      trend: "up"
    }
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-5xl font-bold mb-2">
              Organizer <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your events and track performance
            </p>
          </div>
          
          <Link to="/organizer/create">
            <Button variant="hero" size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Event
            </Button>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${
                      stat.trend === 'up' ? 'from-neon/20 to-ether/20' : 'from-destructive/20 to-destructive/10'
                    }`}>
                      <stat.icon className="h-6 w-6 text-neon" />
                    </div>
                    <span className="text-sm text-validation-green font-semibold">
                      {stat.change}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="events" className="space-y-8">
            <TabsList className="glass-card border-border h-auto p-1">
              <TabsTrigger value="events" className="data-[state=active]:bg-neon/20">
                <Calendar className="h-4 w-4 mr-2" />
                My Events
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-neon/20"
                onClick={() => toast({ title: 'Coming Soon', description: 'Analytics dashboard will be available soon!' })}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="revenue" 
                className="data-[state=active]:bg-neon/20"
                onClick={() => toast({ title: 'Coming Soon', description: 'Revenue dashboard will be available soon!' })}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Revenue
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-6">
              {loading ? (
                <Card className="glass-card border-border">
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">Loading your events...</p>
                  </CardContent>
                </Card>
              ) : organizerEvents.length === 0 ? (
                <Card className="glass-card border-border">
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first event to get started</p>
                    <Link to="/organizer/create">
                      <Button variant="hero" className="gap-2">
                        <Plus className="h-5 w-5" />
                        Create Event
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                organizerEvents.map((event, index) => {
                  const totalTickets = event.ticketTiers?.reduce((sum: number, t: any) => sum + (t.total || 0), 0) || 0;
                  const soldTickets = event.ticketTiers?.reduce((sum: number, t: any) => sum + ((t.total || 0) - (t.available || 0)), 0) || 0;
                  const eventRevenue = event.ticketTiers?.reduce((sum: number, t: any) => {
                    const priceStr = String(t.price || '0').replace(/\s*ETH\s*/i, '').trim();
                    const price = parseFloat(priceStr) || 0;
                    const sold = (t.total || 0) - (t.available || 0);
                    return sum + (price * sold);
                  }, 0) || 0;
                  const isActive = new Date(event.date) > new Date();
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card-hover border-border">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-2xl font-bold">{event.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  isActive ? 'bg-neon/20 text-neon' : 'bg-muted text-muted-foreground'
                                }`}>
                                  {isActive ? 'ACTIVE' : 'PAST'}
                                </span>
                              </div>
                              
                              <div className="grid md:grid-cols-4 gap-6">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                                  <p className="font-semibold">{new Date(event.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Tickets Sold</p>
                                  <p className="font-semibold">
                                    {soldTickets} / {totalTickets}
                                  </p>
                                  <div className="h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-neon to-ether"
                                      style={{ width: `${totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0}%` }}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                                  <p className="font-bold gradient-text text-lg">{eventRevenue.toFixed(4)} ETH</p>
                                </div>
                                <div className="flex items-end gap-2">
                                  <Link to={`/events/${event.id}`}>
                                    <Button variant="outline" size="sm" className="gap-2">
                                      <Eye className="h-4 w-4" />
                                      View
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="glass-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl gradient-text">Performance Analytics</CardTitle>
                  <CardDescription>Track your events' performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-24 w-24 text-neon mx-auto mb-6 opacity-50" />
                  <h3 className="text-3xl font-bold mb-4 gradient-text">Coming Soon</h3>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Advanced analytics and performance metrics will be available soon. Track conversion rates, audience insights, and detailed event statistics.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <Card className="glass-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl gradient-text">Revenue Overview</CardTitle>
                  <CardDescription>Track your earnings and payouts</CardDescription>
                </CardHeader>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-24 w-24 text-neon mx-auto mb-6 opacity-50" />
                  <h3 className="text-3xl font-bold mb-4 gradient-text">Coming Soon</h3>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Revenue tracking and payout management will be available soon. Monitor your earnings, view transaction history, and manage withdrawals from your events.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;