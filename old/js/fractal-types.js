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
        this.zoomLevel = 1;
        this.updateZoomInfo();
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

    resetView() {
        this.xmin = -2;
        this.xmax = 2;
        this.ymin = -2;
        this.ymax = 2;
        this.zoomStack = [];
        this.zoomLevel = 1;
        this.updateZoomInfo();
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
        this.zoomLevel = 1;
        this.updateZoomInfo();
    }
}

class IFSFractal extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
        this.iterations = 50000;
    }

    getFractalParams() {
        return { iterations: this.iterations };
    }
}

class Sierpinski extends IFSFractal {
    constructor(canvas) {
        super(canvas);
        this.type = 'sierpinski';
    }

    resetView() {
        this.xmin = -1.5;
        this.xmax = 1.5;
        this.ymin = -1.5;
        this.ymax = 1.5;
        this.zoomStack = [];
        this.zoomLevel = 1;
        this.updateZoomInfo();
    }
}

class BarnsleyFern extends IFSFractal {
    constructor(canvas) {
        super(canvas);
        this.type = 'barnsley';
        this.iterations = 100000;
    }

    resetView() {
        this.xmin = -3;
        this.xmax = 3;
        this.ymin = 0;
        this.ymax = 10;
        this.zoomStack = [];
        this.zoomLevel = 1;
        this.updateZoomInfo();
    }
}

class KochSnowflake extends IFSFractal {
    constructor(canvas) {
        super(canvas);
        this.type = 'koch';
    }

    resetView() {
        this.xmin = -1.5;
        this.xmax = 1.5;
        this.ymin = -1.5;
        this.ymax = 1.5;
        this.zoomStack = [];
        this.zoomLevel = 1;
        this.updateZoomInfo();
    }
}

class NewtonFractal extends FractalRenderer {
    constructor(canvas) {
        super(canvas);
        this.type = 'newton';
        this.functionStr = 'z^3 - 1';
        this.iterations = 100;
    }

    getFractalParams() {
        return { function: this.functionStr };
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
}

class NovaFractal extends NewtonFractal {
    constructor(canvas) {
        super(canvas);
        this.type = 'nova';
    }
}