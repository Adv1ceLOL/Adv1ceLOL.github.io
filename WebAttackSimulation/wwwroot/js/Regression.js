class Regression {
    constructor(xData, yData) {
        this.xData = xData;
        this.yData = yData;
        this.a = 0; 
        this.b = 0; 
        this.rSquared = 0; 
    }

    addDataPoint(x, y) {
        this.xData.push(x);
        this.yData.push(y);
    }

    calculateCoefficients() {
        const n = this.xData.length;
        const xMean = this.xData.reduce((a, b) => a + b, 0) / n;
        const yMean = this.yData.reduce((a, b) => a + b, 0) / n;

        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < n; i++) {
            numerator += (this.xData[i] - xMean) * (this.yData[i] - yMean);
            denominator += (this.xData[i] - xMean) ** 2;
        }

        this.b = numerator / denominator; 
        this.a = yMean - this.b * xMean; 
    }

    calculateR2() {
        const n = this.yData.length;
        const yMean = this.yData.reduce((a, b) => a + b, 0) / n;

        let sst = 0;
        let ssr = 0;

        for (let i = 0; i < n; i++) {
            const yPred = this.b * this.xData[i] + this.a;
            ssr += (this.yData[i] - yPred) ** 2;
            sst += (this.yData[i] - yMean) ** 2;
        }

        this.rSquared = 1 - (ssr / sst);
    }

    drawPlot(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set up canvas scaling 
        const padding = 50;
        const xScale = (canvas.width - 2 * padding) / Math.max(...this.xData);
        const yScale = (canvas.height - 2 * padding) / Math.max(...this.yData);

        // Draw data points
        this.xData.forEach((x, i) => {
            const y = this.yData[i];
            ctx.fillStyle = MyChartUtilities.randomColorCSS(); // Use random color for each point
            ctx.beginPath();
            ctx.arc(x * xScale + padding, canvas.height - (y * yScale + padding), 2, 0, Math.PI * 2);             
            ctx.fill();
        });

        // Draw regression line with black border
        const xStart = Math.min(...this.xData);
        const yStart = this.b * xStart + this.a;
        const xEnd = Math.max(...this.xData);
        const yEnd = this.b * xEnd + this.a;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4; // Thicker width for the border
        ctx.beginPath();
        ctx.moveTo(xStart * xScale + padding, canvas.height - (yStart * yScale + padding));
        ctx.lineTo(xEnd * xScale + padding, canvas.height - (yEnd * yScale + padding));
        ctx.stroke();

        // Draw regression line with red color on top
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2; // Slightly thinner width for the red line
        ctx.beginPath();
        ctx.moveTo(xStart * xScale + padding, canvas.height - (yStart * yScale + padding));
        ctx.lineTo(xEnd * xScale + padding, canvas.height - (yEnd * yScale + padding));
        ctx.stroke();
    }
}
