import { useEffect, useRef, useState } from 'react';
import { Complex } from '@/lib/complex';
import { ComplexParser } from '@/lib/complexParser';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const VectorFieldViz = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formula, setFormula] = useState('z');
  const [rendering, setRendering] = useState(false);

  const render = () => {
    if (!canvasRef.current) return;
    setRendering(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const fn = ComplexParser.parse(formula);
    const range = 3;
    const gridSize = 20;
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i / gridSize - 0.5) * 2 * range;
        const y = (j / gridSize - 0.5) * 2 * range;
        
        const z = new Complex(x, -y);
        const w = fn(z);
        
        const px = (i + 0.5) * cellWidth;
        const py = (j + 0.5) * cellHeight;
        
        // Normalize vector for display
        const mag = w.abs();
        const scale = Math.min(cellWidth * 0.4, mag * cellWidth * 0.4);
        
        const dx = (w.re / (mag || 1)) * scale;
        const dy = (-w.im / (mag || 1)) * scale;
        
        // Color based on magnitude
        const hue = (Math.log(1 + mag) * 60) % 360;
        ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.lineWidth = 2;
        
        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + dx, py + dy);
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(dy, dx);
        const headLength = 8;
        ctx.beginPath();
        ctx.moveTo(px + dx, py + dy);
        ctx.lineTo(
          px + dx - headLength * Math.cos(angle - Math.PI / 6),
          py + dy - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          px + dx - headLength * Math.cos(angle + Math.PI / 6),
          py + dy - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.lineTo(px + dx, py + dy);
        ctx.fill();
      }
    }

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
            <Label htmlFor="vector-formula">Function f(z)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="vector-formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., z, z^2, 1/z"
              />
              <Button onClick={render} disabled={rendering}>
                {rendering ? 'Rendering...' : 'Render'}
              </Button>
            </div>
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
        <h4 className="font-semibold mb-2">Understanding Vector Fields</h4>
        <p className="text-sm text-muted-foreground">
          Vector fields show the <strong>direction and magnitude</strong> of a complex function at each point. 
          Each arrow represents the output value f(z) at that point z in the complex plane.
          Colors indicate magnitude.
        </p>
      </Card>
    </div>
  );
};
