class IntegralCalculator {
    constructor(func, a, b, n) {
        this.func = func; // Function to integrate
        this.a = a;       // Lower limit
        this.b = b;       // Upper limit
        this.n = n;       // Number of intervals
    }

    computeRiemannIntegral() {
        const deltaX = (this.b - this.a) / this.n;
        let sum = 0;
        for (let i = 0; i < this.n; i++) {
            const x = this.a + i * deltaX;
            sum += this.func(x) * deltaX;
        }
        return sum;
    }

    computeLebesgueIntegral() {
        const samples = [];
        const deltaX = (this.b - this.a) / this.n;
        for (let i = 0; i <= this.n; i++) {
            const x = this.a + i * deltaX;
            samples.push(this.func(x));
        }
        const yMin = Math.min(...samples);
        const yMax = Math.max(...samples);
        const deltaY = (yMax - yMin) / this.n;

        let sum = 0;
        for (let i = 0; i < this.n; i++) {
            const y = yMin + i * deltaY;
            const measure = this.computeMeasure(y);
            sum += y * measure;
        }
        return sum;
    }

    computeMeasure(y) {
        const deltaX = (this.b - this.a) / this.n;
        let measure = 0;
        for (let i = 0; i < this.n; i++) {
            const x = this.a + i * deltaX;
            if (this.func(x) >= y) {
                measure += deltaX;
            }
        }
        return measure;
    }
}