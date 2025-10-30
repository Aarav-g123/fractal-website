import { Complex } from './complex';

export type ColorScheme = 'classic' | 'ocean' | 'fire' | 'sunset' | 'electric';
export type FractalType = 'mandelbrot' | 'julia' | 'burning-ship' | 'newton';

const COLOR_SCHEMES: Record<ColorScheme, number[][]> = {
  classic: [
    [0, 0, 0], [25, 7, 26], [9, 1, 47], [4, 4, 73], [0, 7, 100],
    [12, 44, 138], [24, 82, 177], [57, 125, 209], [134, 181, 229],
    [211, 236, 248], [241, 233, 191], [248, 201, 95], [255, 170, 0],
    [204, 128, 0], [153, 87, 0], [106, 52, 3]
  ],
  ocean: [
    [0, 5, 25], [0, 15, 50], [0, 30, 80], [0, 50, 120],
    [0, 80, 160], [20, 120, 200], [60, 160, 220], [100, 180, 240],
    [140, 200, 250], [180, 220, 255]
  ],
  fire: [
    [0, 0, 0], [20, 0, 0], [40, 0, 0], [80, 0, 0],
    [120, 20, 0], [160, 40, 0], [200, 80, 0], [240, 120, 0],
    [255, 160, 0], [255, 200, 50], [255, 240, 150]
  ],
  sunset: [
    [10, 5, 30], [30, 10, 50], [60, 20, 70], [100, 30, 80],
    [140, 50, 90], [180, 80, 100], [220, 120, 110], [255, 160, 120],
    [255, 200, 150], [255, 230, 200]
  ],
  electric: [
    [0, 0, 20], [10, 0, 40], [20, 10, 80], [40, 30, 120],
    [60, 60, 160], [100, 100, 200], [140, 140, 240], [180, 180, 255],
    [200, 200, 255], [220, 220, 255]
  ]
};

export interface FractalParams {
  width: number;
  height: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  maxIterations: number;
  colorScheme: ColorScheme;
  type: FractalType;
  juliaC?: { re: number; im: number };
}

export class FractalRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
  }

  private getColor(iterations: number, maxIterations: number, colorScheme: ColorScheme): string {
    if (iterations === maxIterations) return 'rgb(0, 0, 0)';
    
    const colors = COLOR_SCHEMES[colorScheme];
    const colorIndex = iterations % colors.length;
    const [r, g, b] = colors[colorIndex];
    return `rgb(${r}, ${g}, ${b})`;
  }

  private mandelbrot(c: Complex, maxIterations: number): number {
    let z = new Complex(0, 0);
    let iterations = 0;

    while (z.abs() <= 2 && iterations < maxIterations) {
      z = z.mul(z).add(c);
      iterations++;
    }

    return iterations;
  }

  private julia(z: Complex, c: Complex, maxIterations: number): number {
    let iterations = 0;

    while (z.abs() <= 2 && iterations < maxIterations) {
      z = z.mul(z).add(c);
      iterations++;
    }

    return iterations;
  }

  private burningShip(c: Complex, maxIterations: number): number {
    let z = new Complex(0, 0);
    let iterations = 0;

    while (z.abs() <= 2 && iterations < maxIterations) {
      z = new Complex(Math.abs(z.re), Math.abs(z.im));
      z = z.mul(z).add(c);
      iterations++;
    }

    return iterations;
  }

  private newton(z: Complex, maxIterations: number): number {
    const epsilon = 0.0001;
    let iterations = 0;

    while (iterations < maxIterations) {
      // f(z) = z^3 - 1
      const fz = z.pow(3).sub(new Complex(1, 0));
      
      if (fz.abs() < epsilon) break;

      // f'(z) = 3z^2
      const fpz = z.pow(2).mul(new Complex(3, 0));
      
      // Newton's method: z_new = z - f(z)/f'(z)
      z = z.sub(fz.div(fpz));
      iterations++;
    }

    return iterations;
  }

  render(params: FractalParams): void {
    const { width, height, xMin, xMax, yMin, yMax, maxIterations, colorScheme, type, juliaC } = params;
    
    this.canvas.width = width;
    this.canvas.height = height;

    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x = xMin + (px / width) * (xMax - xMin);
        const y = yMin + (py / height) * (yMax - yMin);

        let iterations: number;

        switch (type) {
          case 'mandelbrot':
            iterations = this.mandelbrot(new Complex(x, y), maxIterations);
            break;
          case 'julia':
            const c = juliaC ? new Complex(juliaC.re, juliaC.im) : new Complex(-0.4, 0.6);
            iterations = this.julia(new Complex(x, y), c, maxIterations);
            break;
          case 'burning-ship':
            iterations = this.burningShip(new Complex(x, y), maxIterations);
            break;
          case 'newton':
            iterations = this.newton(new Complex(x, y), maxIterations);
            break;
          default:
            iterations = maxIterations;
        }

        const color = this.getColor(iterations, maxIterations, colorScheme);
        const rgb = color.match(/\d+/g)!.map(Number);

        const index = (py * width + px) * 4;
        data[index] = rgb[0];
        data[index + 1] = rgb[1];
        data[index + 2] = rgb[2];
        data[index + 3] = 255;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }
}
