

class Tetronom {

  constructor(x,y,grid) {
    this.x = x;
    this.y = y;
    this.shape = [];
    this.grid = grid;
  }

  rotate() {
    const newShape = [];
    for (let i = 0; i < this.shape[0].length; i++) {
      newShape.push([]);
      for (let j = this.shape.length - 1; j >= 0; j--) {
        newShape[i].push(this.shape[j][i]);
      }
    }
    this.shape = newShape;
  }

  setShape(shape) {
    this.shape = shape;
  }

  clearFromGrid() {
    this.shape.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          this.grid.set(this.x + i, this.y + j, 0);
        }
      });
    });
  }

  drawToGrid() {
    this.shape.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          this.grid.set(this.x + i, this.y + j, cell);
        }
      });
    });
  }

  moveDown() {
    this.clearFromGrid();
    this.y++;
    this.drawToGrid();
  }

  moveLeft() {
    this.clearFromGrid();
    this.x--;
    this.drawToGrid();
  }

  moveRight() {
    this.clearFromGrid();
    this.x++;
    this.drawToGrid();
  }

  canMoveDown() {
    return this.shape.every((row, i) => {
      return row.every((cell, j) => {
        if (cell) {
          return this.grid.get(this.x + i, this.y + j + 1) === 0;
        }
        return true;
      });
    });
  }

  canMoveLeft() {
    return this.shape.every((row, i) => {
      return row.every((cell, j) => {
        if (cell) {
          return this.grid.get(this.x + i - 1, this.y + j) === 0;
        }
        return true;
      });
    });
  }

  canMoveRight() {
    return this.shape.every((row, i) => {
      return row.every((cell, j) => {
        if (cell) {
          return this.grid.get(this.x + i + 1, this.y + j) === 0;
        }
        return true;
      });
    });
  }



}

class TetrisGrid {

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = [];
    for (let i = 0; i < width; i++) {
      this.grid.push(new Array(height).fill(0));
    }
  }

  get(x, y) {
    return this.grid[x][y];
  }

  set(x, y, value) {
    this.grid[x][y] = value;
  }

  render(context, cellSize) {
    this.grid.forEach((column, i) => {
      column.forEach((cell, j) => {
        context.fillStyle = cell ? 'black' : 'white';
        context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      });
    });
  }

}

class Tetris {

  constructor() {
    this.grid = new TetrisGrid(10, 20);
    this.tetronom = new Tetronom(3, 0, this.grid);
    this.tetronom.setShape([
      [1, 1, 1],
      [0, 1, 0]
    ]);
    this.canvas = document.getElementById('tetris');
    this.context = this.canvas.getContext('2d');
  }

  update() {
    if (this.tetronom.canMoveDown()) {
      this.tetronom.moveDown();
    } else {
      this.tetronom.drawToGrid();
      this.tetronom = new Tetronom(3, 0, this.grid);
      this.tetronom.setShape([
        [1, 1, 1],
        [0, 1, 0]
      ]);
    }
  }

  render() {
    // console.table grid
    console.table(this.grid.grid);
    // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.grid.render(this.context, this.canvas.width / this.grid.width);
    
  }

  tick() {
    this.update();
    this.render();
  }

  startTick() {
    this.tickInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }


}

const tetris = new Tetris();
tetris.startTick();

// Path: src/index.html