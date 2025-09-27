class FractalWorker extends Worker {
    constructor() {
        const blob = new Blob([FRACTAL_WORKER_CODE], { type: 'application/javascript' });
        super(URL.createObjectURL(blob));
    }
}

class FractalRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
        this.setCanvasSize();
        
        this.worker = new FractalWorker();
        this.isRendering = false;
        this.renderQueue = null;
        this.selectionRect = null;
        this.zoomStack = [];
        
        // Default settings
        this.iterations = 200;
        this.colorScheme = 'classic';
        this.quality = 1;
        this.zoomLevel = 1;
        
        this.resetView();
        this.initEventListeners();
        this.initWorker();
    }

    setCanvasSize() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, 800);
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

        const startInteraction = (x, y) => {
            isDragging = true;
            startX = x;
            startY = y;
            this.selectionRect = { x1: x, y1: y, x2: x, y2: y };
            this.canvas.style.cursor = 'crosshair';
        };

        const moveInteraction = (x, y) => {
            this.updateCoordinates(x, y);
            
            if (!isDragging) return;
            this.selectionRect.x2 = x;
            this.selectionRect.y2 = y;
            this.drawSelectionBox();
        };

        const endInteraction = () => {
            if (!isDragging) return;
            isDragging = false;
            this.canvas.style.cursor = 'crosshair';
            
            const rect = this.selectionRect;
            const width = Math.abs(rect.x2 - rect.x1);
            const height = Math.abs(rect.y2 - rect.y1);
            
            if (width > 10 && height > 10) {
                this.zoomToSelection(rect);
            }
            
            this.selectionRect = null;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };

        // Mouse events
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

        // Touch events
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

        // Zoom with mouse wheel
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 1.2 : 0.8;
            this.zoomAtPoint(e.offsetX, e.offsetY, zoomFactor);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.setCanvasSize();
            this.draw();
        });
    }

    initWorker() {
        this.worker.onmessage = (e) => {
            this.isRendering = false;
            
            if (e.data.error) {
                console.error('Worker error:', e.data.error);
                return;
            }
            
            const imageData = new ImageData(
                new Uint8ClampedArray(e.data.imageData),
                e.data.width,
                e.data.height
            );
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = e.data.width;
            tempCanvas.height = e.data.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imageData, 0, 0);
            
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

    zoomToSelection(rect) {
        const x1 = Math.min(rect.x1, rect.x2);
        const x2 = Math.max(rect.x1, rect.x2);
        const y1 = Math.min(rect.y1, rect.y2);
        const y2 = Math.max(rect.y1, rect.y2);
        
        this.zoomStack.push({ 
            xmin: this.xmin, 
            xmax: this.xmax, 
            ymin: this.ymin, 
            ymax: this.ymax,
            zoomLevel: this.zoomLevel
        });
        
        const newXmin = this.xmin + (x1 / this.canvas.width) * (this.xmax - this.xmin);
        const newXmax = this.xmin + (x2 / this.canvas.width) * (this.xmax - this.xmin);
        const newYmin = this.ymin + (y1 / this.canvas.height) * (this.ymax - this.ymin);
        const newYmax = this.ymin + (y2 / this.canvas.height) * (this.ymax - this.ymin);
        
        this.xmin = newXmin;
        this.xmax = newXmax;
        this.ymin = newYmin;
        this.ymax = newYmax;
        
        const widthRatio = (this.xmax - this.xmin) / 4; // 4 is the initial view width
        this.zoomLevel = 1 / widthRatio;
        this.updateZoomInfo();
        
        this.draw();
    }

    zoomAtPoint(x, y, factor) {
        const xPercent = x / this.canvas.width;
        const yPercent = y / this.canvas.height;
        
        const currentWidth = this.xmax - this.xmin;
        const currentHeight = this.ymax - this.ymin;
        
        const newWidth = currentWidth * factor;
        const newHeight = currentHeight * factor;
        
        const dx = (currentWidth - newWidth) * xPercent;
        const dy = (currentHeight - newHeight) * yPercent;
        
        this.zoomStack.push({ 
            xmin: this.xmin, 
            xmax: this.xmax, 
            ymin: this.ymin, 
            ymax: this.ymax,
            zoomLevel: this.zoomLevel
        });
        
        this.xmin += dx;
        this.xmax = this.xmin + newWidth;
        this.ymin += dy;
        this.ymax = this.ymin + newHeight;
        
        this.zoomLevel *= factor;
        this.updateZoomInfo();
        
        this.draw();
    }

    zoomOut() {
        if (this.zoomStack.length === 0) return;
        
        const prev = this.zoomStack.pop();
        this.xmin = prev.xmin;
        this.xmax = prev.xmax;
        this.ymin = prev.ymin;
        this.ymax = prev.ymax;
        this.zoomLevel = prev.zoomLevel;
        this.updateZoomInfo();
        
        this.draw();
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
        
        tempCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        tempCtx.lineWidth = 2;
        tempCtx.setLineDash([5, 5]);
        tempCtx.strokeRect(x, y, width, height);
        tempCtx.setLineDash([]);
        
        tempCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        tempCtx.fillRect(x, y, width, height);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(tempCanvas, 0, 0);
    }

    updateZoomInfo() {
        const zoomInfo = document.querySelector('.zoom-info');
        if (zoomInfo) {
            zoomInfo.textContent = `Zoom: ${this.zoomLevel.toFixed(2)}x`;
        }
    }

    updateCoordinates(x, y) {
        const coordDisplay = document.querySelector('.coordinates');
        if (coordDisplay) {
            const coordX = this.xmin + (x / this.canvas.width) * (this.xmax - this.xmin);
            const coordY = this.ymin + (y / this.canvas.height) * (this.ymax - this.ymin);
            coordDisplay.textContent = `X: ${coordX.toFixed(4)}, Y: ${coordY.toFixed(4)}`;
        }
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

        try {
            this.worker.postMessage(payload);
        } catch (error) {
            console.error('Error posting message to worker:', error);
            this.isRendering = false;
        }
    }

    getFractalParams() {
        return {};
    }

    destroy() {
        if (this.worker) {
            this.worker.terminate();
        }
    }
}