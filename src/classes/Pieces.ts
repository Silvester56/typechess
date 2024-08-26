export enum Color { WHITE, BLACK };

class Piece {
    position: [number, number];
    color: Color;
    
    constructor(position: [number, number], color: Color) {
        this.position = position;
        this.color = color;
    }
}

export class King extends Piece {
    constructor(position: [number, number], color: Color) {
        super(position, color);
    }
}

export class Queen extends Piece {
    constructor(position: [number, number], color: Color) {
        super(position, color);
    }
}

export class Rook extends Piece {
    constructor(position: [number, number], color: Color) {
        super(position, color);
    }
}

export class Bishop extends Piece {
    constructor(position: [number, number], color: Color) {
        super(position, color);
    }
}

export class Knight extends Piece {
    constructor(position: [number, number], color: Color) {
        super(position, color);
    }
}

export class Pawn extends Piece {
    constructor(position: [number, number], color: Color) {
        super(position, color);
    }
}