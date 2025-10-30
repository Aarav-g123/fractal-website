import LearningSection from '@/components/LearningSection';

const Theory = () => {
  return (
    <div className="min-h-screen">
      <div className="container py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            Complex Analysis Theory
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Build a rigorous foundation in complex function theory
          </p>
        </div>
      </div>
      <LearningSection />
    </div>
  );
};

export default Theory;
