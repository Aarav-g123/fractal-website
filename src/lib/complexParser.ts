import { Complex } from './complex';

export type ParsedFunction = (z: Complex) => Complex;

export class ComplexParser {
  static parse(expr: string): ParsedFunction {
    const normalized = expr.toLowerCase().replace(/\s+/g, '');
    
    return (z: Complex): Complex => {
      try {
        return this.evaluate(normalized, z);
      } catch (e) {
        return new Complex(0, 0);
      }
    };
  }

  private static evaluate(expr: string, z: Complex): Complex {
    // Handle constants
    if (expr === 'z') return z;
    if (expr === 'i') return new Complex(0, 1);
    if (!isNaN(Number(expr))) return new Complex(Number(expr), 0);

    // Handle basic operations with parentheses
    expr = this.evaluateParentheses(expr, z);

    // Handle functions
    if (expr.startsWith('exp(') || expr.startsWith('e^')) {
      return this.exp(z);
    }
    if (expr.startsWith('sin(')) return this.sin(z);
    if (expr.startsWith('cos(')) return this.cos(z);
    if (expr.startsWith('tan(')) return this.tan(z);
    if (expr.startsWith('log(') || expr.startsWith('ln(')) {
      return this.log(z);
    }
    if (expr.startsWith('sqrt(')) return this.sqrt(z);

    // Handle polynomials and operations
    return this.evaluatePolynomial(expr, z);
  }

  private static evaluateParentheses(expr: string, z: Complex): string {
    // Simplified for now - handles basic cases
    return expr;
  }

  private static evaluatePolynomial(expr: string, z: Complex): Complex {
    // Handle z^n patterns
    const powerMatch = expr.match(/z\^(\d+)/);
    if (powerMatch) {
      const power = parseInt(powerMatch[1]);
      return z.pow(power);
    }

    // Handle z^2, z^3, etc.
    if (expr.includes('z^2')) return z.pow(2);
    if (expr.includes('z^3')) return z.pow(3);
    if (expr.includes('z^4')) return z.pow(4);
    if (expr.includes('z^5')) return z.pow(5);

    // Handle 1/z
    if (expr === '1/z') {
      return new Complex(1, 0).div(z);
    }

    // Handle z
    if (expr === 'z') return z;

    return new Complex(0, 0);
  }

  private static exp(z: Complex): Complex {
    const expReal = Math.exp(z.re);
    return new Complex(
      expReal * Math.cos(z.im),
      expReal * Math.sin(z.im)
    );
  }

  private static sin(z: Complex): Complex {
    // sin(z) = (e^(iz) - e^(-iz)) / (2i)
    const iz = new Complex(-z.im, z.re);
    const negIz = new Complex(z.im, -z.re);
    const expIz = this.exp(iz);
    const expNegIz = this.exp(negIz);
    return expIz.sub(expNegIz).div(new Complex(0, 2));
  }

  private static cos(z: Complex): Complex {
    // cos(z) = (e^(iz) + e^(-iz)) / 2
    const iz = new Complex(-z.im, z.re);
    const negIz = new Complex(z.im, -z.re);
    const expIz = this.exp(iz);
    const expNegIz = this.exp(negIz);
    return expIz.add(expNegIz).div(new Complex(2, 0));
  }

  private static tan(z: Complex): Complex {
    return this.sin(z).div(this.cos(z));
  }

  private static log(z: Complex): Complex {
    const r = z.abs();
    const theta = Math.atan2(z.im, z.re);
    return new Complex(Math.log(r), theta);
  }

  private static sqrt(z: Complex): Complex {
    const r = z.abs();
    const theta = Math.atan2(z.im, z.re);
    const sqrtR = Math.sqrt(r);
    return new Complex(
      sqrtR * Math.cos(theta / 2),
      sqrtR * Math.sin(theta / 2)
    );
  }
}
