"use strict";

class MyRndUtilities {

  static gaussianPair(mean, stdDev) {
    let u, v, s = 0;
    while (s >= 1 || s === 0) {
      u = 2 * Math.random() - 1;
      v = 2 * Math.random() - 1;
      s = u * u + v * v;
    }
    s = Math.sqrt(-2 * Math.log(s) / s);
    const f = stdDev * s;
    return [mean + f * u, mean + f * v];
  }

  static bernoulliVariate(p) {
    return (Math.random() <= p) ? 1 : 0;
  }

  static RademacherVariate() {
    return (Math.random() <= 0.5) ? -1 : 1;
  }

  static normal_CDF(x) {
    let sum = 0;
    for (let k = 0; k < 200; k++) {
      let sign = (k % 2) ? (-1) : (+1);
      sum += sign * (x ** (2 * k + 1)) / ((2 * k + 1) * (2 ** k) * this.factorial(k));
    }
    return sum / Math.sqrt(2 * Math.PI);
  }

  static storedFactorials = [];      

  static factorial(n) {
    if (n === 0 || n === 1) return 1;
    if (this.storedFactorials[n] > 0) return this.storedFactorials[n];
    return this.storedFactorials[n] = this.factorial(n - 1) * n;
  }

  static generateNormalCdfPath(x_Max, myRect) {

    const MyNormalPath_Left = new Path2D();
    const MyNormalPath_Right = new Path2D();
    const step_x = 0.001;
    const x_min = -x_Max;
    const rangeX = x_Max + x_Max;

    const [x0, y0] = My2dUtilities.transformXYToViewport([0, 0.5], x_min, rangeX, 0, 1, myRect);
    MyNormalPath_Left.moveTo(x0, y0);
    MyNormalPath_Right.moveTo(x0, y0);

    for (let x = 0; x <= x_Max; x += step_x) {
      const integral = this.normal_CDF(x);
      MyNormalPath_Right.lineTo(...My2dUtilities.transformXYToViewport([x, 0.5 + integral], x_min, rangeX, 0, 1, myRect));
      MyNormalPath_Left.lineTo(...My2dUtilities.transformXYToViewport([-x, 0.5 - integral], x_min, rangeX, 0, 1, myRect));
    }

    MyNormalPath_Left.addPath(MyNormalPath_Right);

    return MyNormalPath_Left;
  }

  static normaleStandardSaved = undefined;

  static gaussian(Mean, StdDev) {  

    if (this.normaleStandardSaved) {
      const normale = Mean + StdDev * this.normaleStandardSaved;
      this.normaleStandardSaved = undefined;
      return normale;

    } else {

      let u, v, s = 0;

      while (s >= 1 || s === 0) {
        u = 2 * Math.random() - 1;
        v = 2 * Math.random() - 1;
        s = u * u + v * v;
      }

      s = Math.sqrt(-2 * Math.log(s) / s);
      this.normaleStandardSaved = v * s;
      return Mean + StdDev * u * s;

    }

  }
}