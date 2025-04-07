import React, { useEffect, useState } from 'react';
import { AnimatedButton } from './ui/animated-button';

export default function HomeHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className="relative overflow-hidden min-h-[80vh] flex items-center justify-center mb-16 bg-[#0a0a0a] rounded-xl shadow-2xl border border-gray-800/30">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-black/5 to-purple-900/20 opacity-30"></div>
      </div>

      {/* Animated dots */}
      <div className="absolute h-full w-full bg-black">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>
        <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-20"></div>
        <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-20"></div>
      </div>

      {/* Content container */}
      <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white" style={{fontFamily: "'Orbitron', sans-serif"}}>
            Share Your Story <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700">With The World</span>
          </h1>
          <p className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover the joy of blogging with our intuitive platform. Connect with thousands of bloggers, share your stories, and grow your audience.
          </p>

          {/* Glowing circle behind buttons */}
          <div className="relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <AnimatedButton
                variant="default"
                size="lg"
                animation="glow"
                className="text-lg"
                asChild
              >
                <a href="/blogs" style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Explore Posts</a>
              </AnimatedButton>
              <AnimatedButton
                variant="default"
                size="lg"
                animation="glow"
                className="text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500"
                asChild
              >
                <a href="/create-post" style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Start Writing</a>
              </AnimatedButton>
            </div>
          </div>

          {/* Floating badges */}
          <div className="mt-16 flex justify-center gap-4 flex-wrap">
            <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-full px-6 py-2 text-sm text-gray-300 flex items-center gap-2 animate-float">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              Modern Design
            </div>
            <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-full px-6 py-2 text-sm text-gray-300 flex items-center gap-2 animate-bounce-slow">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Rich Editor
            </div>
            <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-full px-6 py-2 text-sm text-gray-300 flex items-center gap-2 animate-float">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Community Focused
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
