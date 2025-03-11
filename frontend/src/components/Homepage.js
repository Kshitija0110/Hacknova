import React, { useState } from 'react';
import { Bell, BookOpen, Calendar, ChevronRight, Clipboard, FileText, GraduationCap, Home, LayoutDashboard, LogIn, MessageSquare, User, Users } from 'lucide-react';

const Homepage = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      id: 'login',
      title: 'Role-Based Access',
      description: 'Secure login system with dedicated portals for students, faculty, and administrators.',
      icon: <LogIn className="h-6 w-6 text-indigo-600" />,
      details: 'Personalized dashboards for each role with relevant information and tools. Multi-factor authentication for enhanced security.'
    },
    {
      id: 'attendance',
      title: 'Attendance Tracking',
      description: 'Automated attendance system with real-time updates and reporting.',
      icon: <Clipboard className="h-6 w-6 text-indigo-600" />,
      details: 'QR code check-ins, absence notifications, and attendance analytics. Faculty can mark attendance and view attendance reports.'
    },
    {
      id: 'grades',
      title: 'Assignment & Grades',
      description: 'Streamlined system for assignments submission and grade tracking.',
      icon: <FileText className="h-6 w-6 text-indigo-600" />,
      details: 'Online assignment submission, plagiarism checking, and comprehensive grade analytics. Students receive timely feedback on their work.'
    },
    {
      id: 'notice',
      title: 'Digital Notice Board',
      description: 'Centralized platform for important announcements and updates.',
      icon: <Bell className="h-6 w-6 text-indigo-600" />,
      details: 'Push notifications for urgent announcements. Filter notices by department, year, or relevance.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-indigo shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <GraduationCap className="h-8 w-8 text-indigo-700" />
                <span className="ml-2 text-xl font-bold text-gray-900">EduConnect</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Features
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Contact
                </a>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Log In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Transform Your College Management
              </h1>
              <p className="mt-6 text-xl max-w-3xl">
                Streamline administration, enhance communication, and improve student experience with our comprehensive College Management System.
              </p>
              <div className="mt-8 flex space-x-4">
                <button className="bg-white text-indigo-700 hover:bg-gray-100 px-6 py-3 rounded-md text-lg font-medium">
                  Get Started
                </button>
                
              </div>
            </div>
            <div className="mt-12 lg:mt-0 flex justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-md">
                    <User className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Student Portal</p>
                      <p className="text-xs text-gray-500">Access courses, grades & attendance</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-md">
                    <Users className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Faculty Portal</p>
                      <p className="text-xs text-gray-500">Manage classes, grades & resources</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-md">
                    <LayoutDashboard className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Admin Dashboard</p>
                      <p className="text-xs text-gray-500">Complete institutional oversight</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything You Need in One Place
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our comprehensive platform addresses all aspects of college management.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div 
                  key={feature.id}
                  className="relative p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                  {activeFeature === feature.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{feature.details}</p>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4">
                    <ChevronRight className={`h-5 w-5 text-indigo-500 transform transition-transform ${activeFeature === feature.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Trusted by Educational Institutions
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Join the growing network of colleges and universities that have transformed their administrative processes.
            </p>
          </div>
          <div className="mt-10 max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-600 italic">
              "Implementing this system has revolutionized how we manage our college operations. Administrative tasks that used to take days now happen in minutes, and both students and faculty love the intuitive interface."
            </p>
            <div className="mt-4 flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                  DC
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Dr. Collins</p>
                <p className="text-sm text-gray-500">Dean of Student Affairs, Tech University</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-100">Schedule a demo today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <a href="#" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
                Request Demo
              </a>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a href="#" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-xl font-bold">EduConnect</span>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Transforming education management for the digital age.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Features</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Student Portal</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Faculty Portal</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Admin Dashboard</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">API Reference</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Guides</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">About</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-base text-gray-400 text-center">
              &copy; 2025 EduConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default 
Homepage;
