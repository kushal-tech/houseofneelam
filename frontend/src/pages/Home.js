import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Gem, Star, Mail, Phone, MapPin, Award, Heart, Clock } from 'lucide-react';

const Home = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Bride",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      text: "The bridal collection at House of Neelam is absolutely stunning. The craftsmanship and attention to detail made my wedding day even more special.",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      role: "Anniversary Gift",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      text: "Bought a sapphire necklace for my wife's anniversary. The quality exceeded expectations and the service was exceptional.",
      rating: 5
    },
    {
      name: "Anjali Verma",
      role: "Fashion Enthusiast",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      text: "House of Neelam has become my go-to for statement jewellery. Every piece is a work of art that I treasure.",
      rating: 5
    }
  ];

  return (
    <div className=\"min-h-screen bg-white\">
      {/* Hero Section */}
      <section
        className=\"relative h-screen flex items-center justify-center bg-cover bg-center\"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1603739592187-716a8aafb22c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwyfHxibGFjayUyMG1hcmJsZSUyMGdvbGQlMjB0ZXh0dXJlfGVufDB8fHx8MTc3MjAyMTM2MXww&ixlib=rb-4.1.0&q=85)',
        }}
        data-testid=\"hero-section\"
      >
        <div className=\"absolute inset-0 bg-sapphire-deep/60\"></div>
        <div className=\"relative z-10 text-center px-4 max-w-4xl mx-auto\">
          <h1 className=\"font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight\">
            Timeless Elegance,
            <br />
            <span className=\"text-gold-metallic\">Royal Heritage</span>
          </h1>
          <p className=\"text-xl text-white/90 mb-8 font-light tracking-wide\">
            Exquisite jewellery crafted with artisanal perfection for moments that matter
          </p>
          <Link
            to=\"/products\"
            className=\"inline-block bg-gold-metallic text-white px-12 py-4 text-lg font-medium hover:bg-gold-matte transition-all active:scale-98\"
            data-testid=\"explore-collection-btn\"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className=\"py-24 px-4 max-w-7xl mx-auto\" data-testid=\"features-section\">
        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-12\">
          <div className=\"text-center space-y-4\">
            <div className=\"inline-flex items-center justify-center w-16 h-16 bg-gold-pale rounded-full mb-4\">
              <Sparkles className=\"h-8 w-8 text-gold-metallic\" />
            </div>
            <h3 className=\"font-display text-2xl text-sapphire-deep\">Artisanal Craft</h3>
            <p className=\"text-neutral-stone leading-relaxed\">
              Each piece is meticulously crafted by master artisans with decades of experience
            </p>
          </div>
          <div className=\"text-center space-y-4\">
            <div className=\"inline-flex items-center justify-center w-16 h-16 bg-gold-pale rounded-full mb-4\">
              <Gem className=\"h-8 w-8 text-gold-metallic\" />
            </div>
            <h3 className=\"font-display text-2xl text-sapphire-deep\">Finest Materials</h3>
            <p className=\"text-neutral-stone leading-relaxed\">
              We use only the highest quality gold, diamonds, and precious gemstones
            </p>
          </div>
          <div className=\"text-center space-y-4\">
            <div className=\"inline-flex items-center justify-center w-16 h-16 bg-gold-pale rounded-full mb-4\">
              <Shield className=\"h-8 w-8 text-gold-metallic\" />
            </div>
            <h3 className=\"font-display text-2xl text-sapphire-deep\">Lifetime Guarantee</h3>
            <p className=\"text-neutral-stone leading-relaxed\">
              Every purchase comes with our promise of quality and authenticity
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className=\"py-24 bg-neutral-alabaster\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"text-center mb-16\">
            <p className=\"text-xs uppercase tracking-widest text-gold-metallic font-medium mb-4\">
              Excellence Since 1947
            </p>
            <h2 className=\"font-display text-4xl lg:text-5xl text-sapphire-deep mb-6\">
              Why Choose House of Neelam?
            </h2>
          </div>
          
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8\">
            <div className=\"bg-white p-8 text-center\">
              <Award className=\"h-12 w-12 text-gold-metallic mx-auto mb-4\" />
              <h4 className=\"font-display text-xl text-sapphire-deep mb-3\">75+ Years Legacy</h4>
              <p className=\"text-neutral-stone text-sm\">Three generations of excellence in jewellery craftsmanship</p>
            </div>
            <div className=\"bg-white p-8 text-center\">
              <Heart className=\"h-12 w-12 text-gold-metallic mx-auto mb-4\" />
              <h4 className=\"font-display text-xl text-sapphire-deep mb-3\">Trusted by Thousands</h4>
              <p className=\"text-neutral-stone text-sm\">Over 10,000 happy customers and counting</p>
            </div>
            <div className=\"bg-white p-8 text-center\">
              <Gem className=\"h-12 w-12 text-gold-metallic mx-auto mb-4\" />
              <h4 className=\"font-display text-xl text-sapphire-deep mb-3\">Certified Quality</h4>
              <p className=\"text-neutral-stone text-sm\">All gemstones come with authenticity certificates</p>
            </div>
            <div className=\"bg-white p-8 text-center\">
              <Clock className=\"h-12 w-12 text-gold-metallic mx-auto mb-4\" />
              <h4 className=\"font-display text-xl text-sapphire-deep mb-3\">Fast Delivery</h4>
              <p className=\"text-neutral-stone text-sm\">Secure shipping within 3-5 business days across India</p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Section */}
      <section className=\"py-24\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-8 items-center\">
            <div>
              <img
                src=\"https://images.pexels.com/photos/30985153/pexels-photo-30985153.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940\"
                alt=\"Elegant jewellery showcase\"
                className=\"w-full h-[600px] object-cover\"
              />
            </div>
            <div className=\"space-y-6 px-8\">
              <p className=\"text-xs uppercase tracking-widest text-gold-metallic font-medium\">
                Our Story
              </p>
              <h2 className=\"font-display text-4xl lg:text-5xl text-sapphire-deep leading-tight\">
                Three Generations of Excellence
              </h2>
              <p className=\"text-neutral-stone text-lg leading-relaxed\">
                House of Neelam has been creating heirloom-quality jewellery since 1947. Our legacy is
                built on trust, craftsmanship, and an unwavering commitment to perfection.
              </p>
              <p className=\"text-neutral-stone leading-relaxed\">
                From traditional bridal sets to contemporary statement pieces, each creation tells a story 
                of artistry and passion. Our master craftsmen blend time-honored techniques with modern 
                design sensibilities to create jewellery that transcends generations.
              </p>
              <Link
                to=\"/products\"
                className=\"inline-block border-2 border-gold-metallic text-sapphire-deep px-8 py-3 font-medium hover:bg-gold-metallic hover:text-white transition-all\"
              >
                View Our Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className=\"py-24 bg-neutral-alabaster\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"text-center mb-16\">
            <p className=\"text-xs uppercase tracking-widest text-gold-metallic font-medium mb-4\">
              Customer Stories
            </p>
            <h2 className=\"font-display text-4xl lg:text-5xl text-sapphire-deep mb-4\">
              What Our Customers Say
            </h2>
            <p className=\"text-neutral-stone text-lg\">Trusted by thousands of satisfied customers</p>
          </div>

          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-8\">
            {testimonials.map((testimonial, index) => (
              <div key={index} className=\"bg-white p-8\">
                <div className=\"flex items-center mb-4\">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className=\"h-5 w-5 text-gold-metallic fill-current\" />
                  ))}
                </div>
                <p className=\"text-neutral-stone italic mb-6 leading-relaxed\">
                  \"{testimonial.text}\"
                </p>
                <div className=\"flex items-center\">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className=\"w-12 h-12 rounded-full object-cover mr-4\"
                  />
                  <div>
                    <p className=\"font-medium text-sapphire-deep\">{testimonial.name}</p>
                    <p className=\"text-sm text-neutral-stone\">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className=\"py-24\" data-testid=\"contact-section\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-12\">
            {/* Contact Info */}
            <div className=\"space-y-8\">
              <div>
                <p className=\"text-xs uppercase tracking-widest text-gold-metallic font-medium mb-4\">
                  Get In Touch
                </p>
                <h2 className=\"font-display text-4xl lg:text-5xl text-sapphire-deep mb-4\">
                  Visit Our Showroom
                </h2>
                <p className=\"text-neutral-stone text-lg leading-relaxed\">
                  Experience our exquisite collection in person. Our expert consultants are ready to help 
                  you find the perfect piece for your special moments.
                </p>
              </div>

              <div className=\"space-y-6\">
                <div className=\"flex items-start space-x-4\">
                  <div className=\"bg-gold-pale p-3 rounded-full\">
                    <MapPin className=\"h-6 w-6 text-gold-metallic\" />
                  </div>
                  <div>
                    <h4 className=\"font-medium text-sapphire-deep mb-1\">Our Location</h4>
                    <p className=\"text-neutral-stone\">
                      123 Jewellery Lane, M.G. Road<br />
                      Bangalore, Karnataka 560001<br />
                      India
                    </p>
                  </div>
                </div>

                <div className=\"flex items-start space-x-4\">
                  <div className=\"bg-gold-pale p-3 rounded-full\">
                    <Phone className=\"h-6 w-6 text-gold-metallic\" />
                  </div>
                  <div>
                    <h4 className=\"font-medium text-sapphire-deep mb-1\">Phone</h4>
                    <p className=\"text-neutral-stone\">+91 80 1234 5678</p>
                    <p className=\"text-neutral-stone\">+91 98765 43210</p>
                  </div>
                </div>

                <div className=\"flex items-start space-x-4\">
                  <div className=\"bg-gold-pale p-3 rounded-full\">
                    <Mail className=\"h-6 w-6 text-gold-metallic\" />
                  </div>
                  <div>
                    <h4 className=\"font-medium text-sapphire-deep mb-1\">Email</h4>
                    <p className=\"text-neutral-stone\">info@houseofneelam.com</p>
                    <p className=\"text-neutral-stone\">support@houseofneelam.com</p>
                  </div>
                </div>

                <div className=\"flex items-start space-x-4\">
                  <div className=\"bg-gold-pale p-3 rounded-full\">
                    <Clock className=\"h-6 w-6 text-gold-metallic\" />
                  </div>
                  <div>
                    <h4 className=\"font-medium text-sapphire-deep mb-1\">Business Hours</h4>
                    <p className=\"text-neutral-stone\">Monday - Saturday: 10:00 AM - 8:00 PM</p>
                    <p className=\"text-neutral-stone\">Sunday: 11:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className=\"bg-neutral-alabaster p-8\">
              <h3 className=\"font-display text-2xl text-sapphire-deep mb-6\">Send Us a Message</h3>
              <form className=\"space-y-4\">
                <div>
                  <label className=\"block text-sm font-medium text-sapphire-deep mb-2\">Your Name *</label>
                  <input
                    type=\"text\"
                    className=\"w-full px-4 py-3 border-b-2 border-neutral-stone/30 bg-transparent focus:border-gold-metallic outline-none transition-colors\"
                    placeholder=\"Enter your name\"
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-sapphire-deep mb-2\">Email Address *</label>
                  <input
                    type=\"email\"
                    className=\"w-full px-4 py-3 border-b-2 border-neutral-stone/30 bg-transparent focus:border-gold-metallic outline-none transition-colors\"
                    placeholder=\"your@email.com\"
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-sapphire-deep mb-2\">Phone Number</label>
                  <input
                    type=\"tel\"
                    className=\"w-full px-4 py-3 border-b-2 border-neutral-stone/30 bg-transparent focus:border-gold-metallic outline-none transition-colors\"
                    placeholder=\"+91 98765 43210\"
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-sapphire-deep mb-2\">Message *</label>
                  <textarea
                    rows=\"4\"
                    className=\"w-full px-4 py-3 border-b-2 border-neutral-stone/30 bg-transparent focus:border-gold-metallic outline-none transition-colors\"
                    placeholder=\"Tell us how we can help you...\"
                  ></textarea>
                </div>
                <button
                  type=\"submit\"
                  className=\"w-full bg-gold-metallic text-white py-4 font-medium hover:bg-gold-matte transition-all active:scale-98\"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;