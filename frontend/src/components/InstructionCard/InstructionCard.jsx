import React from "react";
import "./InstructionCard.css";


export const InstructionCard = ({ imageUrl, title, description }) => {
  return (
    <div className="instruction-card">
      <div className="card-image-container">
        <img src={imageUrl} alt={title} className="card-image" />
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );
};