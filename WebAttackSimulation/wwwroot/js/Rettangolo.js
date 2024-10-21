"use strict";

class Rettangolo {

  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  left() {
    return this.x
  }

  top() {
    return this.y
  }

  right() {
    return this.x + this.width
  }

  bottom() {
    return this.y + this.height
  }

  aspectRatio() {
    return this.width / this.height || 1
  }


  disegnaRettangolo(ctx, Colore, Spessore, lineDash) {

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = Colore;
    ctx.lineWidth = Spessore;
    ctx.setLineDash(lineDash);
    ctx.stroke();
    ctx.restore()

  }

  contains(x, y) {
    let lowerX = Math.min(this.left(), this.right());
    let UpperX = Math.max(this.left(), this.right());

    let lowerY = Math.min(this.top(), this.bottom());
    let UpperY = Math.max(this.top(), this.bottom());

    if ( x > lowerX && x < UpperX && y > lowerY && y < UpperY )  {
      return true
    }
  }

}
