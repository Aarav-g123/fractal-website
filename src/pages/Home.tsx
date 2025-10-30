import Hero from '@/components/Hero';
import { Card } from '@/components/ui/card';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Eye, BookOpen, Wrench } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Eye,
      title: 'Visualizations',
      description: 'Explore 5 powerful methods: domain coloring, 3D plots, vector fields, z-w planes, and Riemann sphere',
      link: '/visualizations',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BookOpen,
      title: 'Theory',
      description: 'Master the foundations: complex numbers, analytic functions, conformal maps, integration, and residues',
      link: '/theory',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Wrench,
      title: 'Interactive Tools',
      description: 'Experiment with fractals, Newton methods, Julia sets, and custom polynomial iterations',
      link: '/tools',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen">
      <Hero />
      
      <section className="container py-20 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What You'll Master</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform for learning and visualizing complex analysis
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <NavLink key={feature.title} to={feature.link} className="group">
              <Card className="p-6 h-full border-border bg-card/50 hover:bg-card transition-all hover:shadow-lg hover:scale-105 duration-300">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 flex items-center justify-between">
                  {feature.title}
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </Card>
            </NavLink>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
