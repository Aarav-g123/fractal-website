class FractalWorker extends Worker {
    constructor() {
        const workerCode = `
            const COLOR_SCHEMES = {
                classic: [
                    [0,0,0],[25,7,26],[9,1,47],[4,4,73],[0,7,100],
                    [12,44,138],[24,82,177],[57,125,209],[134,181,229],
                    [211,236,248],[241,233,191],[248,201,95],[255,170,0],
                    [204,128,0],[153,87,0],[106,52,3]
                ],
                blue: [
                    [0,0,0],[8,16,44],[16,32,88],[24,48,132],
                    [32,64,176],[40,80,220],[48,96,255],
                    [96,128,255],[144,160,255],[192,192,255]
                ],
                grayscale: ${JSON.stringify(Array.from({length: 16}, (_, i) => {
                    const v = Math.floor((i/15)*255);
                    return [v, v, v];
                }))}
            };

            self.onmessage = function(e) {
                try {
                    const { data } = e;
                    const imageData = new Uint8ClampedArray(data.width * data.height * 4);
                    const maxIter = Math.max(data.iterations, 1);
                    
                    for(let y = 0; y < data.height; y++) {
                        for(let x = 0; x < data.width; x++) {
                            let zx, zy, cx, cy;
                            let iter = 0;
                            
                            cx = data.xmin + (x / data.width) * (data.xmax - data.xmin);
                            cy = data.ymin + (y / data.height) * (data.ymax - data.ymin);

                            switch(data.type) {
                                case 'mandelbrot':
                                    zx = zy = 0;
                                    while(iter < maxIter && zx*zx + zy*zy < 4) {
                                        [zx, zy] = [zx*zx - zy*zy + cx, 2*zx*zy + cy];
                                        iter++;
                                    }
                                    break;

                                case 'julia':
                                    zx = cx;
                                    zy = cy;
                                    while(iter < maxIter && zx*zx + zy*zy < 4) {
                                        [zx, zy] = [zx*zx - zy*zy + data.jx, 2*zx*zy + data.jy];
                                        iter++;
                                    }
                                    break;

                                case 'burning-ship':
                                    zx = zy = 0;
                                    while(iter < maxIter && zx*zx + zy*zy < 4) {
                                        [zx, zy] = [zx*zx - zy*zy + cx, Math.abs(2*zx*zy) + cy];
                                        iter++;
                                    }
                                    break;
                            }

                            const palette = COLOR_SCHEMES[data.colorScheme] || COLOR_SCHEMES.classic;
                            const colorIdx = Math.min(Math.floor((iter / maxIter) * (palette.length - 1)), palette.length - 1);
                            const color = iter >= maxIter ? [0,0,0] : palette[colorIdx];
                            
                            const idx = (y * data.width + x) * 4;
                            imageData.set(color, idx);
                            imageData[idx+3] = 255;
                        }
                    }

                    self.postMessage({ imageData: imageData.buffer, width: data.width, height: data.height }, [imageData.buffer]);
                    
                } catch (error) {
                    self.postMessage({ error: error.message });
                }
            };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        super(URL.createObjectURL(blob));
    }
}

class FractalRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 800;
        this.worker = new FractalWorker();
        this.isRendering = false;
        this.renderQueue = null;
        this.selectionRect = null;
        this.zoomStack = [];
        this.iterations = 100;
        this.colorScheme = 'classic';
        this.quality = 1;
        this.resetView();
        this.initEventListeners();
        this.initWorker();
        this.draw();
    }

    resetView() {
        this.xmin = -2;
        this.xmax = 2;
        this.ymin = -2;
        this.ymax = 2;
        this.zoomStack = [];
    }

    initEventListeners() {
        let isDragging = false;

        const startInteraction = (x, y) => {
            isDragging = true;
            this.selectionRect = { x1: x, y1: y, x2: x, y2: y };
        };

        const moveInteraction = (x, y) => {
            if (!isDragging) return;
            this.selectionRect.x2 = x;
            this.selectionRect.y2 = y;
            this.drawSelectionBox();
        };

        const endInteraction = () => {
            if (!isDragging) return;
            isDragging = false;
            
            const rect = this.selectionRect;
            const x1 = Math.min(rect.x1, rect.x2);
            const x2 = Math.max(rect.x1, rect.x2);
            const y1 = Math.min(rect.y1, rect.y2);
            const y2 = Math.max(rect.y1, rect.y2);
            
            if (Math.abs(x2 - x1) > 10 && Math.abs(y2 - y1) > 10) {
                this.zoomStack.push({ 
                    xmin: this.xmin, 
                    xmax: this.xmax, 
                    ymin: this.ymin, 
                    ymax: this.ymax 
                });
                
                const newXmin = this.xmin + (x1 / this.canvas.width) * (this.xmax - this.xmin);
                const newXmax = this.xmin + (x2 / this.canvas.width) * (this.xmax - this.xmin);
                const newYmin = this.ymin + (y1 / this.canvas.height) * (this.ymax - this.ymin);
                const newYmax = this.ymin + (y2 / this.canvas.height) * (this.ymax - this.ymin);
                
                this.xmin = newXmin;
                this.xmax = newXmax;
                this.ymin = newYmin;
                this.ymax = newYmax;
            }
            
            this.selectionRect = null;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        };

        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startInteraction(e.offsetX, e.offsetY);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            e.preventDefault();
            moveInteraction(e.offsetX, e.offsetY);
        });
        
        this.canvas.addEventListener('mouseup', endInteraction);
        this.canvas.addEventListener('mouseleave', endInteraction);

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            startInteraction(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            moveInteraction(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        
        this.canvas.addEventListener('touchend', endInteraction);

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoomOut();
        }, { passive: false });
    }

    initWorker() {
        this.worker.onmessage = (e) => {
            if (e.data.error) return;
            
            this.isRendering = false;
            const imageData = new ImageData(
                new Uint8ClampedArray(e.data.imageData),
                e.data.width,
                e.data.height
            );
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = e.data.width;
            tempCanvas.height = e.data.height;
            tempCanvas.getContext('2d').putImageData(imageData, 0, 0);
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(tempCanvas, 0, 0, this.canvas.width, this.canvas.height);
            
            if (this.renderQueue) {
                this.draw(this.renderQueue);
                this.renderQueue = null;
            }
        };
    }

    drawSelectionBox() {
        if (!this.selectionRect) return;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.canvas, 0, 0);
        
        const x = Math.min(this.selectionRect.x1, this.selectionRect.x2);
        const y = Math.min(this.selectionRect.y1, this.selectionRect.y2);
        const width = Math.abs(this.selectionRect.x2 - this.selectionRect.x1);
        const height = Math.abs(this.selectionRect.y2 - this.selectionRect.y1);
        
        tempCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        tempCtx.lineWidth = 2;
        tempCtx.strokeRect(x, y, width, height);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(tempCanvas, 0, 0);
    }

    zoomOut() {
        if (this.zoomStack.length === 0) return;
        const prev = this.zoomStack.pop();
        this.xmin = prev.xmin;
        this.xmax = prev.xmax;
        this.ymin = prev.ymin;
        this.ymax = prev.ymax;
        this.draw();
    }

    draw(options = {}) {
        if (this.isRendering) {
            this.renderQueue = options;
            return;
        }

        this.isRendering = true;
        const quality = options.quality || this.quality;
        const w = Math.floor(this.canvas.width * quality);
        const h = Math.floor(this.canvas.height * quality);

        const payload = {
            type: this.type,
            xmin: this.xmin,
            xmax: this.xmax,
            ymin: this.ymin,
            ymax: this.ymax,
            width: w,
            height: h,
            iterations: this.iterations,
            colorScheme: this.colorScheme,
            ...this.getFractalParams()
        };

        this.worker.postMessage(payload);
    }

    getFractalParams() {
        return {};
    }
}

class Mandelbrot extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
        this.type = 'mandelbrot';
    }

    resetView() {
        this.xmin = -2.5;
        this.xmax = 1.5;
        this.ymin = -1.5;
        this.ymax = 1.5;
        this.zoomStack = [];
    }
}

class Julia extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
        this.type = 'julia';
        this.jx = -0.4;
        this.jy = 0.6;
    }

    getFractalParams() {
        return { jx: this.jx, jy: this.jy };
    }

    updateConstants(x, y) {
        this.jx = parseFloat(x);
        this.jy = parseFloat(y);
        this.draw();
    }
}

class BurningShip extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
        this.type = 'burning-ship';
    }

    resetView() {
        this.xmin = -2.5;
        this.xmax = 1.5;
        this.ymin = -2.0;
        this.ymax = 0.5;
        this.zoomStack = [];
    }
}

const canvas = document.getElementById('fractalCanvas');
let currentFractal = new Mandelbrot(canvas);

document.querySelectorAll('[data-fractal]').forEach(button => {
    button.addEventListener('click', () => {
        if (currentFractal) {
            currentFractal.worker.terminate();
        }

        const currentIterations = parseInt(document.getElementById('iterations').value);
        const currentColorScheme = document.getElementById('colorScheme').value;
        const currentQuality = parseFloat(document.querySelector('.quality-preset.active').dataset.quality);

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        let newFractal;
        switch(button.dataset.fractal) {
            case 'mandelbrot':
                newFractal = new Mandelbrot(canvas);
                break;
            case 'julia':
                newFractal = new Julia(canvas);
                break;
            case 'burning-ship':
                newFractal = new BurningShip(canvas);
                break;
        }
        newFractal.iterations = currentIterations;
        newFractal.colorScheme = currentColorScheme;
        newFractal.quality = currentQuality;
        currentFractal = newFractal;
        currentFractal.draw();
    });
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    currentFractal.colorScheme = e.target.value;
    currentFractal.draw();
});

document.getElementById('iterations').addEventListener('input', (e) => {
    currentFractal.iterations = parseInt(e.target.value);
    document.getElementById('iterValue').textContent = e.target.value;
    currentFractal.draw();
});

document.getElementById('reset').addEventListener('click', () => {
    currentFractal.resetView();
    currentFractal.draw();
});

document.getElementById('zoomOut').addEventListener('click', () => {
    currentFractal.zoomOut();
});

document.querySelectorAll('.quality-preset').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.quality-preset').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        currentFractal.quality = parseFloat(button.dataset.quality);
        currentFractal.draw();
    });
});