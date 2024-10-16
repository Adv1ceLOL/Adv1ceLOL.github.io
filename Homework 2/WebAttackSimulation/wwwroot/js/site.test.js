const { createPath } = require('./site.js');

describe('createPath', () => {
    let ctx, chartRect, MyRndUtilities, My2dUtilities, MyDistributionUtilities;

    beforeEach(() => {
        ctx = {
            clearRect: jest.fn(),
            lineWidth: 1,
            strokeStyle: '',
            stroke: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            fillText: jest.fn(),
            stroke: jest.fn(),
        };

        chartRect = {
            x: 20,
            y: 30,
            width: 600,
            height: 400,
            right: () => chartRect.x + chartRect.width,
            bottom: () => chartRect.y + chartRect.height,
            disegnaRettangolo: jest.fn(),
        };

        MyRndUtilities = {
            bernoulliVariate: jest.fn(() => Math.random() < 0.5 ? 1 : 0),
        };

        My2dUtilities = {
            transformX: jest.fn((t, min, max, x, width) => x + (t - min) / (max - min) * width),
            transformY: jest.fn((value, minView, range, y, height) => y + (value - minView) / range * height),
        };

        MyDistributionUtilities = {
            allocateValueInIntervals: jest.fn(),
            UpdateMeanAndSS: jest.fn((value, s, [avgLast, ssLast]) => [avgLast + value, ssLast + value * value]),
        };

        global.MyRndUtilities = MyRndUtilities;
        global.My2dUtilities = My2dUtilities;
        global.MyDistributionUtilities = MyDistributionUtilities;
    });

    it('should correctly calculate the relative frequency', () => {
        const s = 1;
        const n = 100;
        const histTimeT = 50;
        const histTimeN = 100;
        const minView = 0;
        const maxView = 1;
        const range = maxView - minView;
        const intervalSize = range / 10;
        const xOrigin = 20;
        const yOrigin = 30;

        const path = createPath(s);

        expect(path).toBeInstanceOf(Path2D);
        expect(MyRndUtilities.bernoulliVariate).toHaveBeenCalledTimes(n);
        expect(My2dUtilities.transformX).toHaveBeenCalledTimes(n);
        expect(My2dUtilities.transformY).toHaveBeenCalledTimes(n);
        expect(MyDistributionUtilities.allocateValueInIntervals).toHaveBeenCalledTimes(2);
        expect(MyDistributionUtilities.UpdateMeanAndSS).toHaveBeenCalledTimes(1);
    });
});