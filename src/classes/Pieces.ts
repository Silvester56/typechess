export enum Color { WHITE, BLACK };

export abstract class Piece {
    private positionX: number;
    private positionY: number;
    private color: Color;
    private spriteLoaded = false;
    abstract spriteXPosition: number;
    readonly sprite: any;

    constructor(x: number, y: number, color: Color) {
        this.positionX = x;
        this.positionY = y;
        this.color = color;
        this.sprite = new Image();
        this.sprite.src = "../assets/sprite.png";
        this.sprite.onload = () => {
            this.spriteLoaded = true;
        }
    }

    draw(ctx: any) {
        if (this.spriteLoaded) {     
            ctx.drawImage(this.sprite, this.spriteXPosition, this.color === Color.WHITE ? 0 : 45, 45, 45, this.positionX * 45, this.positionY * 45, 45, 45);
        }
    }
}

export class King extends Piece {
    spriteXPosition = 0;

    constructor(x: number, y: number, color: Color) {
        super(x, y, color);
    }
}

export class Queen extends Piece {
    spriteXPosition = 45;

    constructor(x: number, y: number, color: Color) {
        super(x, y, color);
    }
}

export class Rook extends Piece {
    spriteXPosition = 180;

    constructor(x: number, y: number, color: Color) {
        super(x, y, color);
    }
}

export class Bishop extends Piece {
    spriteXPosition = 90;

    constructor(x: number, y: number, color: Color) {
        super(x, y, color);
    }
}

export class Knight extends Piece {
    spriteXPosition = 135;

    constructor(x: number, y: number, color: Color) {
        super(x, y, color);
    }
}

export class Pawn extends Piece {
    spriteXPosition = 225;

    constructor(x: number, y: number, color: Color) {
        super(x, y, color);
    }
}