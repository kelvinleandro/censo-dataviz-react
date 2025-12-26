import React from "react";

export const BrazilLogo = ({ className }: { className?: string }) => {
  return (
    <div
      className={`${className} bg-deco-emerald shadow-[0_0_10px_rgba(52,211,153,0.4)]`} 
      style={{
        maskImage: 'url("/br.svg")',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskImage: 'url("/br.svg")',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: 'contain',
      }}
    />
  );
};