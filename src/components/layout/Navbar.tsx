"use client";
import React, { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { BrazilLogo } from "../ui/BrazilLogo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const chapters = [
    { id: 1, label: "Capítulo 1", description: "Demografia" },
    { id: 2, label: "Capítulo 2", description: "Educação" },
    { id: 3, label: "Capítulo 3", description: "Economia" },
    { id: 4, label: "Capítulo 4", description: "Habitação" },
    { id: 5, label: "Capítulo 5", description: "Futuro" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-muted bg-background/80 backdrop-blur-md">
      <div className="h-1 w-full bg-image-gradient-accent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="shrink-0 flex items-center gap-2 cursor-pointer">
            {/* Ajustei o tamanho para w-9 h-9 para ficar mais delicado */}
            <div className="relative w-9 h-9 transition-transform duration-300 group-hover:scale-110">
              <BrazilLogo className="w-full h-full text-deco-emerald" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Censo<span className="text-deco-emerald-glow">Brasil</span>
            </span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {chapters.map((item) => (
                <a
                  key={item.id}
                  href={`#capitulo-${item.id}`}
                  className="group relative px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {item.label}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-deco-emerald scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              ))}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none"
            >
              <span className="sr-only">Abrir menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-muted">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {chapters.map((item) => (
              <a
                key={item.id}
                href={`#capitulo-${item.id}`}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors justify-between items-center"
              >
                <span>
                  <span className="text-deco-emerald text-xs uppercase mr-2">
                    Cap {item.id}
                  </span>
                  {item.description}
                </span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
