export class Vector2 {
    public x : number;
    public y : number
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    add(vector : {x : number, y : number}) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }
    sub(vector : {x : number, y : number}) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }
    mul(n : number) {
        return new Vector2(this.x * n, this.y * n);
    }
    div(n : number) {
        return new Vector2(this.x / n, this.y / n);
    }
    mag() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    normalize() {
        return this.mag() === 0 ? new Vector2(0, 0) : this.div(this.mag());
    }
}