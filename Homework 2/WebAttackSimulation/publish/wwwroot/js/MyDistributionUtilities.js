"use strict";


class MyDistributionUtilities {

  static round2digits(myValue) {
    return Math.round((myValue + Number.EPSILON) * 100) / 100;
  }


  static UpdateMeanAndSS(x, i, [mean, ss]) {
    const oldDeviate = x - mean;
    mean += oldDeviate / i;                   
    ss += (x - mean) * oldDeviate;  
    return [mean, ss];
  }


  static maxCountInIntervals(x_intervals) {
    let maxCount_x = 0;
    for (let classInterval of x_intervals) {
      if (classInterval.count > maxCount_x) {
        maxCount_x = classInterval.count
      }
    }
    return maxCount_x;
  }

  static creaPrimoIntervallo(x, intervalSize) {
    const lower = Math.floor(x * (1 / intervalSize)) * intervalSize;
    let x0_interval = new ClassInterval(
      lower,
      lower + intervalSize);
    x0_interval.count = 1;
    return x0_interval;
  }


  static allocateValueInIntervals(x, x_intervals, intervalSize) {

    if (x_intervals.length === 0) {
      x_intervals.push(this.creaPrimoIntervallo(x, intervalSize));
      return;
    }

    let x_interval = x_intervals[0];
    if (x > x_interval.lower && x <= x_interval.upper) {
      x_interval.count++;
      return x_interval.lower;
    }

    if (x <= x_interval.lower) {
      let currentIntervalIndex = 0;

      while (true) {
        let xLeft_interval = x_intervals[currentIntervalIndex - 1];
        if (!xLeft_interval) {
          xLeft_interval = new ClassInterval(x_interval.lower - intervalSize, x_interval.lower);
          x_intervals.unshift(xLeft_interval);
          currentIntervalIndex = 0;   
        }
        if (x > xLeft_interval.lower && x <= xLeft_interval.upper) {
          xLeft_interval.count++;
          return xLeft_interval.lower;
        }
        x_interval = xLeft_interval;
        currentIntervalIndex--;
      }

    } else if (x > x_interval.upper) {
      let currentIntervalIndex = 0;

      while (true) {
        let xRight_interval = x_intervals[currentIntervalIndex + 1];
        if (!xRight_interval) {
          xRight_interval = new ClassInterval(x_interval.upper, x_interval.upper + intervalSize);
          x_intervals.push(xRight_interval);
          currentIntervalIndex = x_intervals.length - 1;
        }
        if (x > xRight_interval.lower && x <= xRight_interval.upper) {
          xRight_interval.count++;
          return xRight_interval.lower;
        }
        x_interval = xRight_interval;
        currentIntervalIndex++;
      }
    }
  }
}

class ClassInterval {

  lower;
  upper;
  count;
  relativeFreq;

  constructor(lower, upper) {
    this.lower = lower;
    this.upper = upper;    
    this.count = 0;
    this.relativeFreq = 0;
  }

}   