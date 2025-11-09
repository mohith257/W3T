import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface EventItem {
  id: string;
  name?: string;
  title?: string;
  date: string;
  location: string;
  image: string;
  attendees: number;
  price?: string;
  category?: string;
}

const Events = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch('http://localhost:4000/events');
        if (!resp.ok) throw new Error('failed to load events');
        const data = await resp.json();
        if (mounted) setEvents(data.map((e: any) => ({
          id: e.id,
          title: e.name || e.title,
          date: e.date,
          location: e.location,
          image: e.image || '',
          attendees: e.attendees || 0,
          price: e.price || 'TBA',
          category: e.category || ''
        })));
      } catch (err) {
        console.error('load events error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 space-y-6"
        >
          <h1 className="text-5xl font-bold">
            Discover <span className="gradient-text">Amazing Events</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Browse through verified events powered by blockchain technology
          </p>
          
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for events, artists, or venues..."
              className="pl-12 h-14 glass-card border-border text-lg"
            />
          </div>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <EventCard
                id={event.id}
                title={event.title || event.name || 'Event'}
                date={event.date}
                location={event.location}
                image={event.image}
                attendees={event.attendees}
                price={event.price}
                category={event.category}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;