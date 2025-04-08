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
                    
                    for(let y = 0; y < data.height; y++) {
                        for(let x = 0; x < data.width; x++) {
                            const cx = data.xmin + (x / data.width) * (data.xmax - data.xmin);
                            const cy = data.ymin + (y / data.height) * (data.ymax - data.ymin);
                            let iter = 0;
                            let zx, zy;

                            switch(data.type) {
                                case 'mandelbrot':
                                    zx = zy = 0;
                                    while(iter < data.iterations && zx*zx + zy*zy < 4) {
                                        [zx, zy] = [zx*zx - zy*zy + cx, 2*zx*zy + cy];
                                        iter++;
                                    }
                                    break;

                                case 'julia':
                                    zx = cx;
                                    zy = cy;
                                    while(iter < data.iterations && zx*zx + zy*zy < 4) {
                                        [zx, zy] = [zx*zx - zy*zy + data.cx, 2*zx*zy + data.cy];
                                        iter++;
                                    }
                                    break;

                                case 'burning-ship':
                                    zx = zy = 0;
                                    while(iter < data.iterations && zx*zx + zy*zy < 4) {
                                        [zx, zy] = [zx*zx - zy*zy + cx, Math.abs(2*zx*zy) + cy];
                                        iter++;
                                    }
                                    break;
                            }

                            const palette = COLOR_SCHEMES[data.colorScheme] || COLOR_SCHEMES.classic;
                            const color = iter >= data.iterations ? 
                                [0, 0, 0] : 
                                palette[Math.floor((iter / data.iterations) * (palette.length - 1))];
                            
                            const idx = (y * data.width + x) * 4;
                            imageData[idx] = color[0];
                            imageData[idx+1] = color[1];
                            imageData[idx+2] = color[2];
                            imageData[idx+3] = 255;
                        }
                    }

                    self.postMessage({ 
                        imageData: imageData.buffer,
                        width: data.width,
                        height: data.height
                    }, [imageData.buffer]);
                    
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
        this.xmin = -2;
        this.xmax = 2;
        this.ymin = -2;
        this.ymax = 2;
        this.zoomStack = [];
        this.iterations = 100;
        this.colorScheme = 'classic';
        this.quality = 1;
        this.lastPanTime = 0;
        this.initEventListeners();
        this.initWorker();
    }

    initEventListeners() {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        const startInteraction = (x, y) => {
            isDragging = true;
            lastX = x;
            lastY = y;
        };

        const moveInteraction = (x, y) => {
            if (!isDragging) return;
            const now = Date.now();
            if (now - this.lastPanTime < 16) return;
            this.lastPanTime = now;
            
            const dx = x - lastX;
            const dy = y - lastY;
            lastX = x;
            lastY = y;
            
            this.pan(dx * 0.7, dy * 0.7);
            this.draw({ quality: 0.3 });
        };

        const endInteraction = () => {
            isDragging = false;
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
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.zoom(x, y, e.deltaY > 0 ? 0.8 : 1.2);
        }, { passive: false });
    }

    initWorker() {
        this.worker.onmessage = (e) => {
            if (e.data.error) {
                console.error('Worker error:', e.data.error);
                return;
            }
            
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

        this.worker.onerror = (error) => {
            console.error('Worker error:', error);
            this.isRendering = false;
        };
    }

    pan(dx, dy) {
        const dxWorld = dx * (this.xmax - this.xmin) / this.canvas.width;
        const dyWorld = dy * (this.ymax - this.ymin) / this.canvas.height;
        this.xmin -= dxWorld;
        this.xmax -= dxWorld;
        this.ymin += dyWorld;
        this.ymax += dyWorld;
    }

    zoom(x, y, factor) {
        this.zoomStack.push({ xmin: this.xmin, xmax: this.xmax, ymin: this.ymin, ymax: this.ymax });
        const xPercent = x / this.canvas.width;
        const yPercent = y / this.canvas.height;
        const newWidth = (this.xmax - this.xmin) * factor;
        const newHeight = (this.ymax - this.ymin) * factor;
        const centerX = this.xmin + (this.xmax - this.xmin) * xPercent;
        const centerY = this.ymin + (this.ymax - this.ymin) * yPercent;
        this.xmin = centerX - newWidth / 2;
        this.xmax = centerX + newWidth / 2;
        this.ymin = centerY - newHeight / 2;
        this.ymax = centerY + newHeight / 2;
        this.draw({ quality: 0.5 });
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

    resetView() {
        this.xmin = -2;
        this.xmax = 2;
        this.ymin = -2;
        this.ymax = 2;
        this.zoomStack = [];
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
        this.draw();
    }
}

class Julia extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
        this.type = 'julia';
        this.cx = -0.4;
        this.cy = 0.6;
        this.draw();
    }

    getFractalParams() {
        return { cx: this.cx, cy: this.cy };
    }
}

class BurningShip extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
        this.type = 'burning-ship';
        this.draw();
    }
}

const canvas = document.getElementById('fractalCanvas');
let currentFractal = new Mandelbrot(canvas);

document.querySelectorAll('[data-fractal]').forEach(button => {
    button.addEventListener('click', () => {
        switch(button.dataset.fractal) {
            case 'mandelbrot':
                currentFractal = new Mandelbrot(canvas);
                break;
            case 'julia':
                currentFractal = new Julia(canvas);
                break;
            case 'burning-ship':
                currentFractal = new BurningShip(canvas);
                break;
        }
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