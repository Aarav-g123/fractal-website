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

            // Add these helper functions at the top of worker code
            ${Complex.toString()}
            ${complex.toString()}
            ${sin.toString()}
            ${cos.toString()}

            self.onmessage = function(e) {
                try {
                    const { data } = e;
                    const imageData = new Uint8ClampedArray(data.width * data.height * 4);
                    const maxIter = Math.max(data.iterations, 1);
                    
                    if (data.type === 'sierpinski' || data.type === 'barnsley' || data.type === 'koch') {
                        // IFS implementation
                        let x = 0, y = 0;
                        
                        for(let i = 0; i < maxIter; i++) {
                            let nextX, nextY;
                            const r = Math.random();
                            
                            if (data.type === 'sierpinski') {
                                const point = Math.floor(r * 3);
                                const vertices = [
                                    {x: -1, y: -1},
                                    {x: 1, y: -1},
                                    {x: 0, y: 1}
                                ];
                                nextX = (x + vertices[point].x) / 2;
                                nextY = (y + vertices[point].y) / 2;
                            } else if (data.type === 'barnsley') {
                                if (r < 0.01) {
                                    nextX = 0;
                                    nextY = 0.16 * y;
                                } else if (r < 0.86) {
                                    nextX = 0.85 * x + 0.04 * y;
                                    nextY = -0.04 * x + 0.85 * y + 1.6;
                                } else if (r < 0.93) {
                                    nextX = 0.2 * x - 0.26 * y;
                                    nextY = 0.23 * x + 0.22 * y + 1.6;
                                } else {
                                    nextX = -0.15 * x + 0.28 * y;
                                    nextY = 0.26 * x + 0.24 * y + 0.44;
                                }
                            } else if (data.type === 'koch') {
                                const point = Math.floor(r * 4);
                                const vertices = [
                                    {x: -1, y: -0.5},
                                    {x: -0.5, y: 0.5},
                                    {x: 0.5, y: 0.5},
                                    {x: 1, y: -0.5}
                                ];
                                nextX = (x + vertices[point].x) / 2;
                                nextY = (y + vertices[point].y) / 2;
                            }
                            
                            x = nextX;
                            y = nextY;
                            
                            if (i > 20) {
                                const px = Math.floor((x + 2) * data.width / 4);
                                const py = Math.floor((y + 2) * data.height / 4);
                                if (px >= 0 && px < data.width && py >= 0 && py < data.height) {
                                    const idx = (py * data.width + px) * 4;
                                    const color = COLOR_SCHEMES[data.colorScheme][0];
                                    imageData[idx] = color[0];
                                    imageData[idx + 1] = color[1];
                                    imageData[idx + 2] = color[2];
                                    imageData[idx + 3] = 255;
                                }
                            }
                        }
                    } else if (data.type === 'newton' || data.type === 'nova') {
                        // Newton fractal implementation
                        for(let y = 0; y < data.height; y++) {
                            for(let x = 0; x < data.width; x++) {
                                let zx = data.xmin + (x / data.width) * (data.xmax - data.xmin);
                                let zy = data.ymin + (y / data.height) * (data.ymax - data.ymin);
                                let iter = 0;
                                
                                const z = complex(zx, zy);
                                while(iter < maxIter) {
                                    const z_old = complex(zx, zy);
                                    let z_new;
                                    
                                    if (data.function === 'z3') {
                                        z_new = z_old.sub(z_old.pow(3).sub(complex(1, 0)).div(z_old.pow(2).mul(complex(3, 0))));
                                    } else if (data.function === 'z4') {
                                        z_new = z_old.sub(z_old.pow(4).sub(complex(1, 0)).div(z_old.pow(3).mul(complex(4, 0))));
                                    } else {
                                        z_new = z_old.sub(sin(z_old).div(cos(z_old)));
                                    }
                                    
                                    if (z_new.sub(z_old).abs() < 0.000001) break;
                                    zx = z_new.re;
                                    zy = z_new.im;
                                    iter++;
                                }
                                
                                const palette = COLOR_SCHEMES[data.colorScheme] || COLOR_SCHEMES.classic;
                                const colorIdx = Math.min(Math.floor((iter / maxIter) * (palette.length - 1)), palette.length - 1);
                                const color = iter >= maxIter ? [0,0,0] : palette[colorIdx];
                                
                                const idx = (y * data.width + x) * 4;
                                imageData[idx] = color[0];
                                imageData[idx + 1] = color[1];
                                imageData[idx + 2] = color[2];
                                imageData[idx + 3] = 255;
                            }
                        }
                    } else {
                        // Existing implementation for classic sets
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
                                imageData[idx] = color[0];
                                imageData[idx + 1] = color[1];
                                imageData[idx + 2] = color[2];
                                imageData[idx + 3] = 255;
                            }
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
            else if (this instanceof Julia && Math.abs(x2 - x1) < 2 && Math.abs(y2 - y1) < 2) {
                const x = (rect.x1 + rect.x2) / 2;
                const y = (rect.y1 + rect.y2) / 2;
                const jx = this.xmin + (x / this.canvas.width) * (this.xmax - this.xmin);
                const jy = this.ymin + (y / this.canvas.height) * (this.ymax - this.ymin);
                this.jx = jx;
                this.jy = jy;
                document.getElementById('juliaX').value = jx.toFixed(3);
                document.getElementById('juliaY').value = jy.toFixed(3);
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

class Complex {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    add(other) {
        return new Complex(this.re + other.re, this.im + other.im);
    }

    sub(other) {
        return new Complex(this.re - other.re, this.im - other.im);
    }

    mul(other) {
        return new Complex(
            this.re * other.re - this.im * other.im,
            this.re * other.im + this.im * other.re
        );
    }

    div(other) {
        const denom = other.re * other.re + other.im * other.im;
        return new Complex(
            (this.re * other.re + this.im * other.im) / denom,
            (this.im * other.re - this.re * other.im) / denom
        );
    }

    pow(n) {
        let result = new Complex(1, 0);
        for (let i = 0; i < n; i++) {
            result = result.mul(this);
        }
        return result;
    }

    abs() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
}

// Helper functions for the worker
function complex(re, im) {
    return new Complex(re, im);
}

function sin(z) {
    return new Complex(
        Math.sin(z.re) * Math.cosh(z.im),
        Math.cos(z.re) * Math.sinh(z.im)
    );
}

function cos(z) {
    return new Complex(
        Math.cos(z.re) * Math.cosh(z.im),
        -Math.sin(z.re) * Math.sinh(z.im)
    );
}

class IFSFractal extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
        this.type = 'ifs';
        this.iterations = 10000;
        this.points = [];
    }

    getFractalParams() {
        return {
            ifsType: this.ifsType,
            iterations: this.iterations
        };
    }
}

class Sierpinski extends IFSFractal {
    constructor(canvas) {
        super(canvas);
        this.type = 'sierpinski';
    }
}

class BarnsleyFern extends IFSFractal {
    constructor(canvas) {
        super(canvas);
        this.type = 'barnsley';
    }
}

class KochSnowflake extends IFSFractal {
    constructor(canvas) {
        super(canvas);
        this.type = 'koch';
    }
}

class NewtonFractal extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
        this.type = 'newton';
        this.function = 'z3';
    }

    getFractalParams() {
        return {
            function: this.function
        };
    }
}

