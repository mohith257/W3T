import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-concert.jpg";

const Index = () => {
  return (
    <div className="min-h-screen gradient-hero">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Concert" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-void/50 via-void/80 to-void" />
        </div>
        
        <div className="container mx-auto px-4 z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block glass-card px-4 py-2 rounded-full"
            >
              <span className="text-sm text-neon font-medium">
                The Future of Ticketing is Here
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Own Your Experience with{" "}
              <span className="gradient-text">NFT Tickets</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Secure, verifiable, and tradeable event tickets powered by blockchain technology. 
              Say goodbye to fraud and hello to true ownership.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events">
                <Button variant="hero" size="lg" className="gap-2 group">
                  Explore Events
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-10 w-32 h-32 bg-neon/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-10 w-40 h-40 bg-ether/10 rounded-full blur-3xl"
          />
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">W3T</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of event ticketing with cutting-edge Web3 technology
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Fraud-Proof Security",
                description: "Every ticket is an NFT on the blockchain, making counterfeiting impossible"
              },
              {
                icon: Zap,
                title: "Instant Transfers",
                description: "Send tickets to friends or sell on the secondary market with built-in royalties"
              },
              {
                icon: Globe,
                title: "Global Access",
                description: "Buy tickets from anywhere in the world with crypto or traditional payment"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="glass-card-hover p-8 rounded-2xl text-center space-y-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon/20 to-ether/20 neon-glow">
                  <feature.icon className="h-8 w-8 text-neon" />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-3xl text-center space-y-6 neon-glow"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to <span className="gradient-text">Experience</span> the Future?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of event-goers who have already made the switch to NFT ticketing
            </p>
            <Link to="/events">
              <Button variant="hero" size="lg" className="gap-2">
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;