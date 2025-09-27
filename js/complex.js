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
        if (denom === 0) throw new Error("Division by zero");
        return new Complex(
            (this.re * other.re + this.im * other.im) / denom,
            (this.im * other.re - this.re * other.im) / denom
        );
    }

    pow(n) {
        if (n === 0) return new Complex(1, 0);
        if (n < 0) return this.pow(-n).div(new Complex(1, 0));
        
        let result = new Complex(1, 0);
        let base = this;
        while (n > 0) {
            if (n % 2 === 1) {
                result = result.mul(base);
            }
            base = base.mul(base);
            n = Math.floor(n / 2);
        }
        return result;
    }

    abs() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }

    conjugate() {
        return new Complex(this.re, -this.im);
    }

    toString() {
        return `${this.re} ${this.im >= 0 ? '+' : '-'} ${Math.abs(this.im)}i`;
    }
}

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

function exp(z) {
    const magnitude = Math.exp(z.re);
    return new Complex(
        magnitude * Math.cos(z.im),
        magnitude * Math.sin(z.im)
    );
}