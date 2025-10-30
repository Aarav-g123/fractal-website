import FractalExplorer from '@/components/FractalExplorer';

const Tools = () => {
  return (
    <div className="min-h-screen">
      <div className="container py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            Interactive Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experiment with fractals, iterations, and custom complex functions
          </p>
        </div>
      </div>
      <FractalExplorer />
    </div>
  );
};

export default Tools;
