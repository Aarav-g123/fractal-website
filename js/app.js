class FractalExplorer {
    constructor() {
        this.canvas = document.getElementById('fractalCanvas');
        this.currentFractal = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.switchFractal('mandelbrot');
    }

    setupEventListeners() {

        document.querySelectorAll('.nav-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const fractalType = e.target.dataset.fractal;
                this.switchFractal(fractalType);
                

                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            });
        });


        document.getElementById('colorScheme').addEventListener('change', (e) => {
            if (this.currentFractal) {
                this.currentFractal.colorScheme = e.target.value;
                this.currentFractal.draw();
            }
        });


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


        const juliaRealInput = document.getElementById('juliaReal');
        const juliaRealValue = document.getElementById('juliaRealValue');
        const juliaImagInput = document.getElementById('juliaImag');
        const juliaImagValue = document.getElementById('juliaImagValue');

        juliaRealInput.addEventListener('input', (e) => {
            if (this.currentFractal instanceof Julia) {
                this.currentFractal.cx = parseFloat(e.target.value);
                juliaRealValue.textContent = e.target.value;
                this.currentFractal.draw();
            }
        });

        juliaImagInput.addEventListener('input', (e) => {
            if (this.currentFractal instanceof Julia) {
                this.currentFractal.cy = parseFloat(e.target.value);
                juliaImagValue.textContent = e.target.value;
                this.currentFractal.draw();
            }
        });

        document.getElementById('randomJulia').addEventListener('click', () => {
            if (this.currentFractal instanceof Julia) {
                this.currentFractal.cx = (Math.random() * 2 - 1);
                this.currentFractal.cy = (Math.random() * 2 - 1);
                
                juliaRealInput.value = this.currentFractal.cx.toFixed(2);
                juliaImagInput.value = this.currentFractal.cy.toFixed(2);
                juliaRealValue.textContent = this.currentFractal.cx.toFixed(2);
                juliaImagValue.textContent = this.currentFractal.cy.toFixed(2);
                
                this.currentFractal.draw();
            }
        });

        document.getElementById('resetView').addEventListener('click', () => {
            if (this.currentFractal) {
                this.currentFractal.resetView();
                this.currentFractal.draw();
            }
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            if (this.currentFractal) {
                this.currentFractal.zoomOut();
                this.currentFractal.draw();
            }
        });
    }

    switchFractal(type) {
        if (this.currentFractal) {
        }

        this.hideAllControls();

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
            default:
                newFractal = new Mandelbrot(this.canvas);
        }

        newFractal.iterations = parseInt(document.getElementById('iterations').value);
        newFractal.colorScheme = document.getElementById('colorScheme').value;
        
        this.currentFractal = newFractal;
        this.currentFractal.draw();
    }

    hideAllControls() {
        document.querySelectorAll('.julia-controls').forEach(panel => {
            panel.classList.add('hidden');
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FractalExplorer();
});