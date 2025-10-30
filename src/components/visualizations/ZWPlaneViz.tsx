import { useEffect, useRef, useState } from 'react';
import { Complex } from '@/lib/complex';
import { ComplexParser } from '@/lib/complexParser';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const ZWPlaneViz = () => {
  const zCanvasRef = useRef<HTMLCanvasElement>(null);
  const wCanvasRef = useRef<HTMLCanvasElement>(null);
  const [formula, setFormula] = useState('z^2');
  const [rendering, setRendering] = useState(false);

  const render = () => {
    if (!zCanvasRef.current || !wCanvasRef.current) return;
    setRendering(true);

    const zCanvas = zCanvasRef.current;
    const wCanvas = wCanvasRef.current;
    const zCtx = zCanvas.getContext('2d');
    const wCtx = wCanvas.getContext('2d');
    if (!zCtx || !wCtx) return;

    const fn = ComplexParser.parse(formula);
    const width = 400;
    const height = 400;
    const range = 2;

    // Clear both canvases
    zCtx.clearRect(0, 0, width, height);
    wCtx.clearRect(0, 0, width, height);

    // Draw axes on both planes
    drawAxes(zCtx, width, height);
    drawAxes(wCtx, width, height);

    // Draw grid on z-plane
    zCtx.strokeStyle = 'rgba(100, 100, 255, 0.3)';
    zCtx.lineWidth = 1;
    
    // Vertical lines
    for (let i = -2; i <= 2; i++) {
      const x = width / 2 + (i / range) * width / 2;
      zCtx.beginPath();
      zCtx.moveTo(x, 0);
      zCtx.lineTo(x, height);
      zCtx.stroke();
    }
    
    // Horizontal lines
    for (let i = -2; i <= 2; i++) {
      const y = height / 2 - (i / range) * height / 2;
      zCtx.beginPath();
      zCtx.moveTo(0, y);
      zCtx.lineTo(width, y);
      zCtx.stroke();
    }

    // Map the grid to w-plane
    wCtx.strokeStyle = 'rgba(100, 255, 100, 0.5)';
    wCtx.lineWidth = 2;
    
    const resolution = 50;
    
    // Map vertical lines
    for (let i = -2; i <= 2; i++) {
      wCtx.beginPath();
      let started = false;
      for (let j = 0; j <= resolution; j++) {
        const x = i;
        const y = -range + (j / resolution) * 2 * range;
        const z = new Complex(x, y);
        const w = fn(z);
        
        const px = width / 2 + (w.re / range) * width / 2;
        const py = height / 2 - (w.im / range) * height / 2;
        
        if (!started) {
          wCtx.moveTo(px, py);
          started = true;
        } else {
          wCtx.lineTo(px, py);
        }
      }
      wCtx.stroke();
    }
    
    // Map horizontal lines
    for (let i = -2; i <= 2; i++) {
      wCtx.beginPath();
      let started = false;
      for (let j = 0; j <= resolution; j++) {
        const x = -range + (j / resolution) * 2 * range;
        const y = i;
        const z = new Complex(x, y);
        const w = fn(z);
        
        const px = width / 2 + (w.re / range) * width / 2;
        const py = height / 2 - (w.im / range) * height / 2;
        
        if (!started) {
          wCtx.moveTo(px, py);
          started = true;
        } else {
          wCtx.lineTo(px, py);
        }
      }
      wCtx.stroke();
    }

    // Draw a circle in z-plane and its image in w-plane
    const circleRadius = 0.5;
    zCtx.strokeStyle = 'rgba(255, 100, 255, 0.8)';
    zCtx.lineWidth = 2;
    zCtx.beginPath();
    zCtx.arc(width / 2, height / 2, (circleRadius / range) * width / 2, 0, 2 * Math.PI);
    zCtx.stroke();

    // Map circle to w-plane
    wCtx.strokeStyle = 'rgba(255, 100, 255, 0.8)';
    wCtx.lineWidth = 2;
    wCtx.beginPath();
    let started = false;
    for (let i = 0; i <= 100; i++) {
      const theta = (i / 100) * 2 * Math.PI;
      const z = new Complex(circleRadius * Math.cos(theta), circleRadius * Math.sin(theta));
      const w = fn(z);
      
      const px = width / 2 + (w.re / range) * width / 2;
      const py = height / 2 - (w.im / range) * height / 2;
      
      if (!started) {
        wCtx.moveTo(px, py);
        started = true;
      } else {
        wCtx.lineTo(px, py);
      }
    }
    wCtx.closePath();
    wCtx.stroke();

    setRendering(false);
  };

  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
  };

  useEffect(() => {
    render();
  }, []);

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/50 border-border">
        <div className="space-y-4">
          <div>
            <Label htmlFor="zw-formula">Function f(z)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="zw-formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., z^2, exp(z), 1/z"
              />
              <Button onClick={render} disabled={rendering}>
                {rendering ? 'Rendering...' : 'Render'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-center font-semibold mb-2">z-plane (Domain)</h4>
          <canvas
            ref={zCanvasRef}
            width={400}
            height={400}
            className="w-full border border-border rounded-lg bg-background"
          />
        </div>
        <div>
          <h4 className="text-center font-semibold mb-2">w-plane (Codomain)</h4>
          <canvas
            ref={wCanvasRef}
            width={400}
            height={400}
            className="w-full border border-border rounded-lg bg-background"
          />
        </div>
      </div>

      <Card className="p-4 bg-card/50 border-border">
        <h4 className="font-semibold mb-2">Understanding z-w Planes</h4>
        <p className="text-sm text-muted-foreground">
          The blue grid shows the domain (z-plane), and the green curves show where it maps in the codomain (w-plane). 
          The purple circle and its image demonstrate how regions transform under f(z).
        </p>
      </Card>
    </div>
  );
};
