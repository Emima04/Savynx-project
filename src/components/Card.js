import React from 'react';

const Card = ({ children, className = "", title }) => {
  return (
    <div className={`glass-panel p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
