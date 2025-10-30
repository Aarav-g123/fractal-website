import { useEffect, useRef, useState } from 'react';
import { Complex } from '@/lib/complex';
import { ComplexParser } from '@/lib/complexParser';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PlotMode = 'magnitude' | 'real' | 'imaginary';

export const ThreeDPlotViz = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formula, setFormula] = useState('z^2');
  const [mode, setMode] = useState<PlotMode>('magnitude');
  const [rendering, setRendering] = useState(false);

  const render = () => {
    if (!canvasRef.current) return;
    setRendering(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const fn = ComplexParser.parse(formula);
    const range = 2;
    const resolution = 80;
    const cellWidth = canvas.width / resolution;
    const cellHeight = canvas.height / resolution;

    // Calculate heights for all points
    const heights: number[][] = [];
    let maxHeight = 0;

    for (let i = 0; i < resolution; i++) {
      heights[i] = [];
      for (let j = 0; j < resolution; j++) {
        const x = (i / resolution - 0.5) * 2 * range;
        const y = (j / resolution - 0.5) * 2 * range;
        
        const z = new Complex(x, -y);
        const w = fn(z);
        
        let h = 0;
        if (mode === 'magnitude') h = w.abs();
        else if (mode === 'real') h = w.re;
        else if (mode === 'imaginary') h = w.im;
        
        heights[i][j] = h;
        maxHeight = Math.max(maxHeight, Math.abs(h));
      }
    }

    // Render as a height map with simple 3D projection
    for (let i = 0; i < resolution - 1; i++) {
      for (let j = 0; j < resolution - 1; j++) {
        const h = heights[i][j];
        const normalizedH = h / (maxHeight || 1);
        
        // Simple isometric projection
        const iso_x = (i + j) * cellWidth * 0.5;
        const iso_y = (j - i) * cellHeight * 0.5 + canvas.height * 0.5 - normalizedH * 100;
        
        // Color based on height
        const hue = 220 + normalizedH * 60;
        const lightness = 30 + Math.abs(normalizedH) * 40;
        ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
        
        ctx.fillRect(iso_x, iso_y, cellWidth * 0.7, cellHeight * 0.7);
      }
    }

    setRendering(false);
  };

  useEffect(() => {
    render();
  }, [mode]);

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/50 border-border">
        <div className="space-y-4">
          <div>
            <Label htmlFor="3d-formula">Function f(z)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="3d-formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., z^2, exp(z)"
              />
              <Button onClick={render} disabled={rendering}>
                {rendering ? 'Rendering...' : 'Render'}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="plot-mode">Plot Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as PlotMode)}>
              <SelectTrigger id="plot-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="magnitude">|f(z)| (Magnitude)</SelectItem>
                <SelectItem value="real">Re(f(z)) (Real Part)</SelectItem>
                <SelectItem value="imaginary">Im(f(z)) (Imaginary Part)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="w-full border border-border rounded-lg bg-background"
      />

      <Card className="p-4 bg-card/50 border-border">
        <h4 className="font-semibold mb-2">Understanding 3D Plots</h4>
        <p className="text-sm text-muted-foreground">
          3D plots represent complex functions by plotting the <strong>magnitude</strong>, <strong>real part</strong>, 
          or <strong>imaginary part</strong> as height above the complex plane. This gives a surface view of the function's behavior.
        </p>
      </Card>
    </div>
  );
};
