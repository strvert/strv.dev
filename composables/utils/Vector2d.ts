export interface Vector2dInterface {
    x: number;
    y: number;
};

export class Vector2d implements Vector2dInterface {
  values: [number, number];
  constructor(values: [number, number]) {
    console.log(values);
    this.values = values;
  }
  get x() {
    return this.values[0];
  }
  get y() {
    return this.values[1];
  }
  set x(value: number) {
    this.values[0] = value;
  }
  set y(value: number) {
    this.values[1] = value;
  }
}
