import { useEffect, useRef, useState } from 'react';
import { Complex } from '@/lib/complex';
import { ComplexParser } from '@/lib/complexParser';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const DomainColoringViz = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formula, setFormula] = useState('z^2');
  const [rendering, setRendering] = useState(false);

  const render = () => {
    if (!canvasRef.current) return;
    setRendering(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const fn = ComplexParser.parse(formula);
    const range = 2;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x = (px / width - 0.5) * 2 * range;
        const y = (py / height - 0.5) * 2 * range;
        
        const z = new Complex(x, -y);
        const w = fn(z);
        
        // Domain coloring: hue from argument, lightness from magnitude
        const arg = Math.atan2(w.im, w.re);
        const mag = w.abs();
        
        const hue = ((arg / Math.PI + 1) * 180) % 360;
        const lightness = Math.min(100, 50 + Math.log(1 + mag) * 20);
        
        const [r, g, b] = hslToRgb(hue, 100, lightness);
        
        const index = (py * width + px) * 4;
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    setRendering(false);
  };

  useEffect(() => {
    render();
  }, []);

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/50 border-border">
        <div className="space-y-4">
          <div>
            <Label htmlFor="domain-formula">Function f(z)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="domain-formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., z^2, exp(z), sin(z), 1/z"
              />
              <Button onClick={render} disabled={rendering}>
                {rendering ? 'Rendering...' : 'Render'}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p><strong>Supported functions:</strong> z^n, exp(z), sin(z), cos(z), tan(z), log(z), sqrt(z), 1/z</p>
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
        <h4 className="font-semibold mb-2">Understanding Domain Coloring</h4>
        <p className="text-sm text-muted-foreground">
          Domain coloring visualizes complex functions by encoding both the <strong>argument</strong> (angle) 
          and <strong>magnitude</strong> of the output as color. The hue represents the argument 
          (cycling through the rainbow), while brightness represents magnitude.
        </p>
      </Card>
    </div>
  );
};

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4))
  ];
}
