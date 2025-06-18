import React from 'react';

export const InternshipGallery: React.FC = () => {
  const svgBackground = "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E";

  const images = [
    {
      src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
      alt: "Students collaborating on a tech project",
      title: "Collaborative Innovation"
    },
    {
      src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      alt: "Student coding on multiple monitors",
      title: "Software Development"
    },
    {
      src: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      alt: "Student working on MacBook Pro",
      title: "Digital Design"
    },
    {
      src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      alt: "Female student in STEM program",
      title: "Research & Development"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div 
        className="absolute inset-0 animate-pulse"
        style={{ backgroundImage: `url(\"${svgBackground}\")` }}
      ></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Real Students, Real Impact
          </h2>
          <p className="text-xl md:text-2xl text-purple-200 max-w-3xl mx-auto">
            See our students in action during their internship experiences
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={`${image.src}?q=80&w=400&auto=format&fit=crop`}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">{image.title}</h3>
                </div>
              </div>
              <div className="absolute inset-0 ring-1 ring-white/20 rounded-2xl"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
