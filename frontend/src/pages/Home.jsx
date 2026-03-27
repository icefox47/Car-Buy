import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, Tag, Users, CheckCircle, ArrowRight } from 'lucide-react';
import HeroBackground from '../components/HeroBackground';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    make: '',
    type: '',
    condition: ''
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.make) params.append('make', searchParams.make);
    if (searchParams.type) params.append('type', searchParams.type);
    if (searchParams.condition) params.append('condition', searchParams.condition);
    
    navigate(`/wizard?${params.toString()}`);
  };

  const featureCards = [
    {
      icon: <ShieldCheck size={32} color="white" />,
      title: "Trusted Dealership Network",
      desc: "Get access to quality cars from our partner dealerships you can trust."
    },
    {
      icon: <Tag size={32} color="white" />,
      title: "Best Price Guarantee",
      desc: "We negotiate with dealers to get you the best possible deal."
    },
    {
      icon: <Users size={32} color="white" />,
      title: "Personal Help",
      desc: "Your own car expert guides you from start to finish."
    }
  ];

  const steps = [
    { title: "Tell Us What You Need", desc: "Fill our simple form about your dream car and budget." },
    { title: "We Find the Best Options", desc: "Our experts search the market for cars that match your needs." },
    { title: "We Connect You", desc: "Get direct contact with dealers who have your perfect car." }
  ];

  return (
    <div className="home-page">
      <Helmet>
        <title>CarFinder | Find Your Perfect Car Match</title>
        <meta name="description" content="Let us help you discover the ideal vehicle that matches your needs, preferences, and budget with CarFinder." />
      </Helmet>

      {/* Hero Section */}
      <section className="hero-section">
        <HeroBackground />
        <div className="container hero-container" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="display-4 fw-bold">
              Find Your <span className="title-gradient-accent">Perfect Car</span> Match
            </h1>
            <p className="lead">Let us help you discover the ideal vehicle that matches your needs, preferences, and budget.</p>
          </motion.div>

          <motion.div 
            className="hero-form-container glass-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="mb-4 text-center">Quick Search</h3>
            <form onSubmit={handleSearchSubmit}>
              <div className="form-group">
                <select 
                  className="form-control mb-3" 
                  value={searchParams.make} 
                  onChange={(e) => setSearchParams({...searchParams, make: e.target.value})}
                  required
                >
                  <option value="">Select Make</option>
                  <option value="toyota">Toyota</option>
                  <option value="honda">Honda</option>
                  <option value="ford">Ford</option>
                  <option value="bmw">BMW</option>
                  <option value="mercedes">Mercedes</option>
                  <option value="audi">Audi</option>
                </select>
              </div>
              <div className="form-group">
                <select 
                  className="form-control mb-3" 
                  value={searchParams.type} 
                  onChange={(e) => setSearchParams({...searchParams, type: e.target.value})}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="coupe">Coupe</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div className="form-group">
                <select 
                  className="form-control mb-4" 
                  value={searchParams.condition} 
                  onChange={(e) => setSearchParams({...searchParams, condition: e.target.value})}
                  required
                >
                  <option value="">Select Condition</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100 search-btn">
                Search Cars <Search size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Why Choose Us</h2>
          <div className="features-grid">
            {featureCards.map((feat, idx) => (
              <motion.div 
                key={idx} 
                className="feature-card glass-panel"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -10 }}
              >
                <div className="icon-circle">
                  {feat.icon}
                </div>
                <h4>{feat.title}</h4>
                <p className="text-secondary">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container text-center">
          <h2 className="section-title mb-5">How It Works</h2>
          <div className="steps-grid">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx} 
                className="step-item"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
              >
                <div className="step-number">{idx + 1}</div>
                <h4>{step.title}</h4>
                <p className="text-secondary">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-5 pt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <button className="btn btn-primary cta-btn" onClick={() => navigate('/wizard')}>
              Start Your Journey <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer text-center">
        <div className="container">
          <p className="text-secondary">&copy; 2026 CarFinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
