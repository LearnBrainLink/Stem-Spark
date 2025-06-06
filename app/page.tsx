import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rocket, Users, BookOpen, Lightbulb, Wrench, Target, Heart, Play, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { BrandedImage } from "@/components/branded-image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo width={40} height={40} variant="with-text" showText />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#about" className="text-gray-600 hover:text-brand-navy transition-colors">
              About
            </Link>
            <Link href="#resources" className="text-gray-600 hover:text-brand-navy transition-colors">
              Resources
            </Link>
            <Link href="#impact" className="text-gray-600 hover:text-brand-navy transition-colors">
              Impact
            </Link>
            <Link href="/login">
              <Button className="bg-brand-navy hover:bg-brand-dark text-white">Get Started Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 hero-gradient">
        <div className="container mx-auto text-center max-w-6xl">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-brand-navy border-blue-200">
            Free for All Students • Grades 5-8
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 accent-text-gradient leading-tight">
            Empowering Young Engineers
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            We envision a world where every student, regardless of background, has the opportunity to explore the
            exciting world of engineering from an early age through free, engaging, and hands-on STEM resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/login">
              <Button size="lg" className="bg-brand-navy hover:bg-brand-dark text-white text-lg px-8 py-4">
                <Play className="w-5 h-5 mr-2" />
                Start Learning Today
              </Button>
            </Link>
            <Link href="/videos">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-2 border-brand-navy text-brand-navy"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Resources
              </Button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-brand-navy to-brand-dark rounded-2xl p-8 shadow-2xl">
              <BrandedImage
                src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop"
                alt="Students engaged in hands-on STEM activities at STEM Spark Academy"
                width={800}
                height={400}
                className="rounded-xl w-full"
                showBranding={true}
                brandingPosition="bottom-right"
                priority={true}
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 bg-brand-orange rounded-full p-3 shadow-lg animate-bounce">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-4 -right-4 bg-brand-navy rounded-full p-3 shadow-lg animate-bounce delay-300">
              <Rocket className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="about" className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 brand-text-gradient">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fostering creativity, problem-solving, and innovation to ignite a lifelong passion for engineering and
              inspire the next generation of thinkers, builders, and changemakers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-brand-navy rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-brand-navy">Accessible to All</h3>
                <p className="text-gray-600">
                  Free resources ensure every student, regardless of background, can explore engineering and STEM
                  concepts through STEM Spark Academy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-brand-navy">Hands-On Learning</h3>
                <p className="text-gray-600">
                  Engaging, interactive activities that make complex engineering concepts accessible and fun for young
                  minds at STEM Spark Academy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-pink-50 to-pink-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-brand-navy">Grade 5-8 Focus</h3>
                <p className="text-gray-600">
                  Specifically designed curriculum that meets middle school students where they are in their learning
                  journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="resources" className="py-20 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 brand-text-gradient">What Makes Us Different</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines proven educational methods with cutting-edge technology to create an unparalleled
              learning experience at STEM Spark Academy.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-brand-navy">100% Free Resources</h3>
                    <p className="text-gray-600">
                      No hidden costs, no premium tiers. Quality STEM education should be accessible to everyone through
                      STEM Spark Academy.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-navy rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-brand-navy">Project-Based Learning</h3>
                    <p className="text-gray-600">
                      Students learn by building real projects, from simple machines to robotics and coding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-orange rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-brand-navy">Inclusive Design</h3>
                    <p className="text-gray-600">
                      Created with diverse learning styles and backgrounds in mind, ensuring every student can succeed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-brand-navy">Future-Ready Skills</h3>
                    <p className="text-gray-600">
                      Building critical thinking, problem-solving, and innovation skills for tomorrow's challenges.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <BrandedImage
                src="https://images.unsplash.com/photo-1581092335397-9fa341108e1e?q=80&w=1974&auto=format&fit=crop"
                alt="Students working on engineering projects at STEM Spark Academy"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
                showBranding={true}
                brandingPosition="top-right"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-brand-navy text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Creating Tomorrow's Innovators</h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Join thousands of students already exploring the exciting world of engineering and building the skills they
            need for the future through STEM Spark Academy.
          </p>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-brand-orange">Students Engaged</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-brand-orange">Free Resources</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-brand-orange">Schools Partnered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-brand-orange">Student Satisfaction</div>
            </div>
          </div>

          <Button size="lg" className="bg-white text-brand-navy hover:bg-gray-100 text-lg px-8 py-4">
            <ArrowRight className="w-5 h-5 mr-2" />
            Start Your Journey Today
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 brand-text-gradient">Ready to Spark Curiosity?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our community of young engineers and start building the future today. It's completely free and always
              will be at STEM Spark Academy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-brand-navy hover:bg-brand-dark text-white text-lg px-8 py-4">
                  Get Started Now
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-2 border-brand-navy text-brand-navy"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-navy text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo width={32} height={32} variant="with-text" showText />
              </div>
              <p className="text-gray-400">
                Empowering the next generation of engineers through free, accessible STEM education.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Engineering Projects
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Coding Activities
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Science Experiments
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Math Challenges
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Teacher Resources
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Parent Guide
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Social Media
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} STEM Spark Academy. All rights reserved. Made with ❤️ for young engineers
              everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
