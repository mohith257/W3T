import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Calendar,
  MapPin,
  Image as ImageIcon,
  Ticket,
  Plus,
  Trash2,
  ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CreateEvent = () => {
  const { toast } = useToast();
  const [ticketTiers, setTicketTiers] = useState([
    { name: "General Admission", price: "0.05", supply: "1000" }
  ]);
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [endDateValue, setEndDateValue] = useState('');
  const [venue, setVenue] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState('5'); // Default 5%
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const resp = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData
      });

      if (!resp.ok) throw new Error('Upload failed');
      
      const data = await resp.json();
      setImageUrl(data.imageUrl);
      toast({ title: 'Image uploaded', description: 'Your event image has been uploaded successfully.' });
    } catch (err: any) {
      console.error('upload error', err);
      toast({ title: 'Upload failed', description: err?.message || String(err) });
    } finally {
      setUploadingImage(false);
    }
  };

  const addTicketTier = () => {
    setTicketTiers([...ticketTiers, { name: "", price: "", supply: "" }]);
  };

  const removeTicketTier = (index: number) => {
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Get connected wallet address
      let organizerAddress = localStorage.getItem('walletAddress');
      
      // Fallback: try parsing from 'wallet' key (if stored as JSON)
      if (!organizerAddress) {
        const walletData = localStorage.getItem('wallet');
        if (walletData) {
          try {
            const wallet = JSON.parse(walletData);
            organizerAddress = wallet.address;
          } catch (e) {
            console.error('parse wallet error', e);
          }
        }
      }
      
      if (!organizerAddress) {
        toast({ title: 'Wallet not connected', description: 'Please connect your wallet to create an event.' });
        setIsSubmitting(false);
        return;
      }

      const formattedTiers = ticketTiers.map((t: any) => ({
        name: t.name || 'General Admission',
        price: t.price ? `${t.price} ETH` : 'TBA',
        usd: (t as any).usd || '',
        total: Number(t.supply || 0),
        available: Number(t.supply || 0),
        features: (t as any).features || []
      }));

      const payload = {
        name: eventName,
        description,
        category,
        image: imageUrl,
        date: dateValue,
        endDate: endDateValue,
        venue,
        location: locationValue,
        ticketTiers: formattedTiers,
        organizerAddress,
        royaltyPercentage: parseFloat(royaltyPercentage) || 5.0 // Add royalty percentage
      };
      const resp = await fetch('http://localhost:4000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error(await resp.text());
      const created = await resp.json();
      toast({ title: 'Event Created!', description: 'Your event has been successfully created and is now live.' });
  try { navigate('/events'); } catch (e) { window.location.href = '/events'; }
    } catch (err: any) {
      console.error('create event error', err);
      toast({ title: 'Create failed', description: err?.message || String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Link to="/organizer">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <h1 className="text-5xl font-bold mb-2">
            Create <span className="gradient-text">New Event</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Set up your NFT ticketed event in minutes
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-2xl gradient-text">Event Details</CardTitle>
                <CardDescription>Basic information about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name *</Label>
                  <Input
                    id="eventName"
                    placeholder="e.g., Neon Nights Festival"
                    className="glass-card border-border"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    className="glass-card border-border min-h-32"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Music, Festival"
                      className="glass-card border-border"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Event Image</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="image"
                            placeholder="https://... or upload below"
                            className="glass-card border-border pl-10"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="glass-card border-border"
                        />
                        {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                      </div>
                      {imageUrl && (
                        <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Date & Location */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-2xl gradient-text">Date & Location</CardTitle>
                <CardDescription>When and where is your event?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="datetime-local"
                        className="glass-card border-border pl-10"
                        required
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="datetime-local"
                        className="glass-card border-border pl-10"
                        value={endDateValue}
                        onChange={(e) => setEndDateValue(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue Name *</Label>
                  <Input
                    id="venue"
                    placeholder="e.g., Crypto Arena"
                    className="glass-card border-border"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Full Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="123 Main St, City, State"
                      className="glass-card border-border pl-10"
                      required
                      value={locationValue}
                      onChange={(e) => setLocationValue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="royalty">Resale Royalty Percentage *</Label>
                  <div className="relative">
                    <Input
                      id="royalty"
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      placeholder="5"
                      className="glass-card border-border"
                      required
                      value={royaltyPercentage}
                      onChange={(e) => setRoyaltyPercentage(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You'll earn this percentage on every ticket resale (0-20%, recommended 5-10%)
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ticket Tiers */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl gradient-text">Ticket Tiers</CardTitle>
                    <CardDescription>Configure your ticket pricing</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTicketTier}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Tier
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketTiers.map((tier, index) => (
                  <div
                    key={index}
                    className="glass-card p-4 rounded-xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-neon" />
                        <span className="font-semibold">Tier {index + 1}</span>
                      </div>
                      {ticketTiers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTicketTier(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Tier Name"
                        value={tier.name}
                        onChange={(e) => {
                          const newTiers = [...ticketTiers];
                          newTiers[index].name = e.target.value;
                          setTicketTiers(newTiers);
                        }}
                        className="glass-card border-border"
                      />
                      <Input
                        placeholder="Price (ETH)"
                        type="number"
                        step="0.001"
                        value={tier.price}
                        onChange={(e) => {
                          const newTiers = [...ticketTiers];
                          newTiers[index].price = e.target.value;
                          setTicketTiers(newTiers);
                        }}
                        className="glass-card border-border"
                      />
                      <Input
                        placeholder="Supply"
                        type="number"
                        value={tier.supply}
                        onChange={(e) => {
                          const newTiers = [...ticketTiers];
                          newTiers[index].supply = e.target.value;
                          setTicketTiers(newTiers);
                        }}
                        className="glass-card border-border"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <Button type="submit" variant="hero" size="lg" className="flex-1">
              Create Event & Deploy NFT
            </Button>
            <Link to="/organizer" className="flex-1">
              <Button type="button" variant="outline" size="lg" className="w-full">
                Cancel
              </Button>
            </Link>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;