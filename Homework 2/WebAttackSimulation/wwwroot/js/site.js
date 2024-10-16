"use strict";

document.addEventListener("DOMContentLoaded", function() {
    const VariateType = Object.freeze({
        RW: Symbol("randomWalk"),
        POISSON: Symbol("Poisson"),
        RELATIVE_FREQUENCY: Symbol("relativeFrequency"),
    });

    const recomputeBtn = document.getElementById("recomputeBtn");
    const muInput = document.getElementById("muInput");
    const sigmaInput = document.getElementById("sigmaInput");
    const lambdaInput = document.getElementById("lambdaInput");
    const timesInput = document.getElementById("timesInput");
    const pathsInput = document.getElementById("pathsInput");

    const animated = document.getElementById("animated");

    const randomWalk = document.getElementById("randomWalk");
    const poisson = document.getElementById("poisson");
    const relativeFrequency = document.getElementById("relativeFrequency");

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let mu, sigma, lambda, n, numPaths, paths, randomJump, variate, scalingLimit, processType, processDesc, minView, maxView, range, intervalSize, numClasses, xOrigin, yOrigin, histTimeT, histTimeN, avgLast, ssLast, intervalsT, intervalsN, timer, animate, currentPath;

    const chartRect = new Rettangolo(20, 30, canvas.width - 200, canvas.height - 30 - 40);

    recomputeBtn.onclick = main;

    main();

    function main() {
        clearInterval(timer);
        getUserChoices();
        resetVariables();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        paths = [];

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
            setProcess("Random Walk (sum of scaled Rademacher rv's = Σ σ R(-1,1), ±1 jumps, p=.5, mean=0, var = σ² t, std = σ √t", VariateType.RW, false, -sigmaRange * sigma * Math.sqrt(n), sigmaRange * sigma * Math.sqrt(n), () => MyRndUtilities.RademacherVariate(), (sum) => (sigma * sum));
        } else if (poisson.checked) {
            setProcess("Poisson with rate λ ( ≈ Σ Be(λ/n), mean=λ, var=λ )", VariateType.POISSON, false, 0, lambda * 1.5, () => MyRndUtilities.bernoulliVariate(lambda / n), (sum) => (sum));
        } else if (relativeFrequency.checked) {
            setProcess("Relative Frequency (f = rel freq = count/t ( Σ σ R(-1,1)), mean = p, var = √p(1-p)/t → 0)", VariateType.RELATIVE_FREQUENCY, false, -1, 1, () => MyRndUtilities.RademacherVariate(), (sum,t) => (sum / t));
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

            console.log("t = " + t + "  sum = " + sum + "  value = " + value);
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