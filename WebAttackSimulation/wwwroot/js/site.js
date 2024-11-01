"use strict";

document.addEventListener("DOMContentLoaded", function() {
    const VariateType = Object.freeze({
        RW: Symbol("randomWalk"),
        POISSON: Symbol("Poisson"),
        RELATIVE_FREQUENCY: Symbol("relativeFrequency"),
        BERNULLI: Symbol("bernoulli"),
        BROWNIAN: Symbol("brownian"),
        REGRESSION: Symbol("regression") // New process type for regression
    });

    const recomputeBtn = document.getElementById("recomputeBtn");
    const muInput = document.getElementById("muInput");
    const sigmaInput = document.getElementById("sigmaInput");
    const lambdaInput = document.getElementById("lambdaInput");
    const timesInput = document.getElementById("timesInput");
    const pathsInput = document.getElementById("pathsInput");

    const animated = document.getElementById("animated");
    const absoluteFrequency = document.getElementById("absolute");
    const relativeFrequency = document.getElementById("relative");

    const randomWalk = document.getElementById("randomWalk");
    const poisson = document.getElementById("poisson");
    //const relativeFrequency = document.getElementById("relativeFrequency");
    const bernulli = document.getElementById("bernulli");
    const brownian = document.getElementById("brownian");
    const regression = document.getElementById("regression");

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let mu, sigma, lambda, n, numPaths, paths, randomJump, variate, scalingLimit, processType, processDesc, minView, maxView, range, intervalSize, numClasses, xOrigin, yOrigin, histTimeT, histTimeN, avgLast, ssLast, intervalsT, intervalsN, timer, animate, currentPath;

    const chartRect = new Rettangolo(20, 30, canvas.width - 200, canvas.height - 30 - 40);

    let xValues = [];
    let yValues = [];

    recomputeBtn.onclick = main;

    main();

    function main() {
        clearInterval(timer);
        getUserChoices();
        resetVariables();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        paths = [];

        xValues = [];
        yValues = [];

        if (animate) {
            timer = setInterval(animatePaths, 10);
        } else {
            for (let s = 1; s <= numPaths; s++) {
                const newPath = createPath(s);
                paths.push(newPath);
                ctx.lineWidth = 1;
                ctx.strokeStyle = MyChartUtilities.randomColorCSS();
                ctx.stroke(newPath);
            }
            drawHistograms();
            drawLegend();

            if (processType === VariateType.REGRESSION) {
                // Calculate and display regression coefficients and R^2
                const coefficients = calculateRegressionCoefficients(xValues, yValues);
                const r2 = calculateR2(xValues, yValues, coefficients);

                console.log(`Intercept (a): ${coefficients.a}`);
                console.log(`Slope for m (b1): ${coefficients.b1}`);
                console.log(`Slope for p (b2): ${coefficients.b2}`);
                console.log(`R^2: ${r2}`);
            }
        }
    }

    function getUserChoices() {
        mu = Number(muInput.value);
        sigma = Number(sigmaInput.value);
        lambda = Number(lambdaInput.value);
        n = Math.round(Number(timesInput.value));
        numPaths = Number(pathsInput.value);
        numClasses = Math.max(100, numPaths / 60);

        histTimeT = Math.round(n / 2);
        histTimeN = n;
        animate = animated.checked;

        const sigmaRange = 4;

        if (randomWalk.checked) {
            if (absoluteFrequency.checked) {
                setProcess("Random Walk (sum of scaled Rademacher rv's = Σ σ R(-1,1), ±1 jumps, p=.5, mean=0, var = σ² t, std = σ √t", VariateType.RW, false, -sigmaRange * sigma * Math.sqrt(n), sigmaRange * sigma * Math.sqrt(n), () => (Math.random() <= lambda / 100) ? -1 : 1, (sum) => (sigma * sum));
            } else if (relativeFrequency.checked) {
                setProcess("Relative Frequency (f = rel freq = count/t ( Σ σ R(-1,1)), mean = p, var = √p(1-p)/t → 0)", VariateType.RELATIVE_FREQUENCY, false, -1, 1, () => (Math.random() <= lambda / 100) ? -1 : 1, (sum, t) => (sum / t));
            }
        } else if (bernulli.checked) {
            setProcess("Bernulli with rate λ ( ≈ Σ Be(λ), mean=λ, var=λ )", VariateType.BERNULLI, true, 0, lambda * 1.5, () => MyRndUtilities.bernoulliVariate(lambda / 100), (sum) => (sum));
        } else if (poisson.checked) {
            setProcess("Poisson with rate λ/N ( ≈ Σ Be(λ/N), mean=λ, var=λ )", VariateType.POISSON, true, 0, lambda * 1.5, () => MyRndUtilities.bernoulliVariate(lambda / n), (sum) => (sum));
        } else if (brownian.checked) {
            setProcess("Brownian Motion (Σ N( -√(1/n), √(1/n)), mean=0, var = t)", VariateType.BROWNIAN, true, -sigmaRange, sigmaRange, () => (Math.random() <= lambda / n) ? -Math.sqrt(1 / n) : Math.sqrt(1 / n), (sum) => (sum));
        } else if (regression.checked) {
            setProcess("Regression Coefficients (Least Squares Method)", VariateType.REGRESSION, false, 0, n, () => Math.random(), (sum, t) => sum);
        }

        range = maxView - minView;
        intervalSize = range / numClasses;

        [xOrigin, yOrigin] = My2dUtilities.transformXYToViewport([0, 0], 0, n, minView, range, chartRect);
    }

    function setProcess(desc, type, scaling, min, max, jump, varFunc) {
        processDesc = desc;
        processType = type;
        scalingLimit = scaling;
        minView = min;
        maxView = max;
        randomJump = jump;
        variate = varFunc;
    }

    function resetVariables() {
        intervalsT = [];
        intervalsN = [];
        currentPath = 0;
        avgLast = 0;
        ssLast = 0;
    }

    function animatePaths() {
        const newPath = createPath(paths.length + 1);
        paths.push(newPath);
        redraw(true);

        if (paths.length >= numPaths) {
            clearInterval(timer);
            redraw(false);
        }
    }

    function createPath(s) {
        currentPath = s;
        const path = new Path2D();

        let sum = 0;
        let prevY = yOrigin;

        path.moveTo(xOrigin, yOrigin);

        for (let t = 1; t <= n; t++) {
            sum += randomJump();
            let value = variate(sum, t);

            if (processType === VariateType.REGRESSION) {
                const m = t; 
                const p = lambda;
                xValues.push([m, p]);
                yValues.push(value);
            }

            if (t === histTimeT) {
                MyDistributionUtilities.allocateValueInIntervals(value, intervalsT, intervalSize);
            } else if (t === histTimeN) {
                MyDistributionUtilities.allocateValueInIntervals(value, intervalsN, intervalSize);
                [avgLast, ssLast] = MyDistributionUtilities.UpdateMeanAndSS(value, s, [avgLast, ssLast]);
            }

            const x = My2dUtilities.transformX(t / n, 0, 1, chartRect.x, chartRect.width);
            const y = My2dUtilities.transformY(value, minView, range, chartRect.y, chartRect.height);

            path.lineTo(x, prevY);
            prevY = y;
            path.lineTo(x, y);
        }

        return path;
    }

    function redraw(allGray) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of paths) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = allGray ? MyChartUtilities.randomRgbaString(0.2) : MyChartUtilities.randomColorCSS();
            ctx.stroke(p);
        }
        if (allGray) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.stroke(paths[paths.length - 1]);
        }

        drawHistograms();
        drawLegend();
    }

    function drawHistograms() {
        const histRectT = new Rettangolo(My2dUtilities.transformX(histTimeT, 0, n, chartRect.x, chartRect.width), chartRect.y, 150, chartRect.height);
        const histRectN = new Rettangolo(My2dUtilities.transformX(histTimeN, 0, n, chartRect.x, chartRect.width), chartRect.y, 150, chartRect.height);
        histRectT.disegnaRettangolo(ctx, "rgba(100,100,250,0.5)", 2, [1, 1]);
        histRectN.disegnaRettangolo(ctx, "rgba(250,100,150,0.5)", 2, [1, 1]);

        MyChartUtilities.verticalHistoFromIntervals(ctx, intervalsT, minView, maxView - minView, histRectT, "red", 1, "red");
        MyChartUtilities.verticalHistoFromIntervals(ctx, intervalsN, minView, maxView - minView, histRectN, "green", 1, "lightgreen");
    }

    function drawLegend() {
        chartRect.disegnaRettangolo(ctx, "darkblue", 2, []);

        ctx.font = "11px Verdana";
        ctx.fillStyle = "white";
        ctx.fillText(maxView.toFixed(1), chartRect.right() + 10, chartRect.y - 7);
        ctx.fillText(minView.toFixed(1), chartRect.right() + 10, chartRect.bottom() - 7);
        ctx.fillStyle = "lightblue";
        ctx.fillText("paths: " + currentPath + "  avg = " + avgLast.toFixed(2) + "  var = " + (ssLast / numPaths).toFixed(2), chartRect.x + 350, chartRect.bottom() + 30);
        ctx.fillStyle = "white";
        ctx.fillText(processDesc, chartRect.x + 100, chartRect.y + 15);

        ctx.beginPath();

        if (scalingLimit) {
            ctx.fillStyle = "orange";
            ctx.strokeStyle = "orange";
            for (let t = 0; t <= 1; t += 0.1) {
                let x = My2dUtilities.transformX(t, 0, 1, chartRect.x, chartRect.width);
                ctx.moveTo(x, chartRect.bottom() - 3);
                ctx.lineTo(x, chartRect.bottom() + 3);
                ctx.fillText(t.toFixed(1).toString(), x - 5, chartRect.bottom() + 15);
            }
        }

        ctx.stroke();
    }

    window.onload = main;
});

