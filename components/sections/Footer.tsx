'use client';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="snap-start bg-bla-lime py-10 md:py-12 lg:py-16 flex flex-col relative">
      <div className="mx-auto px-4 md:px-nav w-full flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left mb-auto">
          <div className="flex items-center -ml-4 md:-ml-[60px]">
            <div className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 flex-shrink-0">
              <Image
                src="/icon.svg"
                alt="blablabuild logo"
                width={256}
                height={256}
                className="w-full h-full"
              />
            </div>
            <h3 className="text-8xl md:text-9xl lg:text-[12rem] font-bold leading-none text-bla-dark flex items-center">
              build
            </h3>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center gap-4 text-left mt-auto pt-8">
          <div className="text-bla-dark text-xs">
            <p>© 2025 blablabuild</p>
          </div>
          <div className="text-bla-dark text-xs">
            <a href="mailto:hello@blablabuild.com" className="hover:underline transition-colors">
              hello@blablabuild.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


