import React from 'react';
import { BookOpen, Video, Briefcase, Award, Users, Rocket } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Interactive Learning",
      description: "Engage with cutting-edge educational content designed for the next generation of innovators.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Video,
      title: "Expert-Led Videos",
      description: "Learn from industry professionals and academic experts through our comprehensive video library.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Briefcase,
      title: "Real Internships",
      description: "Apply for hands-on internship opportunities with leading technology companies.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Award,
      title: "Certification Programs",
      description: "Earn recognized certifications that validate your skills and knowledge.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Community Learning",
      description: "Connect with peers, mentors, and industry professionals in our vibrant community.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Rocket,
      title: "Innovation Labs",
      description: "Access state-of-the-art facilities and resources to bring your ideas to life.",
      gradient: "from-pink-500 to-rose-500"
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Novakinetix Academy</span>?
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto">
            Discover the features that make our platform the premier destination for STEM education
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
