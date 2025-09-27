class FractalRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setCanvasSize();
        
        this.isRendering = false;
        this.zoomStack = [];
        this.zoomLevel = 1;
        
        // Default settings
        this.iterations = 100;
        this.colorScheme = 'classic';
        
        this.resetView();
        this.initEventListeners();
    }

    setCanvasSize() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, 600);
        this.canvas.width = size;
        this.canvas.height = size;
    }

    resetView() {
        this.xmin = -2;
        this.xmax = 2;
        this.ymin = -2;
        this.ymax = 2;
        this.zoomStack = [];
        this.zoomLevel = 1;
        this.updateZoomInfo();
    }

    initEventListeners() {
        let isDragging = false;
        let startX, startY;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.offsetX;
            startY = e.offsetY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            this.drawSelectionBox(startX, startY, e.offsetX, e.offsetY);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const width = Math.abs(e.offsetX - startX);
            const height = Math.abs(e.offsetY - startY);
            
            if (width > 10 && height > 10) {
                this.zoomToSelection(startX, startY, e.offsetX, e.offsetY);
            }
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        });

        window.addEventListener('resize', () => {
            this.setCanvasSize();
            this.draw();
        });
    }

    zoomToSelection(x1, y1, x2, y2) {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        
        this.zoomStack.push({ 
            xmin: this.xmin, 
            xmax: this.xmax, 
            ymin: this.ymin, 
            ymax: this.ymax 
        });
        
        const newXmin = this.xmin + (minX / this.canvas.width) * (this.xmax - this.xmin);
        const newXmax = this.xmin + (maxX / this.canvas.width) * (this.xmax - this.xmin);
        const newYmin = this.ymin + (minY / this.canvas.height) * (this.ymax - this.ymin);
        const newYmax = this.ymin + (maxY / this.canvas.height) * (this.ymax - this.ymin);
        
        this.xmin = newXmin;
        this.xmax = newXmax;
        this.ymin = newYmin;
        this.ymax = newYmax;
        
        this.zoomLevel = 4 / (this.xmax - this.xmin);
        this.updateZoomInfo();
    }

    drawSelectionBox(x1, y1, x2, y2) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();
        
        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.setLineDash([]);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(x, y, width, height);
    }

    zoomOut() {
        if (this.zoomStack.length === 0) return;
        
        const prev = this.zoomStack.pop();
        this.xmin = prev.xmin;
        this.xmax = prev.xmax;
        this.ymin = prev.ymin;
        this.ymax = prev.ymax;
        
        this.zoomLevel = 4 / (this.xmax - this.xmin);
        this.updateZoomInfo();
    }

    updateZoomInfo() {
        const zoomInfo = document.querySelector('.zoom-info');
        if (zoomInfo) {
            zoomInfo.textContent = `Zoom: ${this.zoomLevel.toFixed(2)}x`;
        }
    }

    // This will be overridden by specific fractal classes
    draw() {
        // Base class doesn't implement drawing
    }
}

class Mandelbrot extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
    }

    resetView() {
        this.xmin = -2.5;
        this.xmax = 1.5;
        this.ymin = -1.5;
        this.ymax = 1.5;
        this.zoomStack = [];
        this.zoomLevel = 1;
        this.updateZoomInfo();
    }

    draw() {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        const palette = this.getColorPalette();
        
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const cx = this.xmin + (x / this.canvas.width) * (this.xmax - this.xmin);
                const cy = this.ymin + (y / this.canvas.height) * (this.ymax - this.ymin);
                
                let zx = 0;
                let zy = 0;
                let iter = 0;
                
                while (iter < this.iterations && zx * zx + zy * zy < 4) {
                    const temp = zx * zx - zy * zy + cx;
                    zy = 2 * zx * zy + cy;
                    zx = temp;
                    iter++;
                }
                
                const color = this.getColor(iter, palette);
                const idx = (y * this.canvas.width + x) * 4;
                data[idx] = color[0];
                data[idx + 1] = color[1];
                data[idx + 2] = color[2];
                data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    getColorPalette() {
        const schemes = {
            classic: [
                [0,0,0], [25,7,26], [9,1,47], [4,4,73], [0,7,100],
                [12,44,138], [24,82,177], [57,125,209], [134,181,229],
                [211,236,248], [241,233,191], [248,201,95], [255,170,0],
                [204,128,0], [153,87,0], [106,52,3]
            ],
            blue: [
                [0,7,33], [0,20,73], [0,33,113], [0,46,153],
                [0,59,193], [0,72,233], [20,95,255], [60,130,255],
                [100,165,255], [140,200,255], [180,220,255], [220,240,255]
            ],
            fire: [
                [0,0,0], [50,0,0], [100,10,0], [150,25,0],
                [200,50,0], [255,75,10], [255,100,25], [255,125,50],
                [255,150,75], [255,175,100], [255,200,125], [255,225,150]
            ],
            grayscale: Array.from({length: 16}, (_, i) => {
                const v = Math.floor((i/15)*255);
                return [v, v, v];
            })
        };
        
        return schemes[this.colorScheme] || schemes.classic;
    }

    getColor(iter, palette) {
        if (iter === this.iterations) return [0, 0, 0];
        const colorIndex = Math.floor((iter / this.iterations) * (palette.length - 1));
        return palette[colorIndex];
    }
}

