import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-800 pt-8 pb-32 text-center bg-black/50 backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-black via-[#eab308] to-black opacity-30"></div>
      <h4 className="text-white font-black uppercase tracking-widest text-lg mb-6 drop-shadow-md">Únete a la tribu</h4>
      <div className="flex justify-center gap-6 mb-8">
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-lg hover:scale-110 transition-transform shadow-lg border border-transparent hover:border-white">
          IG
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full bg-black border-2 border-[#00f2fe] flex items-center justify-center text-white font-black text-lg hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,242,254,0.3)]">
          TK
        </a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-black text-xl pb-0.5 hover:scale-110 transition-transform shadow-lg border border-transparent hover:border-white">
          f
        </a>
      </div>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest">© 2026 Modern Barber PWA.</p>
    </footer>
  );
}
