import VisualizationMethods from '@/components/VisualizationMethods';

const Visualizations = () => {
  return (
    <div className="min-h-screen">
      <div className="container py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            Visualization Methods
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Five powerful techniques to visualize complex functions and develop geometric intuition
          </p>
        </div>
      </div>
      <VisualizationMethods />
    </div>
  );
};

export default Visualizations;
