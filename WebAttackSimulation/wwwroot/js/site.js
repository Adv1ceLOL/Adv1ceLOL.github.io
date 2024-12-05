"use strict";

document.addEventListener("DOMContentLoaded", function() {
    const VariateType = Object.freeze({
        RW: Symbol("randomWalk"),
        POISSON: Symbol("Poisson"),
        RELATIVE_FREQUENCY: Symbol("relativeFrequency"),
        BERNULLI: Symbol("bernoulli"),
        BROWNIAN: Symbol("brownian"),
        REGRESSION: Symbol("regression"),
        INTERVAL: Symbol("interval"),
        INVERSION: Symbol("inversion"),
        MEANMV: Symbol("meanMV"),
        CRYPTO_ANALYSIS: Symbol("cryptoAnalysis")
    });

    const recomputeBtn = document.getElementById("recomputeBtn");
    const muInput = document.getElementById("muInput");
    const sigmaInput = document.getElementById("sigmaInput");
    const lambdaInput = document.getElementById("lambdaInput");
    const timesInput = document.getElementById("timesInput");
    const pathsInput = document.getElementById("pathsInput");

    // New Inputs for Interval Simulation
    const numDrawsInput = document.getElementById("numDraws");
    const numIntervalsInput = document.getElementById("numIntervals"); 

    const animated = document.getElementById("animated");
    const absoluteFrequency = document.getElementById("absolute");
    const relativeFrequency = document.getElementById("relative");

    const randomWalk = document.getElementById("randomWalk");
    const poisson = document.getElementById("poisson");
    //const relativeFrequency = document.getElementById("relativeFrequency");
    const bernulli = document.getElementById("bernulli");
    const brownian = document.getElementById("brownian");
    const regression = document.getElementById("regression");
    const interval = document.getElementById("interval");
    const inversion = document.getElementById("inversion");
    const meanMV = document.getElementById("meanMV");
    const cryptoAnal = document.getElementById("cryptoAnalysis");

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let mu, sigma, lambda, n, numPaths, paths, randomJump, variate, scalingLimit, processType, processDesc, minView, maxView, range, intervalSize, numClasses, xOrigin, yOrigin, histTimeT, histTimeN, avgLast, ssLast, intervalsT, intervalsN, timer, animate, currentPath, currentT;

    let regressionModel; 
    let boundieries;

    let flag = true;

    const chartRect = new Rettangolo(20, 30, canvas.width - 200, canvas.height - 60 - 40);

    recomputeBtn.onclick = main;

    main();

    function main() {
        clearInterval(timer);
        getUserChoices();
        resetVariables();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        paths = [];

        if (processType === VariateType.REGRESSION) {
            regressionModel = new Regression([], []);
            if (animate) {
                timer = setInterval(animateRegressionPaths, 50);
            } else {
                const xData = [];
                const yData = [];
                // Collect exactly n data points
                for (let t = 1; t <= n; t++) {
                    const value = variate(randomJump(), t);
                    xData.push(t);
                    yData.push(value);
                }
                regressionModel = new Regression(xData, yData);
                regressionModel.calculateCoefficients();
                regressionModel.calculateR2();
                regressionModel.drawPlot('canvas');
                drawLegendRegression();
            }
        } else if (processType === VariateType.INTERVAL) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //MyChartUtilities.randomDrawDistribution(numDrawsInput.value, numIntervalsInput.value, intervalsN);
            
            const histRectN = new Rettangolo(My2dUtilities.transformY(histTimeN, 0, n, chartRect.x + 40, chartRect.width), chartRect.y - 20, chartRect.width + 120, chartRect.height + 40);
            histRectN.disegnaRettangolo(ctx, "rgba(0,255,0 )", 2, [1, 1]);

            MyChartUtilities.horizontalHistoFromIntervals(ctx, intervalsN, histRectN, 1, "lightgreen", numDrawsInput.value, numIntervalsInput.value);

            
        } else if (processType === VariateType.INVERSION) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const histRectN = new Rettangolo(My2dUtilities.transformY(histTimeN, 0, n, chartRect.x + 40, chartRect.width), chartRect.y - 20, chartRect.width + 120, chartRect.height + 40);
            histRectN.disegnaRettangolo(ctx, "rgba(0,255,0 )", 2, [1, 1]);
            Inversion.drawInversion(ctx, histRectN, numDrawsInput.value, numIntervalsInput.value);

        } else if (processType === VariateType.MEANMV) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const histRectN = new Rettangolo(My2dUtilities.transformY(histTimeN, 0, n, chartRect.x + 40, chartRect.width), chartRect.y - 20, chartRect.width + 120, chartRect.height + 40);
            histRectN.disegnaRettangolo(ctx, "rgba(0,255,0 )", 2, [1, 1]);

            let meanArray = [];
            let varianceArray = [];
            let intervalsMean = [];
            let intervalsVar = [];

            // Theoretical mean and variance for a uniform distribution [0, 1]
            const theoreticalMean = 0.5;
            const theoreticalVariance = 1 / 12;
            
            let value = 0;
            for (let i = 0; i <= numIntervalsInput.value; i++) {
                value = (1 / numIntervalsInput.value) * i;
                MyDistributionUtilities.allocateValueInIntervals(value, intervalsMean, 1 / numIntervalsInput.value);
                MyDistributionUtilities.allocateValueInIntervals(value, intervalsVar, 1 / numIntervalsInput.value);
            }

            for (let i = 0; i < numIntervalsInput.value; i++) {
                intervalsMean[i].count = 0;
                intervalsVar[i].count = 0;
            }

            for(let i = 0; i < numIntervalsInput.value; i++) {
                console.log("Mean and Variance", i);
                MyChartUtilities.MeanAndVariance(intervalsMean, intervalsVar, numIntervalsInput.value, numDrawsInput.value, i, meanArray, varianceArray, 0);
            }
            if(window.parent.location.href.includes('hw7.html')){      
                const [MeanMean, MeanVariance] = MyChartUtilities.MeanMeanAndMeanVariance(meanArray, varianceArray);
                //console.log("Mean of the Mean: " + MeanMean + " Mean of the Variance: " + MeanVariance);
            
                // Send data to hw7.html
                const data = {
                    meanArray: meanArray,
                    varianceArray: varianceArray,
                    MeanMean: MeanMean,
                    MeanVariance: MeanVariance,
                    TheoreticalMean: theoreticalMean,
                    TheoreticalVariance: theoreticalVariance
                };
                window.parent.postMessage(data, '*');

                MyChartUtilities.drawRectangles(ctx, histRectN, intervalsMean, intervalsVar, numIntervalsInput.value);

                // Create the "See Results" button
                let seeResultsButton = document.getElementById('seeResultsButton');
                if (!seeResultsButton) {
                    seeResultsButton = document.createElement('button');
                    seeResultsButton.id = 'seeResultsButton';
                    seeResultsButton.textContent = 'See Detailed Results';
                    seeResultsButton.style.position = 'relative';
                    seeResultsButton.style.bottom = '270px';
                    seeResultsButton.style.left = '800px';
                    seeResultsButton.className = 'btn btn-primary';
        
                    seeResultsButton.addEventListener('click', function() {
                        // Send a message to the parent window to scroll down
                        window.parent.postMessage({ action: 'scrollDown' }, '*');
                    });
        
                    document.body.appendChild(seeResultsButton);
                }
                
            } else if(window.parent.location.href.includes('hw9.html')){      
                const [varianceMean, varianceVariance] = MyChartUtilities.VarianceMeanAndVarianceVariance(meanArray, varianceArray);
                console.log("varianceMean: ", varianceMean, "varianceVariance:", varianceVariance);

                // Assuming you have access to the population variance and sample size
                const populationVariance = 0.083; 
                const sampleSize = numIntervalsInput.value; 

                // Calculate Theoretical Variance of the Mean
                const theoreticalMeanVar = populationVariance / sampleSize;

                // Calculate Theoretical Variance of the Variance (assuming normal distribution)
                const theoreticalVarianceVar = (2 * Math.pow(populationVariance, 2)) / (sampleSize - 1);

            
                // Send data to hw9.html
                const data = {
                    meanArray: meanArray,
                    varianceArray: varianceArray,
                    VarianceMean: varianceMean,
                    VarianceVariance: varianceVariance,
                    TheoreticalMean: theoreticalMeanVar,
                    TheoreticalVariance: theoreticalVarianceVar
                };
                window.parent.postMessage(data, '*');
            
                MyChartUtilities.drawRectangles(ctx, histRectN, intervalsMean, intervalsVar, numIntervalsInput.value);
            
                // Create the "See Results" button
                let seeResultsButton = document.getElementById('seeResultsButton');
                if (!seeResultsButton) {
                    seeResultsButton = document.createElement('button');
                    seeResultsButton.id = 'seeResultsButton';
                    seeResultsButton.textContent = 'See Detailed Results';
                    seeResultsButton.style.position = 'relative';
                    seeResultsButton.style.bottom = '270px';
                    seeResultsButton.style.left = '800px';
                    seeResultsButton.className = 'btn btn-primary';
            
                    seeResultsButton.addEventListener('click', function() {
                        // Send a message to the parent window to scroll down
                        window.parent.postMessage({ action: 'scrollDown' }, '*');
                    });
            
                    document.body.appendChild(seeResultsButton);
                }
            }

        } else if (processType === VariateType.CRYPTO_ANALYSIS) {
            const max_U = parseInt(document.getElementById('max_U').value) || 1000;
            const results = Crypto.performCryptoAnalysis(max_U, ctx);

            // Send results to parent window
            if (window.parent) {
                window.parent.postMessage({
                    action: 'updateCryptoResults',
                    results: results
                }, '*');
            }
        }
        else {
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

        if (window.parent) {
            let processId = '';
            if (meanMV.checked) {
                processId = 'meanMV';
            } else if (cryptoAnal.checked) {
                processId = 'cryptoAnalysis';
            } else {
                processId = 'other';
            }
    
            window.parent.postMessage({
                action: 'processSelected',
                processId: processId
            }, '*');
        }

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
            setProcess("", VariateType.REGRESSION, true, 0, n, () => Math.random(), (sum, t) => sum);
        } else if (interval.checked) {
            setProcess("Interval Simulation", VariateType.INTERVAL, false, 0, 1, () => Math.random(), (sum, t) => sum);
        }  else if (inversion.checked) {
            setProcess("Inversion Method", VariateType.INVERSION, false, 0, 1, () => Math.random(), (sum, t) => sum);
        }   else if (meanMV.checked) {  
            setProcess("Mean and Variance", VariateType.MEANMV, false, 0, 1, () => Math.random(), (sum, t) => sum);
        } else if (cryptoAnal.checked) {
            setProcess("Crypto Analysis", VariateType.CRYPTO_ANALYSIS, false, 0, 1, () => Math.random(), (sum, t) => sum);
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
        currentT = 0;
        regressionModel = null; // Reset the regression model
        flag = true; // Reset the flag
    }

    function animateRegressionPaths() {
        if (currentT >= n) {
            clearInterval(timer);
            regressionModel.calculateCoefficients();
            regressionModel.calculateR2();
            regressionModel.drawPlot('canvas');
            drawLegendRegression();
            
            return;
        }

        currentT++;
        const t = currentT;
        const value = variate(randomJump(), t);
        regressionModel.addDataPoint(t, value);

        regressionModel.calculateCoefficients();
        regressionModel.calculateR2();
        regressionModel.drawPlot('canvas');
        drawLegendRegression();

        if (currentT >= n) {
            clearInterval(timer);
        }
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
                regressionModel.addDataPoint(t, value);
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
        ctx.fillText(processDesc, chartRect.x + 170, chartRect.y + 15);

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

    function drawLegendRegression() {
        // Increase the width of the rectangle by adjusting the parameters
        const rectWidth = chartRect.width + 105; 
        const rectHeight = chartRect.height;
        
        
    
        ctx.beginPath();
        ctx.rect(chartRect.x + 30, chartRect.y, rectWidth, rectHeight);
        ctx.strokeStyle = "darkblue";
        ctx.lineWidth = 2;
        ctx.stroke();
    
        ctx.font = "15px Consolas";
        ctx.fillStyle = "white";
        ctx.fillText(maxView.toFixed(1), chartRect.right() + 90, chartRect.y - 7);
        ctx.fillText(minView.toFixed(1), chartRect.right() + 100, chartRect.bottom() - 7);
        ctx.fillStyle = "lightblue";
        ctx.fillText(
            `Y = ${regressionModel.a.toFixed(2)}X + ${regressionModel.b.toFixed(2)}     R² = ${regressionModel.rSquared.toFixed(2)}`,
            chartRect.x + 380,
            chartRect.bottom() + 30
        );
        ctx.fillStyle = "white";
        ctx.fillText(processDesc, chartRect.x + 130, chartRect.y + 15);
    
        ctx.beginPath();
    
        if (scalingLimit) {
            ctx.fillStyle = "orange";
            ctx.strokeStyle = "orange";
            for (let t = 0; t <= n; t += n/10) {
                let x = My2dUtilities.transformX(t, 0, n, chartRect.x + 30, rectWidth);
                ctx.moveTo(x, chartRect.bottom() - 3);
                ctx.lineTo(x, chartRect.bottom() + 3);
                ctx.fillText(t.toFixed(1).toString(), x - 5, chartRect.bottom() + 15);
            }
            for (let t = 0; t <= 1; t += 0.1) {
                let y = My2dUtilities.transformY(t, 0, 1, chartRect.y, rectHeight);
                ctx.moveTo(chartRect.left() + 27, y); 
                ctx.lineTo(chartRect.left() + 33, y); 
                ctx.fillText(t.toFixed(1).toString(), chartRect.left(), y); 
            }
        }
    
        ctx.stroke();
    }

    window.onload = main;
});