import { Calendar, Gauge, Fuel } from 'lucide-react';

const CarCard = ({ car }) => {
  const priceFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(car.price);

  return (
    <div className="car-card glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '200px', overflow: 'hidden' }}>
        <img 
          src={car.image} 
          alt={`${car.make} ${car.model}`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
        />
      </div>
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{car.make} {car.model}</h4>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
          {priceFormatted}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} /> <span>{car.year} | <span style={{ textTransform: 'capitalize'}}>{car.condition}</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gauge size={16} /> <span>{car.kms_driven.replace(/_/g, ' ').replace('below', '< ')} km</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
            <Fuel size={16} /> <span>{car.fuel} | {car.transmission}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
          {car.features.slice(0, 3).map((feat, idx) => (
            <span 
              key={idx} 
              style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-accent)', borderRadius: '4px', fontSize: '0.8rem' }}
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarCard;