/**
 * Calculate the regression coefficients (a and b) using the least squares method.
 * @param {Array<Array<number>>} x - Array of [m, p] values.
 * @param {Array<number>} y - Array of y values.
 * @returns {Object} - Object containing the slope (b) and intercept (a).
 */
function calculateRegressionCoefficients(x, y) {
    const n = x.length;
    const sumX1 = x.reduce((acc, val) => acc + val[0], 0);
    const sumX2 = x.reduce((acc, val) => acc + val[1], 0);
    const sumY = y.reduce((acc, val) => acc + val, 0);
    const sumX1Y = x.reduce((acc, val, i) => acc + val[0] * y[i], 0);
    const sumX2Y = x.reduce((acc, val, i) => acc + val[1] * y[i], 0);
    const sumX1X2 = x.reduce((acc, val) => acc + val[0] * val[1], 0);
    const sumX1X1 = x.reduce((acc, val) => acc + val[0] * val[0], 0);
    const sumX2X2 = x.reduce((acc, val) => acc + val[1] * val[1], 0);

    const denominator = n * sumX1X1 * sumX2X2 + 2 * sumX1 * sumX2 * sumX1X2 - sumX1 * sumX1 * sumX2X2 - sumX2 * sumX2 * sumX1X1 - n * sumX1X2 * sumX1X2;

    const a = (sumY * sumX1X1 * sumX2X2 + sumX1 * sumX2 * sumX1Y * sumX2Y - sumX1 * sumX1 * sumX2Y - sumX2 * sumX2 * sumX1Y - sumY * sumX1X2 * sumX1X2) / denominator;
    const b1 = (n * sumX1Y * sumX2X2 + sumX1 * sumX2 * sumY * sumX2Y - sumX1 * sumX1 * sumX2Y - sumX2 * sumX2 * sumX1Y - n * sumX1X2 * sumX2Y) / denominator;
    const b2 = (n * sumX1X1 * sumX2Y + sumX1 * sumX2 * sumX1Y * sumY - sumX1 * sumX1 * sumX2Y - sumX2 * sumX2 * sumX1Y - n * sumX1X2 * sumX1Y) / denominator;

    return { a, b1, b2 };
}

/**
 * Calculate the coefficient of determination (R^2).
 * @param {Array<Array<number>>} x - Array of [m, p] values.
 * @param {Array<number>} y - Array of y values.
 * @param {Object} coefficients - Object containing the intercept (a) and slopes (b1, b2).
 * @returns {number} - The R^2 value.
 */
function calculateR2(x, y, coefficients) {
    const { a, b1, b2 } = coefficients;
    const meanY = y.reduce((acc, val) => acc + val, 0) / y.length;

    const ssTotal = y.reduce((acc, val) => acc + Math.pow(val - meanY, 2), 0);
    const ssResidual = y.reduce((acc, val, i) => acc + Math.pow(val - (a + b1 * x[i][0] + b2 * x[i][1]), 2), 0);

    return 1 - ssResidual / ssTotal;
}