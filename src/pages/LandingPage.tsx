import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth/login');
  };

  const handleLearnMore = () => {
    // Scroll to about section or could navigate to a learn more page
    const aboutSection = document.getElementById('about-app');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-ebeerCream text-gray-800 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/ebeer-logo.png" 
              alt="e-Beer Logo" 
              className="w-10 h-10"
            />
            <span className="ml-3 font-bold text-2xl text-ebeerGreen">e-Beer</span>
          </div>
          <nav className="hidden md:flex space-x-10">
            <a href="#about-app" className="text-ebeerGreen hover:text-green-500 transition">
              App
            </a>
            <a href="#about-ai" className="text-ebeerGreen hover:text-green-500 transition">
              AI Technology
            </a>
            <a href="#contact" className="text-ebeerGreen hover:text-green-500 transition">
              Contact
            </a>
          </nav>
          <button 
            onClick={handleGetStarted}
            className="bg-ebeerGreen hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow-md"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="text-white py-20 md:py-28"
        style={{
          background: `linear-gradient(rgba(46,125,50,0.7), rgba(46,125,50,0.7)), url("/hero_farm.png.png") no-repeat center center`,
          backgroundSize: 'cover'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Connecting Farmers and Buyers with Smart AI</h1>
          <p className="text-xl max-w-3xl mx-auto mb-10">
            e-Beer empowers farmers by connecting them directly with markets, while our AI predicts demand and optimizes distribution.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-ebeerGreen px-6 py-3 rounded-lg font-semibold text-lg shadow-lg transition hover:bg-gray-100"
            >
              Get Started
            </button>
            <button 
              onClick={handleLearnMore}
              className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold text-lg transition hover:bg-white hover:text-ebeerGreen"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-ebeerGreen mb-16">Why Choose e-Beer?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg shadow-md bg-ebeerCream">
              <div className="w-16 h-16 bg-ebeerGreen rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🌾</span>
              </div>
              <h3 className="text-xl font-bold text-ebeerGreen mb-3">Direct Market Access</h3>
              <p className="text-gray-700">
                Connect directly with buyers, eliminate middlemen, and get fair prices for your produce.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg shadow-md bg-ebeerCream">
              <div className="w-16 h-16 bg-ebeerGreen rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-ebeerGreen mb-3">AI-Powered Insights</h3>
              <p className="text-gray-700">
                Get demand predictions, optimal pricing recommendations, and market trend analysis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg shadow-md bg-ebeerCream">
              <div className="w-16 h-16 bg-ebeerGreen rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-ebeerGreen mb-3">Easy to Use</h3>
              <p className="text-gray-700">
                Simple, intuitive interface designed for farmers. List your produce in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About the App Section */}
      <section id="about-app" className="py-20 bg-ebeerCream">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-ebeerGreen mb-16">The e-Beer App</h2>
          <div className="flex justify-center">
            <img 
              src="/farmer-phone.png" 
              alt="Farmer using e-Beer app" 
              className="rounded-xl shadow-lg max-w-md"
            />
          </div>
        </div>
      </section>

      {/* About the AI Section */}
      <section id="about-ai" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-ebeerGreen mb-16">AI that Empowers Agriculture</h2>
          <p className="text-lg max-w-3xl mx-auto text-center mb-8">
            Our AI analyzes trends, weather, and historical data to predict demand, recommend fair pricing, and reduce waste.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-ebeerCream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-ebeerGreen mb-16">Get in Touch</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-ebeerGreen mb-6">Contact Information</h3>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-ebeerGreen rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">📧</span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <a 
                      href="mailto:omarabdiali232@gmail.com" 
                      className="text-ebeerGreen hover:text-green-700 font-semibold"
                    >
                      omarabdiali232@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-ebeerGreen rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">📱</span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Phone</p>
                    <a 
                      href="tel:+252636961726" 
                      className="text-ebeerGreen hover:text-green-700 font-semibold"
                    >
                      +252 636 961 726
                    </a>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-gray-700 text-sm">
                    Have questions about e-Beer? We're here to help! Reach out to us via email or phone, and we'll get back to you as soon as possible.
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-ebeerGreen mb-6">Ready to Get Started?</h3>
                <p className="text-lg text-gray-700 mb-8">
                  Join thousands of farmers and buyers who are already using e-Beer to transform their agricultural business.
                </p>
                <button 
                  onClick={handleGetStarted}
                  className="bg-ebeerGreen hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition"
                >
                  Start Your Journey Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ebeerGreen text-white py-12">
        <div className="container mx-auto text-center">
          <h3 className="font-bold text-2xl mb-2">e-Beer</h3>
          <p>Revolutionizing agriculture through technology and AI.</p>
          <p className="mt-4 text-ebeerCream">&copy; 2025 e-Beer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
