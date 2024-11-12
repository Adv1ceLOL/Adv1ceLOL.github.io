"use strict";

class MyChartUtilities {

  static fillMultipleLines(ctx, stringWithNewLineChars, x,y, distance) {
    const lines = stringWithNewLineChars.split('\n');
    for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], x, y + (i * distance));
  }

  static reduceLuminosity(color_rgba, fraction) {

    const comps = color_rgba.substring(color_rgba.indexOf('(') + 1, color_rgba.length - 1).split(',');

    let r = parseInt(comps[0]);
    let g = parseInt(comps[1]);
    let b = parseInt(comps[2]);
    let a = parseFloat(comps[3]);

    r = Math.round(r * fraction);
    g = Math.round(g * fraction);
    b = Math.round(b * fraction);

    return "rgba(" + r + "," + g + "," + b + "," + a + ")";

  }

  static randomColor() {
    return '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
  }

  static randomColorCSS() {
    return this.CSS_COLORS[Math.round(Math.random() * this.CSS_COLORS.length)];
  }


  static randomRgbaString(Alpha) {
    return 'rgba(' +
      Math.round(Math.random() * 160) + ',' +
      Math.round(Math.random() * 220) + ',' +
      Math.round(Math.random() * 250) + ', ' + Alpha + ')';
  }

  static randomDrawDistribution(numDraws, numIntervals, intervalsN) {
    console.log("Intervals while starting:", JSON.stringify(intervalsN));
    
    let value = 0;
    for (let i = 0; i <= numIntervals; i++) {
        value = (1 / numIntervals) * i;
        console.log("Value:", value);
        MyDistributionUtilities.allocateValueInIntervals(value, intervalsN, 1 / numIntervals);
        console.log("Intervals after allocation:", JSON.stringify(intervalsN));
    }

    // Initialize the count array
    for (let i = 0; i < numIntervals; i++) {
        intervalsN[i].count = 0;
    }

    console.log("Intervals after initialization:", JSON.stringify(intervalsN));

    // Randomly allocate draws to intervals
    for (let i = 0; i < numDraws; i++) {
        let draw = Math.random();
        let intervalIndex = Math.floor(draw * numIntervals);

        // Ensure the index is within bounds
        if (intervalIndex >= 0 && intervalIndex < numIntervals) {
            intervalsN[intervalIndex].count++;
            console.log(`Draw ${i}: ${draw} -> Interval ${intervalIndex}`);
            console.log(`Boundary ${intervalIndex}:`, intervalsN[intervalIndex].count);
        }
    }
}

  static verticalHistoFromIntervals(ctx, intervals, x_min, x_range, viewRect, strokeStyle, lineWidth, fillStyle) {
    let maxcount = 0;
    for (const interval of intervals) {
      maxcount = Math.max(maxcount, interval.count);
    }

    
    for (const interval of intervals) {

      let x_rect = viewRect.x;
      let width_rect = viewRect.width * interval.count / maxcount;

      let y_rect_top = My2dUtilities.transformY(interval.upper, x_min, x_range, viewRect.y, viewRect.height);
      let y_rect_bottom = My2dUtilities.transformY(interval.lower, x_min, x_range, viewRect.y, viewRect.height);
      let height_rect = y_rect_bottom - y_rect_top;   //y crescono verso il basso

      let rectInterval = new Rettangolo(x_rect, y_rect_top, width_rect, height_rect);

      ctx.rect(rectInterval.x, rectInterval.y, rectInterval.width, rectInterval.height);
      const gradient = ctx.createLinearGradient(rectInterval.x, rectInterval.y, rectInterval.x, rectInterval.y + rectInterval.height);
      gradient.addColorStop(0, 'black');
      gradient.addColorStop(0.25, fillStyle);
      gradient.addColorStop(0.5, 'white');
      gradient.addColorStop(0.75, fillStyle);
      gradient.addColorStop(1, 'black');
      ctx.fillStyle = gradient;
      ctx.fillRect(rectInterval.x, rectInterval.y, rectInterval.width, rectInterval.height);
    }

  }


  static horizontalHistoFromIntervals(ctx, intervals, viewRect, strokeStyle, lineWidth, fillStyle, numDraws, numIntervals) {
    // Log intervals before calling randomDrawDistribution
    console.log("Intervals before randomDrawDistribution:", JSON.stringify(intervals));

    // Call randomDrawDistribution to update intervals
    MyChartUtilities.randomDrawDistribution(numDraws, numIntervals, intervals);

    // Create a copy of intervals for intervals2
    let intervals2 = [];

    console.log("Intervals2 ");

    // Call randomDrawDistribution to update intervals2
    MyChartUtilities.randomDrawDistribution(numDraws, numIntervals, intervals2);

    // Log intervals after calling randomDrawDistribution
    console.log("Intervals after randomDrawDistribution:", JSON.stringify(intervals));

    // Log intervals2 after calling randomDrawDistribution
    console.log("Intervals2 after randomDrawDistribution:", JSON.stringify(intervals2));

    // Determine the maximum count to scale the bars
    let maxcount = 0;
    for (const interval of intervals) {
      maxcount = Math.max(maxcount, interval.count);
    }
    for (let i = 0; i < numIntervals; i++){
      maxcount = Math.max(maxcount, intervals[i].count);
    }
    for (let i = 0; i < numIntervals; i++){
      if(intervals2[i].count > maxcount){
        maxcount = intervals2[i].count;
      }
    }
    
    console.log("Maxcount:", maxcount); 

    // Define spacing and bar dimensions
    const spacing = 10; // Space between bars
    const barHeight = ((viewRect.height - 50) - (intervals.length + 1) * spacing) / (2 * intervals.length); // Halve the bar height
    const maxBarLength = viewRect.width - 150; // Reserve space for labels

    // Set font for labels
    ctx.font = "12px Verdana";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Iterate through intervals and intervals2 in parallel and draw each bar
    for (let i = 0; i < numIntervals; i++) {
      const interval = intervals[i];
      const interval2 = intervals2[i];

      const barLength = (interval.count / maxcount) * maxBarLength;
      const y = viewRect.y + spacing + i * (barHeight + spacing) * 2;

      // Draw the first bar (red)
      ctx.fillStyle = '#FF4500'; // Red color
      ctx.fillRect(viewRect.x, y, barLength, barHeight);
      ctx.strokeStyle = 'black'; // Black border
      ctx.lineWidth = 1;
      ctx.strokeRect(viewRect.x, y, barLength, barHeight);

      // Draw the count label
      ctx.fillStyle = "white";
      ctx.textAlign = "right";
      ctx.fillText(interval.count.toString(), viewRect.x - 5, y + barHeight / 2);

      // Draw the interval range label
      ctx.textAlign = "left";
      const label = `[${interval.lower.toFixed(2)}, ${interval.upper.toFixed(2)})`;
      ctx.fillText(label, viewRect.x + barLength + 25, y + barHeight / 2);

      ctx.textAlign = "right"; // Reset alignment for next label

      // Draw the second bar below the first one (blue)
      const y2 = y + barHeight + spacing;
      const barLength2 = (interval2.count / maxcount) * maxBarLength;
      ctx.fillStyle = 'blue'; // Blue color
      ctx.fillRect(viewRect.x, y2, barLength2, barHeight);
      ctx.strokeStyle = 'black'; // Black border
      ctx.lineWidth = 1;
      ctx.strokeRect(viewRect.x, y2, barLength2, barHeight);

      // Draw the count label for the second bar
      ctx.fillStyle = "white";
      ctx.textAlign = "right";
      ctx.fillText(interval2.count.toString(), viewRect.x - 5, y2 + barHeight / 2);

      // Draw the interval range label for the second bar
      ctx.textAlign = "left";
      const label2 = `[${interval2.lower.toFixed(2)}, ${interval2.upper.toFixed(2)})`;
      ctx.fillText(label2, viewRect.x + barLength2 + 25, y2 + barHeight / 2);

      ctx.textAlign = "right"; // Reset alignment for next label
    }
}

  static chartColumnForMap(wordMap, ctx, rettangolo, columnColor, font, fillStyle) {

    let TotalCount = 0;
    let MaxCount = 0;
    for (const value of wordMap.values()) {
      TotalCount += value;
      MaxCount = Math.max(MaxCount, value);
    }

    let x = rettangolo.left();
    const width = Math.round(rettangolo.width / wordMap.size);

    for (let [key, value] of wordMap) {
      const height = Math.round(rettangolo.height * value / MaxCount);
      const y = rettangolo.bottom() - height;

      const gradient = ctx.createLinearGradient(x, y, x + width, y);
      gradient.addColorStop(0, 'black');
      gradient.addColorStop(0.25, columnColor);
      gradient.addColorStop(0.5, 'white');
      gradient.addColorStop(0.75, columnColor);
      gradient.addColorStop(1, 'black');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, width, height);

      ctx.save();
      if (height > 0) {
        ctx.translate(x + 0.5 * width, y - 5);
      } else { 
        ctx.translate(x + 0.5 * width, rettangolo.bottom() - 5);
      }
      ctx.rotate(1.5 * Math.PI);
      ctx.font = font;
      ctx.fillStyle = fillStyle;
      ctx.textAlign = "left";
      ctx.fillText(key + " (" + (100 * value / TotalCount).toFixed(2).toString() + "%)", 0, 0);
      ctx.restore();

      x += width;
    }

  }

  static flashingCloudForMap(wordMap, ctx, rettangolo, fontFamily, fillStyle) {

    let TotalCount = 0;
    let MaxCount = 0;
    for (let value of wordMap.values()) {
      TotalCount += value;
      MaxCount = Math.max(MaxCount, value);
    }

    for (let [key, value] of wordMap) {

      const fontSize = Math.max(1, value);
      ctx.font = fontSize + "px " + fontFamily;
      ctx.fillStyle = fillStyle;
      ctx.fillText(key, Math.round(rettangolo.x + Math.random() * rettangolo.width),
        Math.round(rettangolo.y + Math.random() * rettangolo.height));

    }
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