class Julia extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
        this.cx = -0.4;
        this.cy = 0.6;
    }

    draw() {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        const palette = this.getColorPalette();
        
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                let zx = this.xmin + (x / this.canvas.width) * (this.xmax - this.xmin);
                let zy = this.ymin + (y / this.canvas.height) * (this.ymax - this.ymin);
                let iter = 0;
                
                while (iter < this.iterations && zx * zx + zy * zy < 4) {
                    const temp = zx * zx - zy * zy + this.cx;
                    zy = 2 * zx * zy + this.cy;
                    zx = temp;
                    iter++;
                }
                
                const color = this.getColor(iter, palette);
                const idx = (y * this.canvas.width + x) * 4;
                data[idx] = color[0];
                data[idx + 1] = color[1];
                data[idx + 2] = color[2];
                data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    getColorPalette() {
        // Same as Mandelbrot
        const schemes = {
            classic: [
                [0,0,0], [25,7,26], [9,1,47], [4,4,73], [0,7,100],
                [12,44,138], [24,82,177], [57,125,209], [134,181,229],
                [211,236,248], [241,233,191], [248,201,95], [255,170,0],
                [204,128,0], [153,87,0], [106,52,3]
            ],
            blue: [
                [0,7,33], [0,20,73], [0,33,113], [0,46,153],
                [0,59,193], [0,72,233], [20,95,255], [60,130,255],
                [100,165,255], [140,200,255], [180,220,255], [220,240,255]
            ],
            fire: [
                [0,0,0], [50,0,0], [100,10,0], [150,25,0],
                [200,50,0], [255,75,10], [255,100,25], [255,125,50],
                [255,150,75], [255,175,100], [255,200,125], [255,225,150]
            ],
            grayscale: Array.from({length: 16}, (_, i) => {
                const v = Math.floor((i/15)*255);
                return [v, v, v];
            })
        };
        
        return schemes[this.colorScheme] || schemes.classic;
    }

    getColor(iter, palette) {
        if (iter === this.iterations) return [0, 0, 0];
        const colorIndex = Math.floor((iter / this.iterations) * (palette.length - 1));
        return palette[colorIndex];
    }
}

class BurningShip extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
    }

    resetView() {
        this.xmin = -2.5;
        this.xmax = 1.5;
        this.ymin = -2.0;
        this.ymax = 0.5;
        this.zoomStack = [];
        this.zoomLevel = 1;
        this.updateZoomInfo();
    }

    draw() {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        const palette = this.getColorPalette();
        
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const cx = this.xmin + (x / this.canvas.width) * (this.xmax - this.xmin);
                const cy = this.ymin + (y / this.canvas.height) * (this.ymax - this.ymin);
                
                let zx = 0;
                let zy = 0;
                let iter = 0;
                
                while (iter < this.iterations && zx * zx + zy * zy < 4) {
                    const temp = zx * zx - zy * zy + cx;
                    zy = Math.abs(2 * zx * zy) + cy;
                    zx = Math.abs(temp);
                    iter++;
                }
                
                const color = this.getColor(iter, palette);
                const idx = (y * this.canvas.width + x) * 4;
                data[idx] = color[0];
                data[idx + 1] = color[1];
                data[idx + 2] = color[2];
                data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    getColorPalette() {
        // Same as Mandelbrot
        const schemes = {
            classic: [
                [0,0,0], [25,7,26], [9,1,47], [4,4,73], [0,7,100],
                [12,44,138], [24,82,177], [57,125,209], [134,181,229],
                [211,236,248], [241,233,191], [248,201,95], [255,170,0],
                [204,128,0], [153,87,0], [106,52,3]
            ],
            blue: [
                [0,7,33], [0,20,73], [0,33,113], [0,46,153],
                [0,59,193], [0,72,233], [20,95,255], [60,130,255],
                [100,165,255], [140,200,255], [180,220,255], [220,240,255]
            ],
            fire: [
                [0,0,0], [50,0,0], [100,10,0], [150,25,0],
                [200,50,0], [255,75,10], [255,100,25], [255,125,50],
                [255,150,75], [255,175,100], [255,200,125], [255,225,150]
            ],
            grayscale: Array.from({length: 16}, (_, i) => {
                const v = Math.floor((i/15)*255);
                return [v, v, v];
            })
        };
        
        return schemes[this.colorScheme] || schemes.classic;
    }

    getColor(iter, palette) {
        if (iter === this.iterations) return [0, 0, 0];
        const colorIndex = Math.floor((iter / this.iterations) * (palette.length - 1));
        return palette[colorIndex];
    }
}