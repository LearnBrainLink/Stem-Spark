import React from 'react';
import { GraduationCap, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const CTASection: React.FC = () => {
  const svgBackground = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div 
          className="absolute inset-0 animate-pulse"
          style={{ backgroundImage: `url(\"${svgBackground}\")` }}
        ></div>
      </div>
      {/* Floating elements */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-white rounded-full opacity-20 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight">
          Ready to Shape the <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Future</span>?
        </h2>
        <p className="text-xl md:text-2xl lg:text-3xl mb-12 text-blue-100 leading-relaxed max-w-4xl mx-auto">
          Join thousands of students who are already building tomorrow's innovations today.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/sign%20up">
            <button className="group relative bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-12 py-6 rounded-full text-xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105 transform">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                <GraduationCap className="mr-3 w-6 h-6" />
                Enroll Now
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </Link>
          <Link href="/internships">
            <button className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold px-12 py-6 rounded-full text-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 transform">
              <div className="flex items-center justify-center">
                <Briefcase className="mr-3 w-6 h-6" />
                Explore Internships
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
