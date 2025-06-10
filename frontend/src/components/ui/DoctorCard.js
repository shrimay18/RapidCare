import React from 'react';
import { Star, Clock, MapPin, Phone } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  return (
    <div className="doctor-card">
      <div className="doctor-header">
        <img
          src={
            doctor.image ||
            'https://ui-avatars.com/api/?name=' + encodeURIComponent(doctor.name)
          }
          alt={doctor.name}
          className="doctor-image"
        />
        <div className="doctor-info">
          <h4 className="doctor-name">{doctor.name}</h4>
          <p className="doctor-specialty">{doctor.specialization}</p>
          <div className="rating">
            <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
            <span>{doctor.rating}</span>
          </div>
        </div>
      </div>
      <div className="doctor-details">
        <div className="detail-row">
          <Clock size={16} />
          <span>{doctor.experience}</span>
        </div>
        <div className="detail-row">
          <MapPin size={16} />
          <span>{doctor.location}</span>
        </div>
        <div className="detail-row">
          <Phone size={16} />
          <span>{doctor.phone}</span>
        </div>
      </div>
      <div className="doctor-footer">
        <span className="price">{doctor.price}</span>
        <button className="book-button">Book Appointment</button>
      </div>
    </div>
  );
};

export default DoctorCard;