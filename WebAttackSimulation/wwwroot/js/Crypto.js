"use strict";

class Crypto {

    static performCryptoAnalysis(max_U, ctx) {
        const cases = [
            {
                name: 'Cases A',
                n: 19,
                gs: [2, 3, 10, 17]
            },
            {
                name: 'Cases B',
                n: 15,
                gs: [3, 6, 9, 12]
            }
        ];

        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Grid dimensions
        const cols = 4; // 4 columns for gs
        const rows = 2; // 2 rows for cases
        const cellWidth = ctx.canvas.width / cols;
        const cellHeight = ctx.canvas.height / rows;

        const results = [];

        // Loop through cases and gs
        cases.forEach((caseItem, rowIndex) => {
            const { name, n, gs } = caseItem;

            gs.forEach((g, colIndex) => {
                const distribution = {};
                const probabilities = {};

                // Compute Y = g^U mod n for all U
                for (let U = 1; U <= max_U; U++) {
                    const Y = Crypto.modPow(g, U, n);
                    distribution[Y] = (distribution[Y] || 0) + 1;
                }

                // Calculate probabilities
                Object.keys(distribution).forEach(key => {
                    probabilities[key] = distribution[key] / max_U;
                });

                // Compute entropy
                const entropy = Crypto.calculateEntropy(probabilities);

                // Collect detailed results
                const totalCounts = Object.values(distribution).reduce((sum, count) => sum + count, 0);
                const possibleYValues = Object.keys(distribution).map(Number).sort((a, b) => a - b);

                results.push({
                    caseName: name,
                    n: n,
                    g: g,
                    entropy: entropy,
                    distribution: distribution,
                    totalCounts: totalCounts,
                    possibleYValues: possibleYValues,
                    maxU: max_U
                });

                // Plot the distribution
                Crypto.plotDistribution(ctx, distribution, {
                    x: colIndex * cellWidth,
                    y: rowIndex * cellHeight,
                    width: cellWidth,
                    height: cellHeight,
                    n,
                    g,
                    entropy,
                    maxFrequency: Math.max(...Object.values(distribution))
                });
            });
        });

        // Return the results
        return results;
    }

    static plotDistribution(ctx, distribution, options) {
        const { x, y, width, height, n, g, entropy, maxFrequency } = options;

        // Set margins
        const margin = 40;
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;

        // Draw background rectangle (optional)
        ctx.strokeStyle = '#CCCCCC';
        ctx.strokeRect(x, y, width, height);

        // Draw title
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`n=${n}, g=${g}, H=${entropy.toFixed(2)}`, x + width / 2, y + 5);

        // Prepare the data
        const Y_values = Object.keys(distribution).map(Number).sort((a, b) => a - b);
        const frequencies = Y_values.map(Y => distribution[Y]);

        // Draw the histogram
        const barWidth = innerWidth / Y_values.length;
        Y_values.forEach((Y, index) => {
            const frequency = distribution[Y];
            const barHeight = (frequency / maxFrequency) * innerHeight;
            const barX = x + margin + index * barWidth;
            const barY = y + height - margin - barHeight;

            ctx.fillStyle = Crypto.getRandomColor();
            ctx.fillRect(barX, barY, barWidth - 1, barHeight);

            // Optionally, add X-axis labels if space allows
            if (barWidth > 15) {
                ctx.fillStyle = 'white';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(Y.toString(), barX + barWidth / 2, y + height - margin + 5);
            }
        });

        // Draw Y-axis (optional)
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(x + margin, y + margin);
        ctx.lineTo(x + margin, y + height - margin);
        ctx.stroke();