class NovaFractal extends NewtonFractal {
    constructor(canvas) {
        super(canvas);
        this.type = 'nova';
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
                hideAllControls();
                break;
            case 'julia':
                newFractal = new Julia(canvas);
                hideAllControls();
                document.querySelector('.julia-controls').style.display = 'flex';
                break;
            case 'burning-ship':
                newFractal = new BurningShip(canvas);
                hideAllControls();
                break;
            case 'sierpinski':
                newFractal = new Sierpinski(canvas);
                hideAllControls();
                document.querySelector('.ifs-controls').style.display = 'flex';
                break;
            case 'barnsley':
                newFractal = new BarnsleyFern(canvas);
                hideAllControls();
                document.querySelector('.ifs-controls').style.display = 'flex';
                break;
            case 'koch':
                newFractal = new KochSnowflake(canvas);
                hideAllControls();
                document.querySelector('.ifs-controls').style.display = 'flex';
                break;
            case 'newton':
                newFractal = new NewtonFractal(canvas);
                hideAllControls();
                document.querySelector('.newton-controls').style.display = 'flex';
                break;
            case 'nova':
                newFractal = new NovaFractal(canvas);
                hideAllControls();
                document.querySelector('.newton-controls').style.display = 'flex';
                break;
            default:
                console.error('Unknown fractal type:', button.dataset.fractal);
                return;
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

document.getElementById('randomJulia').addEventListener('click', () => {
    currentFractal.jx = (Math.random() * 2 - 1).toFixed(3);
    currentFractal.jy = (Math.random() * 2 - 1).toFixed(3);
    document.getElementById('juliaX').value = currentFractal.jx;
    document.getElementById('juliaY').value = currentFractal.jy;
    currentFractal.draw();
});

document.getElementById('juliaX').addEventListener('input', (e) => {
    if (currentFractal instanceof Julia) {
        currentFractal.jx = parseFloat(e.target.value);
        currentFractal.draw();
    }
});

document.getElementById('juliaY').addEventListener('input', (e) => {
    if (currentFractal instanceof Julia) {
        currentFractal.jy = parseFloat(e.target.value);
        currentFractal.draw();
    }
});

// Add helper function to hide all special controls
function hideAllControls() {
    document.querySelector('.julia-controls').style.display = 'none';
    document.querySelector('.newton-controls').style.display = 'none';
    document.querySelector('.ifs-controls').style.display = 'none';
}

// Add event listeners for new controls
document.getElementById('newtonFunction').addEventListener('change', (e) => {
    if (currentFractal instanceof NewtonFractal) {
        currentFractal.function = e.target.value;
        currentFractal.draw();
    }
});

document.getElementById('ifsIterations').addEventListener('input', (e) => {
    if (currentFractal instanceof IFSFractal) {
        currentFractal.iterations = parseInt(e.target.value);
        document.getElementById('ifsIterValue').textContent = e.target.value;
        currentFractal.draw();
    }
});