"use strict";

class Inversion {
    static drawInversion(ctx, histRectN, numDraws, numIntervals) {
        // Initialize the intervals
        let intervals = [];
        let value = 0;
        for (let i = 0; i <= numIntervals; i++) {
            value = (1 / numIntervals) * i;
            MyDistributionUtilities.allocateValueInIntervals(value, intervals, 1 / numIntervals);
        }

        // Initialize the count array
        for (let i = 0; i < numIntervals; i++) {
            intervals[i].count = 0;
        }

        // Variables for mean and variance calculation using Welford's algorithm
        let mean = 0;
        let m2 = 0;
        let variance = 0;

        // Array to store points (x, y)
        let points = [];

        // Randomly allocate draws to intervals and update mean and variance
        for (let i = 0; i < numDraws; i++) {
            let draw = Math.random();
            let intervalIndex = Math.floor(draw * numIntervals);

            // Ensure the index is within bounds
            if (intervalIndex >= 0 && intervalIndex < numIntervals) {
                intervals[intervalIndex].count++;

                // Update mean and variance using Welford's algorithm
                let delta = draw - mean;
                mean += delta / (i + 1);
                let delta2 = draw - mean;
                m2 += delta * delta2;
                variance = m2 / (i + 1);

                // Store the point (x, y)
                points.push({ x: intervalIndex, y: draw });
            }
        }

        // Theoretical mean and variance for a uniform distribution [0, 1]
        const theoreticalMean = 0.5;
        const theoreticalVariance = 1 / 12;

        // Draw the rectangles
        Inversion.drawRectangles(ctx, histRectN, intervals);

        // Draw the computed and theoretical values below the histogram
        ctx.font = "14px Consolas";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(`Computed Mean (Σxᵢ / n): ${mean.toFixed(4)}`, histRectN.x, histRectN.y + histRectN.height + 40);
        ctx.fillText(`Computed Variance (Σ(xᵢ - μ)² / n): ${variance.toFixed(4)}`, histRectN.x, histRectN.y + histRectN.height + 60);
        ctx.fillText(`Theoretical Mean: ${theoreticalMean}`, histRectN.x + 250, histRectN.y + histRectN.height + 40);
        ctx.fillText(`Theoretical Variance: ${theoreticalVariance.toFixed(4)}`, histRectN.x + 250, histRectN.y + histRectN.height + 60);

        // Calculate mean y-values for each x interval
        let meanPoints = [];
        for (let i = 0; i < numIntervals; i++) {
            let sumY = 0;
            let count = 0;
            for (let point of points) {
                if (point.x === i) {
                    sumY += point.y;
                    count++;
                }
            }
            if (count > 0) {
                meanPoints.push({ x: i, y: sumY / count });
            }
        }
        const spacing = 10;
        const barWidth = (histRectN.width - (intervals.length + 1) * spacing) / intervals.length; // Adjust bar width
        const maxBarHeight = histRectN.height - 50;

        // Draw the smooth approximation line that unites the mean points
        ctx.beginPath();
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 3;
        for (let i = 0; i < meanPoints.length - 1; i++) {
            const point = meanPoints[i];
            const nextPoint = meanPoints[i + 1];
            const x = histRectN.x + spacing + point.x * (barWidth + spacing) + barWidth / 2;
            const y = histRectN.y + histRectN.height - point.y * maxBarHeight;
            const nextX = histRectN.x + spacing + nextPoint.x * (barWidth + spacing) + barWidth / 2;
            const nextY = histRectN.y + histRectN.height - nextPoint.y * maxBarHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            }

            const cp1x = (x + nextX) / 2;
            const cp1y = y;
            const cp2x = (x + nextX) / 2;
            const cp2y = nextY;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextX, nextY);
        }
        ctx.stroke();
    }

    static drawRectangles(ctx, histRectN, intervals) {
        // Determine the maximum count to scale the bars
        let maxcount = 0;
        for (const interval of intervals) {
            maxcount = Math.max(maxcount, interval.count);
        }

        // Define spacing and bar dimensions
        const spacing = 10; // Space between bars
        const barWidth = (histRectN.width - (intervals.length + 1) * spacing) / intervals.length; // Adjust bar width
        const maxBarHeight = histRectN.height - 50; // Reserve space for labels

        // Set font for labels
        ctx.font = "10px Verdana";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Iterate through intervals and draw each bar
        for (let i = 0; i < intervals.length; i++) {
            const interval = intervals[i];

            const barHeight = (interval.count / maxcount) * maxBarHeight;
            const x = histRectN.x + spacing + i * (barWidth + spacing);
            const y = histRectN.y + histRectN.height - barHeight; // Adjust y-coordinate

            // Draw the bar
            ctx.fillStyle = '#FF4500'; // Red color
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.strokeStyle = 'black'; // Black border
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barWidth, barHeight);

            // Draw the count label
            ctx.fillStyle = "white";
            ctx.fillText(interval.count.toString(), x + barWidth / 2, y - 10);

            if (i % 5 == 0 || i == intervals.length - 1) {
                // Draw the interval range label
                const label = `[${interval.lower.toFixed(2)}, ${interval.upper.toFixed(2)})`;
                ctx.fillText(label, x + barWidth / 2, histRectN.y + histRectN.height + 20);
            }
        }
    }
}