        // Draw X-axis (optional)
        ctx.beginPath();
        ctx.moveTo(x + margin, y + height - margin);
        ctx.lineTo(x + width - margin, y + height - margin);
        ctx.stroke();
    }

    static getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    static modPow(base, exponent, modulus) {
        if (modulus === 1) return 0;
        let result = 1;
        base = base % modulus;
        while (exponent > 0) {
            if (exponent % 2 === 1) { // If exponent is odd
                result = (result * base) % modulus;
            }
            exponent = Math.floor(exponent / 2);
            base = (base * base) % modulus;
        }
        return result;
    }

    static calculateEntropy(probabilities) {
        let entropy = 0;
        Object.values(probabilities).forEach(p => {
            if (p > 0) {
                entropy -= p * Math.log2(p);
            }
        });
        return entropy;
    }

    static  CSS_COLORS = [
        "AliceBlue",
        "AntiqueWhite",
        "Aqua",
        "Aquamarine",
        "Azure",
        "Beige",
        "Bisque",
        "Black",
        "BlanchedAlmond",
        "Blue",
        "BlueViolet",
        "Brown",
        "BurlyWood",
        "CadetBlue",
        "Chartreuse",
        "Chocolate",
        "Coral",
        "CornflowerBlue",
        "Cornsilk",
        "Crimson",
        "Cyan",
        "DarkBlue",
        "DarkCyan",
        "DarkGoldenRod",
        "DarkGray",
        "DarkGrey",
        "DarkGreen",
        "DarkKhaki",
        "DarkMagenta",
        "DarkOliveGreen",
        "DarkOrange",
        "DarkOrchid",
        "DarkRed",
        "DarkSalmon",
        "DarkSeaGreen",
        "DarkSlateBlue",
        "DarkSlateGray",
        "DarkSlateGrey",
        "DarkTurquoise",
        "DarkViolet",
        "DeepPink",
        "DeepSkyBlue",
        "DimGray",
        "DimGrey",
        "DodgerBlue",
        "FireBrick",
        "FloralWhite",
        "ForestGreen",
        "Fuchsia",
        "Gainsboro",
        "GhostWhite",
        "Gold",
        "GoldenRod",
        "Gray",
        "Grey",
        "Green",
        "GreenYellow",
        "HoneyDew",
        "HotPink",
        "IndianRed",
        "Indigo",
        "Ivory",
        "Khaki",
        "Lavender",
        "LavenderBlush",
        "LawnGreen",
        "LemonChiffon",
        "LightBlue",
        "LightCoral",
        "LightCyan",
        "LightGoldenRodYellow",
        "LightGray",
        "LightGrey",
        "LightGreen",
        "LightPink",
        "LightSalmon",
        "LightSeaGreen",
        "LightSkyBlue",
        "LightSlateGray",
        "LightSlateGrey",
        "LightSteelBlue",
        "LightYellow",
        "Lime",
        "LimeGreen",
        "Linen",
        "Magenta",
        "Maroon",
        "MediumAquaMarine",
        "MediumBlue",
        "MediumOrchid",
        "MediumPurple",
        "MediumSeaGreen",
        "MediumSlateBlue",
        "MediumSpringGreen",
        "MediumTurquoise",
        "MediumVioletRed",
        "MidnightBlue",
        "MintCream",
        "MistyRose",
        "Moccasin",
        "NavajoWhite",
        "Navy",
        "OldLace",
        "Olive",
        "OliveDrab",
        "Orange",
        "OrangeRed",
        "Orchid",
        "PaleGoldenRod",
        "PaleGreen",
        "PaleTurquoise",
        "PaleVioletRed",
        "PapayaWhip",
        "PeachPuff",
        "Peru",
        "Pink",
        "Plum",
        "PowderBlue",
        "Purple",
        "RebeccaPurple",
        "Red",
        "RosyBrown",
        "RoyalBlue",
        "SaddleBrown",
        "Salmon",
        "SandyBrown",
        "SeaGreen",
        "SeaShell",
        "Sienna",
        "Silver",
        "SkyBlue",
        "SlateBlue",
        "SlateGray",
        "SlateGrey",
        "Snow",
        "SpringGreen",
        "SteelBlue",
        "Tan",
        "Teal",
        "Thistle",
        "Tomato",
        "Turquoise",
        "Violet",
        "Wheat",
        "White",
        "WhiteSmoke",
        "Yellow",
        "YellowGreen",
      ];
}

