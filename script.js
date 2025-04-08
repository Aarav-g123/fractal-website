let zoom = 1;
let panX = 0;
let panY = 0;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');
    pixelDensity(1);
    loadPixels();
    drawMandelbrot();
}

function drawMandelbrot() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {

            let a = map(x, 0, width, -zoom + panX, zoom + panX);
            let b = map(y, 0, height, -zoom + panY, zoom + panY);
            
            let n = 0;
            let ca = a;
            let cb = b;

            while (n < 100) {
                let aa = a * a - b * b;
                let bb = 2 * a * b;
                a = aa + ca;
                b = bb + cb;
                if (a * a + b * b > 4) break;
                n++;
            }
            
            let bright = map(n, 0, 100, 0, 255);
            set(x, y, color(bright));
        }
    }
    updatePixels();
}

function resetFractal() {
    zoom = 1;
    panX = 0;
    panY = 0;
    drawMandelbrot();
}

document.getElementById('zoom').addEventListener('input', (e) => {
    zoom = map(e.target.value, 1, 100, 1, 0.01);
    drawMandelbrot();
});