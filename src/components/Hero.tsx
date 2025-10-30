const Hero = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden gradient-hero border-b border-border">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
      </div>
      
      <div className="container relative z-10 px-4 py-20 text-center animate-fade-up">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-primary bg-clip-text text-transparent">
          Complex Analysis Explorer
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Master complex analysis through rigorous theory and interactive visualizations. 
          Explore conformal mappings, analytic functions, and the geometric beauty of complex functions.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a 
            href="#visualize"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-smooth hover:shadow-glow hover:scale-105"
          >
            Explore Visualizations
          </a>
          <a 
            href="#foundations"
            className="px-8 py-3 bg-card text-card-foreground rounded-lg font-semibold border border-border transition-smooth hover:bg-secondary"
          >
            Learn Theory
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
