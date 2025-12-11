'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

const footerData = {
  heading: 'blablabuild',
  email: {
    label: 'hello@blablabuild.com',
    href: 'mailto:hello@blablabuild.com',
  },
  location: {
    label: 'Built in Amsterdam',
  },
  navLinks: [
    { label: 'Oplossingen', href: '#oplossingen' },
    { label: 'Aanpak', href: '#aanpak' },
    { label: 'Expertise', href: '#expertise' },
    { label: 'Over ons', href: '#over-ons' },
    { label: 'Privacy', href: '/privacy' },
  ],
};

export default function Footer() {
  const handleNavClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(href.slice(1));
      if (element) {
        const navHeight = 110;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - navHeight;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <footer className="pt-4 pb-4 md:pt-24 md:pb-6 px-[10px]">
      <div className="w-full">
        {/* Main Footer Card */}
        <motion.div 
          className="bg-bla-dark rounded-3xl p-8 md:p-16 relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Grain effect overlay */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-[0.2] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
          />
          {/* Heading Section */}
          <div className="border-b border-white/10 mb-8 pb-8 md:mb-12 md:pb-12 text-left md:text-center relative z-10">
            <motion.div 
              className="flex items-center justify-start md:justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Image 
                src="/icon.svg" 
                alt="blablabuild" 
                width={80} 
                height={80}
                className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20"
              />
              <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-bla-white">
                <span className="font-normal">blabla</span>
                <span className="font-bold">build</span>
              </h2>
            </motion.div>
          </div>

          {/* Contact Grid */}
          <motion.div 
            className="mb-12 flex flex-col gap-10 md:mb-16 lg:flex-row lg:justify-between lg:gap-8 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Email Section */}
            <div className="flex flex-col items-start gap-3">
              <h3 className="text-bla-lime text-sm font-semibold uppercase tracking-widest">
                Email
              </h3>
              <a
                href={footerData.email.href}
                className="text-bla-text-light hover:text-bla-lime flex items-center gap-2 text-base md:text-lg transition-colors group"
              >
                {footerData.email.label}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            {/* Location Section */}
            <div className="flex flex-col items-start gap-3">
              <h3 className="text-bla-lime text-sm font-semibold uppercase tracking-widest">
                Locatie
              </h3>
              <span className="text-bla-text-light text-base md:text-lg">
                {footerData.location.label}
              </span>
            </div>
          </motion.div>

          {/* Bottom Section */}
          <motion.div 
            className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between relative z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <nav className="flex flex-wrap gap-x-6 gap-y-3">
              {footerData.navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={handleNavClick(link.href)}
                  className="text-text-muted hover:text-bla-lime text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="text-text-muted text-sm">
              © {new Date().getFullYear()} blablabuild
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
