class FractalExplorer {
    constructor() {
        this.canvas = document.getElementById('fractalCanvas');
        this.currentFractal = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.switchFractal('mandelbrot');
        this.updateIterationLimits('mandelbrot');
    }

    setupEventListeners() {
        // Fractal type switching
        document.querySelectorAll('.nav-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const fractalType = e.target.dataset.fractal;
                this.switchFractal(fractalType);
                
                // Update active button
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            });
        });

        // Color scheme
        document.getElementById('colorScheme').addEventListener('change', (e) => {
            if (this.currentFractal) {
                this.currentFractal.colorScheme = e.target.value;
                this.currentFractal.draw();
            }
        });

        // Iterations
        const iterationsInput = document.getElementById('iterations');
        const iterValue = document.getElementById('iterValue');
        
        iterationsInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            iterValue.textContent = value;
            
            if (this.currentFractal) {
                this.currentFractal.iterations = value;
                this.currentFractal.draw();
            }
        });

        // Quality settings
        document.querySelectorAll('.quality-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.quality-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                if (this.currentFractal) {
                    this.currentFractal.quality = parseFloat(e.target.dataset.quality);
                    this.currentFractal.draw();
                }
            });
        });

        // Julia set controls
        document.getElementById('juliaReal').addEventListener('input', (e) => {
            if (this.currentFractal instanceof Julia) {
                this.currentFractal.jx = parseFloat(e.target.value);
                this.currentFractal.draw();
            }
        });

        document.getElementById('juliaImag').addEventListener('input', (e) => {
            if (this.currentFractal instanceof Julia) {
                this.currentFractal.jy = parseFloat(e.target.value);
                this.currentFractal.draw();
            }
        });

        document.getElementById('randomJulia').addEventListener('click', () => {
            if (this.currentFractal instanceof Julia) {
                this.currentFractal.jx = (Math.random() * 2 - 1).toFixed(3);
                this.currentFractal.jy = (Math.random() * 2 - 1).toFixed(3);
                
                document.getElementById('juliaReal').value = this.currentFractal.jx;
                document.getElementById('juliaImag').value = this.currentFractal.jy;
                this.currentFractal.draw();
            }
        });

        // Newton fractal controls
        document.getElementById('newtonFunction').addEventListener('input', (e) => {
            if (this.currentFractal instanceof NewtonFractal || this.currentFractal instanceof NovaFractal) {
                this.currentFractal.functionStr = e.target.value;
                this.currentFractal.draw();
            }
        });

        // View controls
        document.getElementById('resetView').addEventListener('click', () => {
            if (this.currentFractal) {
                this.currentFractal.resetView();
                this.currentFractal.draw();
            }
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            if (this.currentFractal) {
                this.currentFractal.zoomOut();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                if (this.currentFractal) {
                    this.currentFractal.resetView();
                    this.currentFractal.draw();
                }
            } else if (e.key === 'Escape') {
                if (this.currentFractal) {
                    this.currentFractal.zoomOut();
                }
            }
        });
    }

    switchFractal(type) {
        // Clean up current fractal
        if (this.currentFractal) {
            this.currentFractal.destroy();
        }

        // Hide all control panels
        this.hideAllControls();

        // Create new fractal instance
        let newFractal;
        switch(type) {
            case 'mandelbrot':
                newFractal = new Mandelbrot(this.canvas);
                break;
            case 'julia':
                newFractal = new Julia(this.canvas);
                document.querySelector('.julia-controls').classList.remove('hidden');
                break;
            case 'burning-ship':
                newFractal = new BurningShip(this.canvas);
                break;
            case 'sierpinski':
                newFractal = new Sierpinski(this.canvas);
                this.updateIterationLimits('sierpinski');
                break;
            case 'barnsley':
                newFractal = new BarnsleyFern(this.canvas);
                this.updateIterationLimits('barnsley');
                break;
            case 'koch':
                newFractal = new KochSnowflake(this.canvas);
                this.updateIterationLimits('koch');
                break;
            case 'newton':
                newFractal = new NewtonFractal(this.canvas);
                document.querySelector('.newton-controls').classList.remove('hidden');
                this.updateIterationLimits('newton');
                break;
            case 'nova':
                newFractal = new NovaFractal(this.canvas);
                document.querySelector('.newton-controls').classList.remove('hidden');
                this.updateIterationLimits('nova');
                break;
            default:
                newFractal = new Mandelbrot(this.canvas);
        }

        // Apply current settings
        newFractal.iterations = parseInt(document.getElementById('iterations').value);
        newFractal.colorScheme = document.getElementById('colorScheme').value;
        newFractal.quality = parseFloat(document.querySelector('.quality-btn.active').dataset.quality);
        
        this.currentFractal = newFractal;
        this.currentFractal.draw();
    }

    hideAllControls() {
        document.querySelectorAll('.julia-controls, .newton-controls').forEach(panel => {
            panel.classList.add('hidden');
        });
    }

    updateIterationLimits(fractalType) {
        const iterationsInput = document.getElementById('iterations');
        const iterValue = document.getElementById('iterValue');
        
        switch(fractalType) {
            case 'sierpinski':
            case 'barnsley':
            case 'koch':
                iterationsInput.min = 10000;
                iterationsInput.max = 500000;
                iterationsInput.value = 50000;
                iterValue.textContent = '50000';
                break;
            case 'newton':
            case 'nova':
                iterationsInput.min = 50;
                iterationsInput.max = 500;
                iterationsInput.value = 100;
                iterValue.textContent = '100';
                break;
            default:
                iterationsInput.min = 50;
                iterationsInput.max = 2000;
                iterationsInput.value = 200;
                iterValue.textContent = '200';
        }
        
        if (this.currentFractal) {
            this.currentFractal.iterations = parseInt(iterationsInput.value);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FractalExplorer();
});