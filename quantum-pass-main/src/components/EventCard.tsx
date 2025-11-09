import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  attendees: number;
  price: string;
  category: string;
}

export const EventCard = ({
  id,
  title,
  date,
  location,
  image,
  attendees,
  price,
  category,
}: EventCardProps) => {
  // Fallback to placeholder if no valid image URL
  const imageUrl = image && image.startsWith('http') 
    ? image 
    : 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop';
  
  return (
    <Link to={`/events/${id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="glass-card-hover rounded-xl overflow-hidden group flex flex-col h-full"
      >
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60" />
          <Badge className="absolute top-4 right-4 bg-ether/90 backdrop-blur-sm border-0">
            {category}
          </Badge>
        </div>
        
        <div className="p-5 space-y-3 flex flex-col flex-1">
          <h3 className="text-xl font-bold group-hover:text-neon transition-colors line-clamp-2">
            {title}
          </h3>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neon" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neon" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neon" />
              <span>{attendees.toLocaleString()} attending</span>
            </div>
          </div>
          
          <div className="pt-3 flex items-center justify-between border-t border-border mt-auto">
            <span className="text-sm text-muted-foreground">Starting at</span>
            <span className="text-xl font-bold gradient-text">{price}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};