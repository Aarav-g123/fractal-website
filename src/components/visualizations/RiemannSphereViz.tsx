import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export const RiemannSphereViz = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const render = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;

    // Calculate rotation matrices
    const rotRad = (rotation * Math.PI) / 180;
    const tiltRad = (tilt * Math.PI) / 180;

    // Draw sphere outline
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw latitude lines
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let lat = -60; lat <= 60; lat += 30) {
      const latRad = (lat * Math.PI) / 180;
      const r = Math.cos(latRad) * radius;
      const yOffset = Math.sin(latRad) * radius;
      
      ctx.beginPath();
      for (let lon = 0; lon <= 360; lon += 5) {
        const lonRad = (lon * Math.PI) / 180;
        let x = r * Math.cos(lonRad);
        let y = yOffset;
        let z = r * Math.sin(lonRad);
        
        // Apply rotations
        const x2 = x * Math.cos(rotRad) - z * Math.sin(rotRad);
        const z2 = x * Math.sin(rotRad) + z * Math.cos(rotRad);
        const y2 = y * Math.cos(tiltRad) - z2 * Math.sin(tiltRad);
        
        const px = centerX + x2;
        const py = centerY - y2;
        
        if (lon === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Draw longitude lines
    for (let lon = 0; lon < 360; lon += 30) {
      const lonRad = (lon * Math.PI) / 180;
      ctx.beginPath();
      for (let lat = -90; lat <= 90; lat += 5) {
        const latRad = (lat * Math.PI) / 180;
        const r = Math.cos(latRad) * radius;
        let x = r * Math.cos(lonRad);
        let y = Math.sin(latRad) * radius;
        let z = r * Math.sin(lonRad);
        
        // Apply rotations
        const x2 = x * Math.cos(rotRad) - z * Math.sin(rotRad);
        const z2 = x * Math.sin(rotRad) + z * Math.cos(rotRad);
        const y2 = y * Math.cos(tiltRad) - z2 * Math.sin(tiltRad);
        
        const px = centerX + x2;
        const py = centerY - y2;
        
        if (lat === -90) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Draw north pole (infinity)
    let northX = 0;
    let northY = radius;
    let northZ = 0;
    const northX2 = northX * Math.cos(rotRad) - northZ * Math.sin(rotRad);
    const northZ2 = northX * Math.sin(rotRad) + northZ * Math.cos(rotRad);
    const northY2 = northY * Math.cos(tiltRad) - northZ2 * Math.sin(tiltRad);
    
    ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX + northX2, centerY - northY2, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Draw equator (unit circle in complex plane)
    ctx.strokeStyle = 'rgba(100, 255, 100, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let theta = 0; theta <= 360; theta += 5) {
      const thetaRad = (theta * Math.PI) / 180;
      let x = radius * Math.cos(thetaRad);
      let y = 0;
      let z = radius * Math.sin(thetaRad);
      
      // Apply rotations
      const x2 = x * Math.cos(rotRad) - z * Math.sin(rotRad);
      const z2 = x * Math.sin(rotRad) + z * Math.cos(rotRad);
      const y2 = y * Math.cos(tiltRad) - z2 * Math.sin(tiltRad);
      
      const px = centerX + x2;
      const py = centerY - y2;
      
      if (theta === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw some sample points
    const samplePoints = [
      { z: { re: 0, im: 0 }, label: '0' },
      { z: { re: 1, im: 0 }, label: '1' },
      { z: { re: 0, im: 1 }, label: 'i' },
      { z: { re: -1, im: 0 }, label: '-1' },
    ];

    samplePoints.forEach((point) => {
      const { re, im } = point.z;
      const denom = 1 + re * re + im * im;
      let x = (2 * re * radius) / denom;
      let y = (2 * im * radius) / denom;
      let z = ((re * re + im * im - 1) * radius) / denom;
      
      // Apply rotations
      const x2 = x * Math.cos(rotRad) - z * Math.sin(rotRad);
      const z2 = x * Math.sin(rotRad) + z * Math.cos(rotRad);
      const y2 = y * Math.cos(tiltRad) - z2 * Math.sin(tiltRad);
      
      ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
      ctx.beginPath();
      ctx.arc(centerX + x2, centerY - y2, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '12px sans-serif';
      ctx.fillText(point.label, centerX + x2 + 8, centerY - y2 + 4);
    });
  };

  useEffect(() => {
    render();
  }, [rotation, tilt]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setRotation((r) => r + dx * 0.5);
    setTilt((t) => Math.max(-90, Math.min(90, t - dy * 0.5)));
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/50 border-border">
        <div className="space-y-4">
          <div>
            <Label>Rotation: {rotation.toFixed(0)}°</Label>
            <Slider
              value={[rotation]}
              onValueChange={(v) => setRotation(v[0])}
              min={0}
              max={360}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Tilt: {tilt.toFixed(0)}°</Label>
            <Slider
              value={[tilt]}
              onValueChange={(v) => setTilt(v[0])}
              min={-90}
              max={90}
              step={1}
              className="mt-2"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Drag the sphere to rotate it interactively
          </p>
        </div>
      </Card>

      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="w-full border border-border rounded-lg bg-background cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <Card className="p-4 bg-card/50 border-border">
        <h4 className="font-semibold mb-2">Understanding the Riemann Sphere</h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li><strong className="text-foreground">Red point (top):</strong> The point at infinity ∞</li>
          <li><strong className="text-foreground">Green circle:</strong> The unit circle |z| = 1 in the complex plane</li>
          <li><strong className="text-foreground">Yellow points:</strong> Notable complex numbers (0, 1, i, -1)</li>
          <li><strong className="text-foreground">Stereographic projection:</strong> Maps ℂ → sphere with ∞ at north pole</li>
        </ul>
      </Card>
    </div>
  );
};
