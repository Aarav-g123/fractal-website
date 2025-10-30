import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { DomainColoringViz } from './visualizations/DomainColoringViz';
import { VectorFieldViz } from './visualizations/VectorFieldViz';
import { ThreeDPlotViz } from './visualizations/ThreeDPlotViz';
import { ZWPlaneViz } from './visualizations/ZWPlaneViz';
import { RiemannSphereViz } from './visualizations/RiemannSphereViz';
import domainZSquared from '@/assets/examples/domain-z-squared.png';
import domainExp from '@/assets/examples/domain-exp.png';
import domainSin from '@/assets/examples/domain-sin.png';
import domainMobius from '@/assets/examples/domain-mobius.png';
import threeDExample from '@/assets/examples/3d-plot-example.png';
import vectorExample from '@/assets/examples/vector-field-example.png';

const VisualizationMethods = () => {
  return (
    <section className="container py-12 px-4">
      <Tabs defaultValue="domain" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="domain">Domain Coloring</TabsTrigger>
          <TabsTrigger value="3d">3D Plots</TabsTrigger>
          <TabsTrigger value="vector">Vector Fields</TabsTrigger>
          <TabsTrigger value="zw">z-w Planes</TabsTrigger>
          <TabsTrigger value="riemann">Riemann Sphere</TabsTrigger>
        </TabsList>

        <TabsContent value="domain" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <DomainColoringViz />
            </div>
            <div className="space-y-4">
              <Card className="p-6 bg-card/50 border-border">
                <h3 className="text-2xl font-semibold mb-4">Domain Coloring</h3>
                <p className="text-muted-foreground mb-4">
                  Domain coloring encodes both the <strong>argument</strong> (angle) and <strong>magnitude</strong> 
                  of a complex function's output using color. The hue represents the argument, cycling through the 
                  color wheel, while brightness represents magnitude.
                </p>
                <h4 className="font-semibold mb-2">Key Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Zeros appear as points where all colors meet</li>
                  <li>Poles show up as bright spots with all colors radiating</li>
                  <li>Branch cuts visible as discontinuities in color</li>
                  <li>Conformal maps preserve local angles (colors)</li>
                </ul>
              </Card>

              <Card className="p-6 bg-card/50 border-border">
                <h4 className="font-semibold mb-3">Notable Examples</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <img src={domainZSquared} alt="f(z) = z^2" className="w-full rounded border border-border mb-2" />
                    <p className="text-xs text-center text-muted-foreground">f(z) = z²</p>
                  </div>
                  <div>
                    <img src={domainExp} alt="f(z) = e^z" className="w-full rounded border border-border mb-2" />
                    <p className="text-xs text-center text-muted-foreground">f(z) = eᶻ</p>
                  </div>
                  <div>
                    <img src={domainSin} alt="f(z) = sin(z)" className="w-full rounded border border-border mb-2" />
                    <p className="text-xs text-center text-muted-foreground">f(z) = sin(z)</p>
                  </div>
                  <div>
                    <img src={domainMobius} alt="Möbius transformation" className="w-full rounded border border-border mb-2" />
                    <p className="text-xs text-center text-muted-foreground">Möbius: (z-i)/(z+i)</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="3d" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <ThreeDPlotViz />
            </div>
            <div className="space-y-4">
              <Card className="p-6 bg-card/50 border-border">
                <h3 className="text-2xl font-semibold mb-4">3D Surface Plots</h3>
                <p className="text-muted-foreground mb-4">
                  Since complex functions map ℂ → ℂ (4 real dimensions), we can't directly plot them in 3D. 
                  Instead, we plot either the <strong>magnitude |f(z)|</strong>, the <strong>real part Re(f(z))</strong>, 
                  or the <strong>imaginary part Im(f(z))</strong> as a surface over the complex plane.
                </p>
                <h4 className="font-semibold mb-2">Applications:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Visualize behavior of analytic functions</li>
                  <li>Identify maxima, minima, and saddle points</li>
                  <li>Study harmonic functions (Re and Im parts)</li>
                  <li>Understand conformal mappings geometrically</li>
                </ul>
              </Card>

              <Card className="p-6 bg-card/50 border-border">
                <h4 className="font-semibold mb-3">Example Surfaces</h4>
                <div>
                  <img src={threeDExample} alt="3D plot example" className="w-full rounded border border-border mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <strong>f(z) = z²:</strong> The magnitude surface shows how the function grows quadratically 
                    away from the origin, with a clear minimum at z = 0.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vector" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <VectorFieldViz />
            </div>
            <div className="space-y-4">
              <Card className="p-6 bg-card/50 border-border">
                <h3 className="text-2xl font-semibold mb-4">Vector Fields</h3>
                <p className="text-muted-foreground mb-4">
                  Vector field plots represent f(z) as a vector at each point in the complex plane. 
                  The <strong>direction</strong> and <strong>length</strong> of each arrow show where the 
                  function maps that point and how much it stretches or shrinks the neighborhood.
                </p>
                <h4 className="font-semibold mb-2">What to Look For:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong>Sources:</strong> Points where vectors radiate outward</li>
                  <li><strong>Sinks:</strong> Points where vectors converge inward</li>
                  <li><strong>Vortices:</strong> Circular or spiral flow patterns</li>
                  <li><strong>Saddle points:</strong> Points where flow changes direction</li>
                </ul>
              </Card>

              <Card className="p-6 bg-card/50 border-border">
                <h4 className="font-semibold mb-3">Example: Flow Patterns</h4>
                <div>
                  <img src={vectorExample} alt="Vector field example" className="w-full rounded border border-border mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Vector fields are particularly useful for studying <strong>fluid flow</strong> and 
                    <strong> electromagnetic fields</strong>, where complex analysis provides exact solutions.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="zw" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <ZWPlaneViz />
            </div>
            <div className="space-y-4">
              <Card className="p-6 bg-card/50 border-border">
                <h3 className="text-2xl font-semibold mb-4">z-w Plane Visualization</h3>
                <p className="text-muted-foreground mb-4">
                  The <strong>z-w plane method</strong> shows two separate complex planes side-by-side: 
                  the <strong>domain (z-plane)</strong> and the <strong>codomain (w-plane)</strong>. 
                  This visualizes how regions and curves in the z-plane are mapped to corresponding regions 
                  in the w-plane under the transformation w = f(z).
                </p>
                <h4 className="font-semibold mb-2">Why Use This Method?</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Conformal Mappings:</strong> See how analytic functions preserve angles locally</li>
                  <li><strong>Image of Regions:</strong> Understand where circles, lines, and regions map to</li>
                  <li><strong>Möbius Transformations:</strong> Visualize how circles map to circles/lines</li>
                  <li><strong>Boundary Value Problems:</strong> Map complex regions to simpler shapes</li>
                </ul>
              </Card>
              <Card className="p-6 bg-card/50 border-border">
                <h4 className="font-semibold mb-2">Notable Examples</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>f(z) = z²:</strong> Lines through origin → parabolas, circles → circles</li>
                  <li><strong>f(z) = 1/z:</strong> Inversion - circles through origin → lines</li>
                  <li><strong>f(z) = eᶻ:</strong> Horizontal lines → circles, vertical lines → rays</li>
                </ul>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="riemann" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <RiemannSphereViz />
            </div>
            <div className="space-y-4">
              <Card className="p-6 bg-card/50 border-border">
                <h3 className="text-2xl font-semibold mb-4">The Riemann Sphere</h3>
                <p className="text-muted-foreground mb-4">
                  The <strong>Riemann sphere</strong> is a geometric representation of the extended complex plane 
                  ℂ ∪ {'{'}∞{'}'}. It's formed by <strong>stereographic projection</strong>: placing a sphere 
                  on the complex plane and projecting each point onto the sphere from the north pole.
                </p>
                <h4 className="font-semibold mb-2">Key Concepts:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Point at Infinity:</strong> The north pole represents ∞, completing the complex plane</li>
                  <li><strong>Meromorphic Functions:</strong> Functions with poles are continuous on the Riemann sphere</li>
                  <li><strong>Möbius Transformations:</strong> Bijections of the Riemann sphere to itself</li>
                  <li><strong>Compactification:</strong> Makes many theorems cleaner</li>
                </ul>
              </Card>
              <Card className="p-6 bg-card/50 border-border">
                <h4 className="font-semibold mb-2">Stereographic Projection Formula</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  A point z = x + iy in ℂ maps to (X, Y, Z) on the unit sphere:
                </p>
                <div className="bg-background/50 p-3 rounded font-mono text-xs text-foreground">
                  X = 2x/(x²+y²+1)<br/>
                  Y = 2y/(x²+y²+1)<br/>
                  Z = (x²+y²-1)/(x²+y²+1)
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default VisualizationMethods;
