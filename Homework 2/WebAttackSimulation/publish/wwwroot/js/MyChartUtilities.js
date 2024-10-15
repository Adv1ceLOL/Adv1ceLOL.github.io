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

  static verticalHistoFromIntervals(ctx, intervals, y_min, y_range, viewRect, strokeStyle, lineWidth, fillStyle) {
    let maxcount = 0;
    for (const interval of intervals) {
      maxcount = Math.max(maxcount, interval.count);
    }

    
    for (const interval of intervals) {

      let x_rect = viewRect.x;
      let width_rect = viewRect.width * interval.count / maxcount;

      let y_rect_top = My2dUtilities.transformY(interval.upper, y_min, y_range, viewRect.y, viewRect.height);
      let y_rect_bottom = My2dUtilities.transformY(interval.lower, y_min, y_range, viewRect.y, viewRect.height);
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