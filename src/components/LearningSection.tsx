import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LearningSection = () => {
  return (
    <section id="foundations" className="container py-20 px-4 bg-muted/20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Foundations of Complex Analysis</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Master the fundamental concepts that underpin complex function theory
        </p>
      </div>

      <Tabs defaultValue="complex" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="complex">Complex Numbers</TabsTrigger>
          <TabsTrigger value="analytic">Analytic Functions</TabsTrigger>
          <TabsTrigger value="conformal">Conformal Maps</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="residues">Residues</TabsTrigger>
          <TabsTrigger value="fractals">Fractals</TabsTrigger>
        </TabsList>

        <TabsContent value="complex" className="mt-6">
          <Card className="p-8 gradient-card border-border">
            <h3 className="text-2xl font-semibold mb-4">What are Complex Numbers?</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                A complex number is a number that can be expressed in the form <strong className="text-foreground">z = a + bi</strong>, 
                where <strong className="text-foreground">a</strong> and <strong className="text-foreground">b</strong> are real numbers, 
                and <strong className="text-foreground">i</strong> is the imaginary unit satisfying i² = -1.
              </p>
              <p>
                Complex numbers extend the real number system and allow us to find solutions to equations 
                that have no real solutions, such as x² + 1 = 0.
              </p>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Key Operations:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">Addition:</strong> (a + bi) + (c + di) = (a + c) + (b + d)i</li>
                  <li><strong className="text-foreground">Multiplication:</strong> (a + bi)(c + di) = (ac - bd) + (ad + bc)i</li>
                  <li><strong className="text-foreground">Magnitude:</strong> |z| = √(a² + b²)</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytic" className="mt-6">
          <Card className="p-8 gradient-card border-border">
            <h3 className="text-2xl font-semibold mb-4">Analytic Functions</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                A function f: ℂ → ℂ is <strong className="text-foreground">analytic</strong> (or <strong className="text-foreground">holomorphic</strong>) 
                at a point z₀ if it is <strong className="text-foreground">complex differentiable</strong> in a neighborhood of z₀.
              </p>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Cauchy-Riemann Equations:</h4>
                <p className="mb-2">
                  For f(z) = f(x + iy) = u(x,y) + iv(x,y) to be analytic, the real and imaginary parts must satisfy:
                </p>
                <div className="bg-background/50 p-3 rounded font-mono text-sm text-foreground">
                  ∂u/∂x = ∂v/∂y &nbsp;&nbsp; and &nbsp;&nbsp; ∂u/∂y = -∂v/∂x
                </div>
              </div>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Examples of Analytic Functions:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">Polynomials:</strong> p(z) = aₙzⁿ + ... + a₁z + a₀</li>
                  <li><strong className="text-foreground">Exponential:</strong> eᶻ = eˣ(cos y + i sin y)</li>
                  <li><strong className="text-foreground">Trigonometric:</strong> sin z, cos z, tan z</li>
                  <li><strong className="text-foreground">Logarithm:</strong> log z (with branch cuts)</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="conformal" className="mt-6">
          <Card className="p-8 gradient-card border-border">
            <h3 className="text-2xl font-semibold mb-4">Conformal Mappings</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                A <strong className="text-foreground">conformal mapping</strong> is a function that preserves 
                angles locally. Any analytic function with f'(z) ≠ 0 is conformal at z.
              </p>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Key Properties:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">Angle Preservation:</strong> If two curves meet at angle θ in the domain, their images meet at the same angle</li>
                  <li><strong className="text-foreground">Local Shape Preservation:</strong> Infinitesimal shapes are preserved (up to rotation and scaling)</li>
                  <li><strong className="text-foreground">Harmonic Functions:</strong> Conformal maps transform harmonic functions to harmonic functions</li>
                </ul>
              </div>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Important Conformal Maps:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">Möbius Transformations:</strong> f(z) = (az + b)/(cz + d), where ad - bc ≠ 0</li>
                  <li><strong className="text-foreground">Exponential Map:</strong> Maps horizontal strips to sectors</li>
                  <li><strong className="text-foreground">Joukowski Transform:</strong> z + 1/z, used in aerodynamics</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="mt-6">
          <Card className="p-8 gradient-card border-border">
            <h3 className="text-2xl font-semibold mb-4">Complex Integration</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Complex integration extends real line integrals to paths in the complex plane. 
                The fundamental result is <strong className="text-foreground">Cauchy's Integral Theorem</strong>.
              </p>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Cauchy's Integral Theorem:</h4>
                <p className="mb-2">
                  If f is analytic in a simply connected domain D, and γ is a closed contour in D, then:
                </p>
                <div className="bg-background/50 p-3 rounded font-mono text-sm text-foreground text-center">
                  ∮<sub>γ</sub> f(z) dz = 0
                </div>
              </div>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Cauchy's Integral Formula:</h4>
                <p className="mb-2">
                  If f is analytic inside and on a simple closed contour γ, and z₀ is inside γ, then:
                </p>
                <div className="bg-background/50 p-3 rounded font-mono text-sm text-foreground text-center">
                  f(z₀) = (1/2πi) ∮<sub>γ</sub> f(z)/(z - z₀) dz
                </div>
                <p className="mt-2 text-sm">
                  This remarkable formula says that the value of an analytic function at any interior point 
                  is completely determined by its values on the boundary!
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="residues" className="mt-6">
          <Card className="p-8 gradient-card border-border">
            <h3 className="text-2xl font-semibold mb-4">Residue Theory</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                The <strong className="text-foreground">residue</strong> of a function at an isolated singularity 
                is the coefficient of the (z - z₀)⁻¹ term in its Laurent series expansion.
              </p>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Residue Theorem:</h4>
                <p className="mb-2">
                  If f is analytic inside and on a simple closed contour γ except for isolated singularities 
                  z₁, z₂, ..., zₙ inside γ, then:
                </p>
                <div className="bg-background/50 p-3 rounded font-mono text-sm text-foreground text-center">
                  ∮<sub>γ</sub> f(z) dz = 2πi Σ Res(f, z<sub>k</sub>)
                </div>
              </div>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Applications:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">Evaluate Real Integrals:</strong> Many difficult real integrals can be solved using residues</li>
                  <li><strong className="text-foreground">Sum Infinite Series:</strong> Residue theory can sum certain series exactly</li>
                  <li><strong className="text-foreground">Physics & Engineering:</strong> Used in signal processing, quantum mechanics, and fluid dynamics</li>
                </ul>
              </div>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Example:</h4>
                <p className="text-sm">
                  To evaluate ∫₋∞^∞ dx/(1 + x²), consider f(z) = 1/(1 + z²) with simple poles at z = ±i. 
                  The residue at z = i is 1/(2i), so the integral equals 2πi · (1/2i) = π.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="fractals" className="mt-6">
          <Card className="p-8 gradient-card border-border">
            <h3 className="text-2xl font-semibold mb-4">What Makes a Fractal?</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                A fractal is a geometric shape that exhibits <strong className="text-foreground">self-similarity</strong>—
                it looks similar at any scale you examine it. Fractals have infinite complexity and are 
                generated through simple iterative processes.
              </p>
              <div className="bg-card/50 p-4 rounded-lg border border-border mt-4">
                <h4 className="font-semibold text-foreground mb-2">Properties of Fractals:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">Self-similarity:</strong> Patterns repeat at different scales</li>
                  <li><strong className="text-foreground">Infinite detail:</strong> Zooming reveals ever more complexity</li>
                  <li><strong className="text-foreground">Fractional dimension:</strong> Not 1D, 2D, or 3D, but somewhere in between</li>
                  <li><strong className="text-foreground">Simple rules:</strong> Complex patterns from simple iterative processes</li>
                </ul>
              </div>
              <p className="mt-4">
                Fractals appear throughout nature—in coastlines, clouds, trees, rivers, and even galaxies. 
                They bridge mathematics and the natural world in beautiful ways.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default LearningSection;
