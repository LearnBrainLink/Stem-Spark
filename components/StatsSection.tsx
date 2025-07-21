import React from 'react';

export const StatsSection: React.FC = () => {
  const stats = [
    { number: "10,000+", label: "Active Students", color: "from-blue-500 to-cyan-500" },
    { number: "500+", label: "Expert Instructors", color: "from-purple-500 to-pink-500" },
    { number: "1,000+", label: "Video Lessons", color: "from-green-500 to-emerald-500" },
    { number: "200+", label: "Partner Companies", color: "from-orange-500 to-red-500" },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-xl text-gray-600">Join thousands of students already shaping the future</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group text-center transform hover:scale-105 transition-all duration-300"
            >
              <div className={`inline-block p-6 rounded-2xl bg-gradient-to-r ${stat.color} mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                  {stat.number}
                </div>
              </div>
              <div className="text-lg md:text-xl text-gray-700 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
