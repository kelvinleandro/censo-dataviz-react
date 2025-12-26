import React from "react";

export const BrazilLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <path
        d="M32.5 15.5C35 12 45 10 50 12C55 14 65 18 70 25C75 32 85 30 90 35C92 37 80 45 75 48C70 51 72 60 65 65C58 70 55 80 50 85C45 90 40 85 35 75C30 65 25 60 20 55C15 50 10 40 12 30C14 20 20 18 25 18C28 18 30 18 32.5 15.5Z"
        className="fill-deco-emerald stroke-deco-emerald-glow"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      <path
        d="M50 35 L65 50 L50 65 L35 50 Z"
        className="fill-deco-gold opacity-80"
      />
      
      <circle cx="50" cy="50" r="6" className="fill-deco-navy-deep" />
    </svg>
  );
};