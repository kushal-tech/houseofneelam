import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Gem } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1603739592187-716a8aafb22c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwyfHxibGFjayUyMG1hcmJsZSUyMGdvbGQlMjB0ZXh0dXJlfGVufDB8fHx8MTc3MjAyMTM2MXww&ixlib=rb-4.1.0&q=85)',
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 bg-sapphire-deep/60"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight">
            Timeless Elegance,
            <br />
            <span className="text-gold-metallic">Royal Heritage</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 font-light tracking-wide">
            Exquisite jewellery crafted with artisanal perfection for moments that matter
          </p>
          <Link
            to="/products"
            className="inline-block bg-gold-metallic text-white px-12 py-4 text-lg font-medium hover:bg-gold-matte transition-all active:scale-98"
            data-testid="explore-collection-btn"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto" data-testid="features-section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-pale rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-gold-metallic" />
            </div>
            <h3 className="font-display text-2xl text-sapphire-deep">Artisanal Craft</h3>
            <p className="text-neutral-stone leading-relaxed">
              Each piece is meticulously crafted by master artisans with decades of experience
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-pale rounded-full mb-4">
              <Gem className="h-8 w-8 text-gold-metallic" />
            </div>
            <h3 className="font-display text-2xl text-sapphire-deep">Finest Materials</h3>
            <p className="text-neutral-stone leading-relaxed">
              We use only the highest quality gold, diamonds, and precious gemstones
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-pale rounded-full mb-4">
              <Shield className="h-8 w-8 text-gold-metallic" />
            </div>
            <h3 className="font-display text-2xl text-sapphire-deep">Lifetime Guarantee</h3>
            <p className="text-neutral-stone leading-relaxed">
              Every purchase comes with our promise of quality and authenticity
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Section */}
      <section className="py-24 bg-neutral-alabaster">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/30985153/pexels-photo-30985153.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Elegant jewellery showcase"
                className="w-full h-[600px] object-cover"
              />
            </div>
            <div className="space-y-6 px-8">
              <p className="text-xs uppercase tracking-widest text-gold-metallic font-medium">
                Our Story
              </p>
              <h2 className="font-display text-4xl lg:text-5xl text-sapphire-deep leading-tight">
                Three Generations of Excellence
              </h2>
              <p className="text-neutral-stone text-lg leading-relaxed">
                House of Neelam has been creating heirloom-quality jewellery since 1947. Our legacy is
                built on trust, craftsmanship, and an unwavering commitment to perfection.
              </p>
              <Link
                to="/products"
                className="inline-block border-2 border-gold-metallic text-sapphire-deep px-8 py-3 font-medium hover:bg-gold-metallic hover:text-white transition-all"
              >
                View Our Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;