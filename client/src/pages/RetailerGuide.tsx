import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Store, Upload, IndianRupee, Truck, Users, ArrowRight, CheckCircle } from 'lucide-react';

const RetailerGuide: React.FC = () => {
  const { user } = useAuth();

  const steps = [
    {
      step: 1,
      title: 'Register Your Store',
      description: 'Set up your store profile with business details, location, and operating hours',
      action: 'Get Started',
      link: user ? '/stores/register' : '/register',
      icon: <Store className="h-8 w-8" />
    },
    {
      step: 2,
      title: 'Upload Products',
      description: 'Add your fashion products with high-quality images, descriptions, and pricing',
      action: 'Add Products',
      link: '/products/add',
      icon: <Upload className="h-8 w-8" />
    },
    {
      step: 3,
      title: 'Manage Orders',
      description: 'Track and fulfill customer orders through your store dashboard',
      action: 'View Dashboard',
      link: '/dashboard',
      icon: <Users className="h-8 w-8" />
    },
    {
      step: 4,
      title: 'Earn Revenue',
      description: 'Get paid for every sale with secure payment processing',
      action: 'Learn More',
      link: '/dashboard',
      icon: <IndianRupee className="h-8 w-8" />
    }
  ];

  const benefits = [
    '💰 No setup fees - Start selling immediately',
    '🚀 Fast 2-hour delivery to customers',
    '📱 Easy-to-use dashboard for all operations',
    '💳 Secure payments with multiple options',
    '📍 Location-based customer discovery',
    '📊 Real-time sales analytics',
    '🛡️ Fraud protection and secure transactions',
    '📞 24/7 customer support'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Start Selling on <span className="text-yellow-300">Stylo</span>
            </h1>
            <p className="text-xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Join Pune's fastest-growing fashion marketplace. Reach thousands of customers 
              and grow your business with our easy-to-use platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Create Account
                  </Link>
                  <Link to="/login" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                    Already Have Account?
                  </Link>
                </>
              ) : (
                <Link to="/stores/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Register Your Store Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How to Start Selling in 4 Easy Steps
            </h2>
            <p className="text-lg text-gray-600">
              Get your store online and start selling within minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                  <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <div className="text-primary-600">
                      {step.icon}
                    </div>
                  </div>
                  
                  <div className="absolute -top-3 -left-3 bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {step.description}
                  </p>
                  
                  <Link
                    to={step.link}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {step.action}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>

                {/* Connector Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Stylo for Your Business?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Get Started?</h3>
              
              {!user ? (
                <div className="space-y-4">
                  <p className="text-gray-600">Create your account to begin selling on Stylo</p>
                  <Link to="/register" className="btn-primary w-full">
                    Sign Up as Retailer
                  </Link>
                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-700">
                      Sign in
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">Welcome back! Set up your store to start selling.</p>
                  <Link to="/stores/register" className="btn-primary w-full">
                    Register Your Store
                  </Link>
                  <Link to="/dashboard" className="btn-outline w-full">
                    View Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">2 Hours</div>
              <div className="text-gray-600">Average Delivery Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Active Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Partner Stores</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Getting Started?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Our team is here to help you succeed. Contact us for personalized onboarding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+919876543210"
              className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
            >
              📞 Call Us: +91 98765 43210
            </a>
            <a
              href="mailto:support@stylo.com"
              className="btn-outline border-white text-white hover:bg-white hover:text-primary-600"
            >
              ✉️ Email Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RetailerGuide;
