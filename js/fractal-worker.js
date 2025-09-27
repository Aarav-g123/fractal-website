const FRACTAL_WORKER_CODE = `
    const COLOR_SCHEMES = {
        classic: [
            [0,0,0],[25,7,26],[9,1,47],[4,4,73],[0,7,100],
            [12,44,138],[24,82,177],[57,125,209],[134,181,229],
            [211,236,248],[241,233,191],[248,201,95],[255,170,0],
            [204,128,0],[153,87,0],[106,52,3]
        ],
        blue: [
            [0,7,33],[0,20,73],[0,33,113],[0,46,153],
            [0,59,193],[0,72,233],[20,95,255],[60,130,255],
            [100,165,255],[140,200,255],[180,220,255],[220,240,255]
        ],
        fire: [
            [0,0,0],[25,0,0],[50,0,0],[75,10,0],[100,25,0],
            [125,50,0],[150,75,10],[175,100,25],[200,125,50],
            [225,150,75],[250,175,100],[255,200,125],[255,225,150]
        ],
        forest: [
            [0,10,0],[0,25,5],[0,40,10],[0,55,15],[0,70,20],
            [10,85,25],[30,100,30],[50,115,35],[70,130,40],
            [90,145,45],[120,160,50],[150,175,55],[180,190,60]
        ],
        grayscale: Array.from({length: 16}, (_, i) => {
            const v = Math.floor((i/15)*255);
            return [v, v, v];
        })
    };

    ${Complex.toString()}
    ${complex.toString()}
    ${sin.toString()}
    ${cos.toString()}
    ${exp.toString()}

    function parseFunction(str, z) {
        try {
            // Simple function parser - in a real app you'd want a proper parser
            str = str.toLowerCase().replace(/\s/g, '');
            
            if (str === 'z^3-1') {
                return z.pow(3).sub(complex(1, 0));
            }
            if (str === 'z^4-1') {
                return z.pow(4).sub(complex(1, 0));
            }
            if (str === 'z^5-1') {
                return z.pow(5).sub(complex(1, 0));
            }
            if (str.includes('sin')) {
                return sin(z);
            }
            if (str.includes('cos')) {
                return cos(z);
            }
            if (str.includes('exp')) {
                return exp(z);
            }
            
            // Default to z^3 - 1
            return z.pow(3).sub(complex(1, 0));
        } catch (e) {
            return z.pow(3).sub(complex(1, 0));
        }
    }

    function calculateDerivative(f, z, h = 1e-7) {
        // Numerical derivative for complex functions
        const fz = f(z);
        const fzh = f(z.add(complex(h, 0)));
        return fzh.sub(fz).div(complex(h, 0));
    }

    self.onmessage = function(e) {
        const { data } = e;
        const imageData = new Uint8ClampedArray(data.width * data.height * 4);
        const maxIter = Math.max(data.iterations, 1);
        const palette = COLOR_SCHEMES[data.colorScheme] || COLOR_SCHEMES.classic;
        
        try {
            if (data.type === 'sierpinski' || data.type === 'barnsley' || data.type === 'koch') {
                // IFS Fractals
                const hitCount = new Array(data.width * data.height).fill(0);
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
                            const idx = py * data.width + px;
                            hitCount[idx] = Math.min(hitCount[idx] + 1, 255);
                        }
                    }
                }
                
                // Convert hit count to colors
                const maxHits = Math.max(...hitCount) || 1;
                for(let y = 0; y < data.height; y++) {
                    for(let x = 0; x < data.width; x++) {
                        const idx = y * data.width + x;
                        const hits = hitCount[idx];
                        if (hits > 0) {
                            const intensity = Math.log(hits + 1) / Math.log(maxHits + 1);
                            const colorIdx = Math.floor(intensity * (palette.length - 1));
                            const color = palette[colorIdx];
                            
                            const pixelIdx = idx * 4;
                            imageData[pixelIdx] = color[0];
                            imageData[pixelIdx + 1] = color[1];
                            imageData[pixelIdx + 2] = color[2];
                            imageData[pixelIdx + 3] = 255;
                        }
                    }
                }
            } else if (data.type === 'newton' || data.type === 'nova') {
                // Newton-based fractals
                for(let y = 0; y < data.height; y++) {
                    for(let x = 0; x < data.width; x++) {
                        let zx = data.xmin + (x / data.width) * (data.xmax - data.xmin);
                        let zy = data.ymin + (y / data.height) * (data.ymax - data.ymin);
                        let iter = 0;
                        
                        const z = complex(zx, zy);
                        while(iter < maxIter) {
                            const z_old = complex(zx, zy);
                            const f = parseFunction(data.function, z_old);
                            
                            if (f.abs() < 1e-6) break;
                            
                            const df = calculateDerivative(z => parseFunction(data.function, z), z_old);
                            
                            let z_new;
                            if (data.type === 'newton') {
                                z_new = z_old.sub(f.div(df));
                            } else {
                                z_new = z_old.sub(f.div(df)).mul(complex(0.5, 0));
                            }
                            
                            if (z_new.sub(z_old).abs() < 1e-6) break;
                            zx = z_new.re;
                            zy = z_new.im;
                            iter++;
                        }
                        
                        const colorIdx = Math.min(Math.floor((iter / maxIter) * (palette.length - 1)), palette.length - 1);
                        const color = iter >= maxIter ? palette[palette.length - 1] : palette[colorIdx];
                        
                        const idx = (y * data.width + x) * 4;
                        imageData[idx] = color[0];
                        imageData[idx + 1] = color[1];
                        imageData[idx + 2] = color[2];
                        imageData[idx + 3] = 255;
                    }
                }
            } else {
                // Escape-time fractals (Mandelbrot, Julia, Burning Ship)
                for(let y = 0; y < data.height; y++) {
                    for(let x = 0; x < data.width; x++) {
                        let zx, zy, cx, cy;
                        let iter = 0;
                        
                        cx = data.xmin + (x / data.width) * (data.xmax - data.xmin);
                        cy = data.ymin + (y / data.height) * (data.ymax - data.ymin);

                        switch(data.type) {
                            case 'mandelbrot':
                                zx = zy = 0;
                                cx = data.xmin + (x / data.width) * (data.xmax - data.xmin);
                                cy = data.ymin + (y / data.height) * (data.ymax - data.ymin);
                                break;

                            case 'julia':
                                zx = cx;
                                zy = cy;
                                cx = data.jx;
                                cy = data.jy;
                                break;

                            case 'burning-ship':
                                zx = zy = 0;
                                cx = data.xmin + (x / data.width) * (data.xmax - data.xmin);
                                cy = data.ymin + (y / data.height) * (data.ymax - data.ymin);
                                break;
                        }

                        while(iter < maxIter) {
                            let zx2 = zx * zx;
                            let zy2 = zy * zy;
                            
                            if (zx2 + zy2 > 4) break;
                            
                            if (data.type === 'burning-ship') {
                                zy = Math.abs(2 * zx * zy) + cy;
                                zx = zx2 - zy2 + cx;
                            } else {
                                zy = 2 * zx * zy + cy;
                                zx = zx2 - zy2 + cx;
                            }
                            iter++;
                        }

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