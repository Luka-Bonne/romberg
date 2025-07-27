import React from 'react';


export const Icon = ({ src, className = '' }) => {
  return (
    <img src={src} className={`svg-icon ${className}`} alt="" aria-hidden="true"/>
  );
};