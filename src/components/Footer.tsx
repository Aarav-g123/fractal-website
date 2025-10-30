const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 gradient-primary bg-clip-text text-transparent">
              Complex Analysis Explorer
            </h3>
            <p className="text-muted-foreground">
              An interactive platform for learning and visualizing complex analysis concepts through fractals.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#learn" className="hover:text-primary transition-smooth">Learn Complex Analysis</a></li>
              <li><a href="#explorer" className="hover:text-primary transition-smooth">Fractal Explorer</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <p className="text-muted-foreground">
              Built with passion for mathematics and interactive learning. 
              Explore the infinite beauty of complex numbers.
            </p>
          </div>
        </div>
        
        <div className="text-center text-muted-foreground border-t border-border pt-8">
          <p>&copy; 2025 Complex Analysis Explorer. Built for students and math enthusiasts.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
