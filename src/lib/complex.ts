export class Complex {
  constructor(public re: number, public im: number) {}

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  div(other: Complex): Complex {
    const denom = other.re * other.re + other.im * other.im;
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  pow(n: number): Complex {
    let result = new Complex(1, 0);
    for (let i = 0; i < n; i++) {
      result = result.mul(this);
    }
    return result;
  }

  abs(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  conjugate(): Complex {
    return new Complex(this.re, -this.im);
  }
}
