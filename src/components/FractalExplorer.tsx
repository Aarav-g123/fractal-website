import { useEffect, useRef, useState } from 'react';
import { FractalRenderer, FractalType, ColorScheme } from '@/lib/fractalRenderer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const FractalExplorer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<FractalRenderer | null>(null);
  const [fractalType, setFractalType] = useState<FractalType>('mandelbrot');
  const [iterations, setIterations] = useState(100);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('classic');
  const [juliaRe, setJuliaRe] = useState(-0.4);
  const [juliaIm, setJuliaIm] = useState(0.6);
  const [zoom, setZoom] = useState(1);
  const [bounds, setBounds] = useState({
    xMin: -2.5,
    xMax: 1.5,
    yMin: -1.5,
    yMax: 1.5
  });

  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new FractalRenderer(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    renderFractal();
  }, [fractalType, iterations, colorScheme, juliaRe, juliaIm, bounds]);

  const renderFractal = () => {
    if (!rendererRef.current || !canvasRef.current) return;

    rendererRef.current.render({
      width: canvasRef.current.width,
      height: canvasRef.current.height,
      ...bounds,
      maxIterations: iterations,
      colorScheme,
      type: fractalType,
      juliaC: fractalType === 'julia' ? { re: juliaRe, im: juliaIm } : undefined
    });
  };

  const resetView = () => {
    const defaultBounds = {
      mandelbrot: { xMin: -2.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
      julia: { xMin: -2, xMax: 2, yMin: -2, yMax: 2 },
      'burning-ship': { xMin: -2.5, xMax: 1.5, yMin: -2, yMax: 0.5 },
      newton: { xMin: -2, xMax: 2, yMin: -2, yMax: 2 }
    };
    setBounds(defaultBounds[fractalType]);
    setZoom(1);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickX = bounds.xMin + (x / canvasRef.current.width) * (bounds.xMax - bounds.xMin);
    const clickY = bounds.yMin + (y / canvasRef.current.height) * (bounds.yMax - bounds.yMin);
    
    const rangeX = (bounds.xMax - bounds.xMin) / 4;
    const rangeY = (bounds.yMax - bounds.yMin) / 4;
    
    setBounds({
      xMin: clickX - rangeX,
      xMax: clickX + rangeX,
      yMin: clickY - rangeY,
      yMax: clickY + rangeY
    });
    setZoom(zoom * 2);
  };

  return (
    <section id="explorer" className="container py-20 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Interactive Explorer</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Click on the fractal to zoom in. Adjust parameters to explore infinite complexity.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6 gradient-card border-border">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onClick={handleCanvasClick}
              className="w-full h-auto rounded-lg cursor-crosshair border border-border shadow-subtle hover:shadow-glow transition-smooth"
            />
            <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
              <span className="text-sm font-semibold">Zoom: {zoom.toFixed(2)}x</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card border-border h-fit">
          <h3 className="text-2xl font-semibold mb-6">Controls</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Fractal Type</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={fractalType === 'mandelbrot' ? 'default' : 'outline'}
                  onClick={() => setFractalType('mandelbrot')}
                  className="w-full"
                >
                  Mandelbrot
                </Button>
                <Button
                  variant={fractalType === 'julia' ? 'default' : 'outline'}
                  onClick={() => setFractalType('julia')}
                  className="w-full"
                >
                  Julia
                </Button>
                <Button
                  variant={fractalType === 'burning-ship' ? 'default' : 'outline'}
                  onClick={() => setFractalType('burning-ship')}
                  className="w-full"
                >
                  Burning Ship
                </Button>
                <Button
                  variant={fractalType === 'newton' ? 'default' : 'outline'}
                  onClick={() => setFractalType('newton')}
                  className="w-full"
                >
                  Newton
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Iterations: {iterations}
              </label>
              <Slider
                value={[iterations]}
                onValueChange={(v) => setIterations(v[0])}
                min={50}
                max={500}
                step={10}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color Scheme</label>
              <Select value={colorScheme} onValueChange={(v) => setColorScheme(v as ColorScheme)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="ocean">Ocean</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="sunset">Sunset</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {fractalType === 'julia' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Julia Real: {juliaRe.toFixed(2)}
                  </label>
                  <Slider
                    value={[juliaRe * 100]}
                    onValueChange={(v) => setJuliaRe(v[0] / 100)}
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Julia Imaginary: {juliaIm.toFixed(2)}
                  </label>
                  <Slider
                    value={[juliaIm * 100]}
                    onValueChange={(v) => setJuliaIm(v[0] / 100)}
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>
              </>
            )}

            <Button onClick={resetView} variant="outline" className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset View
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FractalExplorer;
