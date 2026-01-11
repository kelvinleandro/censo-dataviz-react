"use client";
import { BrazilLogo } from "../ui/BrazilLogo";

const Navbar = () => {
  const chapters = [
    { id: 1, label: "Capítulo 1" },
    { id: 2, label: "Capítulo 2" },
    { id: 3, label: "Capítulo 3" },
    { id: 4, label: "Capítulo 4" },
    { id: 5, label: "Capítulo 5" },
    { id: 6, label: "Capítulo 6" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-muted bg-background/20 backdrop-blur-md">
      <div className="h-1 w-full bg-image-gradient-accent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#hero">
            <div className="shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="relative w-9 h-9 transition-transform duration-300 group-hover:scale-110">
                <BrazilLogo className="w-full h-full text-deco-emerald" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                Censo<span className="text-deco-emerald-glow"> Brasil</span>
              </span>
            </div>
          </a>

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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
