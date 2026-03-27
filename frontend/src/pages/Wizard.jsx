import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import CarCard from '../components/CarCard';
import './Wizard.css';

const stepsConfig = [
  { id: 'make', title: "What's your preferred car make?", type: 'select', 
    options: ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi'] },
  { id: 'type', title: "What type of vehicle are you looking for?", type: 'select', 
    options: ['sedan', 'suv', 'truck', 'coupe', 'hatchback', 'van'] },
  { id: 'condition', title: "What's the condition of the car?", type: 'select', 
    options: ['new', 'used'] },
  { id: 'year', title: "What's the year of the car?", type: 'select', 
    options: ['2025', '2024', '2023', '2022'] },
  { id: 'kms_driven', title: "How many kilometers has the car been driven?", type: 'select', 
    options: ['below_25000', '25000_50000', '50000_75000', '75000_100000', 'above_100000'],
    formatOpt: (opt) => opt.replace(/_/g, ' ').replace('below', 'under ') },
  { id: 'budget', title: "What's the budget range for the car?", type: 'select', 
    options: ['below_1lac', '1_2lac', '2_3lac', '3_5lac', 'above_5lac'],
    formatOpt: (opt) => {
      const map = {
        'below_1lac': 'Below 1 Lac',
        '1_2lac': '1 Lac - 2 Lac',
        '2_3lac': '2 Lac - 3 Lac',
        '3_5lac': '3 Lac - 5 Lac',
        'above_5lac': '5 Lac and Above'
      };
      return map[opt] || opt;
    }
  },
  { id: 'fuel', title: "What's the fuel type of the car?", type: 'select', 
    options: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'] },
  { id: 'transmission', title: "What's the transmission type of the car?", type: 'select', 
    options: ['manual', 'automatic'] },
  { id: 'contact', title: "Contact Information", type: 'contact' }
];

const Wizard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    make: '', type: '', condition: '', year: '', kms_driven: '',
    budget: '', fuel: '', transmission: '', name: '', phone: ''
  });

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [validationError, setValidationError] = useState('');

  const submitMutation = useMutation({
    mutationFn: async (submitData) => {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${baseUrl}/api/submit-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      if (!response.ok) throw new Error('Failed to submit inquiry');
      return response.json();
    }
  });

  const isSubmitting = submitMutation.isPending;
  const result = submitMutation.data;
  const apiError = submitMutation.isError ? submitMutation.error.message : '';

  useEffect(() => {
    // Parse query params initially
    const params = new URLSearchParams(location.search);
    const updates = {};
    let shouldSkipTo = null;
    let didUpdate = false;

    if (params.get('make')) { updates.make = params.get('make'); didUpdate = true; }
    if (params.get('type')) { updates.type = params.get('type'); didUpdate = true; }
    if (params.get('condition')) { updates.condition = params.get('condition'); didUpdate = true; }

    if (didUpdate) {
      setFormData(prev => ({ ...prev, ...updates }));
      if (updates.make && updates.type && updates.condition) {
        if (updates.condition.toLowerCase() === 'new') {
          shouldSkipTo = stepsConfig.findIndex(s => s.id === 'budget');
        } else {
          shouldSkipTo = stepsConfig.findIndex(s => s.id === 'year');
        }
      }
    }
    
    if (shouldSkipTo !== null) {
      setCurrentStepIdx(shouldSkipTo);
    }
  }, [location.search]);

  // Framer Motion constraints
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1, x: 0, opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const currentStep = stepsConfig[currentStepIdx];
  const progress = ((currentStepIdx + 1) / stepsConfig.length) * 100;

  const handleNext = () => {
    setValidationError('');
    // Validation
    if (currentStep.type === 'select' && !formData[currentStep.id]) {
      setValidationError('Please select an option to continue.');
      return;
    }
    if (currentStep.id === 'contact') {
      if (!formData.name || !formData.phone) {
        setValidationError('Please provide your name and phone number.');
        return;
      }
      submitMutation.mutate({
        ...formData,
        year: formData.year || null,
        kms_driven: formData.kms_driven || null,
      });
      return;
    }

    setDirection(1);
    let nextIdx = currentStepIdx + 1;

    // Skip logic for 'new' cars
    if (currentStep.id === 'condition' && formData.condition === 'new') {
      nextIdx = stepsConfig.findIndex(s => s.id === 'budget');
    }

    setCurrentStepIdx(nextIdx);
  };

  const handlePrev = () => {
    setValidationError('');
    setDirection(-1);
    let prevIdx = currentStepIdx - 1;

    if (currentStep.id === 'budget' && formData.condition === 'new') {
      prevIdx = stepsConfig.findIndex(s => s.id === 'condition');
    }

    setCurrentStepIdx(prevIdx);
  };


  if (result) {
    return (
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <Helmet>
          <title>CarFinder | Your Recommendations</title>
        </Helmet>
        <motion.div 
          className="success-container glass-panel"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="success-icon">
            <CheckCircle size={80} color="var(--accent-primary)" />
          </div>
          <h2 className="title-gradient-accent mb-3">You're All Set!</h2>
          <p className="text-secondary mb-4">
            One of our concierge experts is already reviewing your preferences and will <strong>reach out to you shortly</strong> to discuss the best path forward.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
            <button className="btn btn-primary" onClick={() => window.location.href = '/wizard'}>Start New Search</button>
          </div>
        </motion.div>

        {result.recommendations?.length > 0 ? (
          <>
            <div className="mt-5 mb-4 text-center">
              <h3 className="recommendations-title mb-2">Curated for Your Taste</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
                While our network is vast, a "perfect" match is rare—so we’ve handpicked the closest, highest-quality alternatives that align with your refined criteria.
              </p>
            </div>
            <div className="recommendations-grid">
              {result.recommendations.map((car, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                >
                  <CarCard car={car} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-5 text-center p-4 glass-panel" style={{ maxWidth: '600px', margin: '4rem auto 0' }}>
            <p className="text-secondary">Our scouts couldn't find an exact match right now, but we are always hunting. Try adjusting your lens or wait for our call.</p>
          </div>
        )}
      </div>
    );
  }

  const renderCurrentStep = () => {
    if (currentStep.type === 'select') {
      return (
        <div className="option-grid">
          {currentStep.options.map(opt => {
            const isSelected = formData[currentStep.id] === opt;
            const label = currentStep.formatOpt ? currentStep.formatOpt(opt) : opt;
            return (
              <div 
                key={opt}
                className={`option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setFormData({...formData, [currentStep.id]: opt});
                  setValidationError('');
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      );
    }

    if (currentStep.type === 'contact') {
      return (
        <div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="tel" 
              className="form-control" 
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="wizard-page bg-primary">
      <Helmet>
        <title>CarFinder | Search Wizard</title>
      </Helmet>
      <div className="wizard-card glass-panel" style={{ borderRadius: 'var(--radius-xl)' }}>
        <div className="wizard-header">
          <div className="step-indicator">
            Question {currentStepIdx + 1} of {stepsConfig.length}
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${Math.max(progress, 5)}%` }}></div>
          </div>
        </div>

        <div className="wizard-body">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepIdx}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              style={{ width: '100%' }}
            >
              <h2 className="step-title title-gradient">{currentStep.title}</h2>
              {renderCurrentStep()}
              {validationError && <div className="form-error mt-3">{validationError}</div>}
              {apiError && <div className="form-error mt-3">{apiError}</div>}

              <div className="wizard-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={currentStepIdx === 0 ? () => navigate('/') : handlePrev}
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={18} /> {currentStepIdx === 0 ? 'Home' : 'Back'}
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {currentStepIdx === stepsConfig.length - 1 ? (
                    isSubmitting ? 'Submitting...' : 'Find Cars'
                  ) : 'Next'} {!isSubmitting && <ArrowRight size={18} />}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wizard;
