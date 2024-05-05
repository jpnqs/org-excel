
class TetrominoColor {

  constructor() {
    // pastel colors
    this.colors = [
      '#ffb3ba',
      '#ffdfba',
      '#ffffba',
      '#baffc9',
      '#bae1ff',
      '#9542f5',
      '#42f5b9'
    ];
    this.lastColor = '';

  }

  getColor() {
    // ensure that we get a different color each time
    let newColor = null;

    while (newColor == null) {
      let color = this.colors[(Math.floor(Math.random() * this.colors.length))];
      if (color == this.lastColor) {
        continue;
      }
      this.lastColor = color;
      newColor = color;
    }

    return newColor;

  }

}

class TetrominoShape {

  constructor() {
    this.lastShape = '';
    this.shapes = [
      {
        name: 'I',
        shape: [
          [1],
          [1],
          [1],
          [1]
        ]
      },

      {
        name: 'O',
        shape: [
          [1, 1],
          [1, 1]
        ]
      },

      {
        name: 'T',
        shape: [
          [1,1,1],
          [0,1,0]
        ]
      },

      {
        name: 'J',
        shape: [
          [0,1],
          [0,1],
          [1,1]
        ]
      },

      {
        name: 'L',
        shape: [
          [1,0],
          [1,0],
          [1,1]
        ]
      },

      {
        name: 'S',
        shape: [
          [0,1,1],
          [1,1,0]
        ]
      },

      {
        name: 'Z',
        shape: [
          [1,1,0],
          [0,1,1]
        ]
      }

    ]
  }

  getNewShape() {
    let newShape = null;

    while (newShape == null) {
      let shape = this.shapes[(Math.floor(Math.random() * this.shapes.length))];
      if (shape.name == this.lastShape) {
        continue;
      }
      this.lastShape = shape.name;
      newShape = shape;
    }

    return newShape.shape;

    return this.shapes[0].shape;
  }


}

class Tetromino {

  constructor(grid) {
    this.x = 0;
    this.y = 0;
    this.grid = grid;
    this.color = 'black';
    this.shape = [];
  }

  // setters

  setColor(color) {
    this.color = color;
    return this;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setShape(shape) {
    this.shape = shape;
    return this;
  }

  // getters

  /**
   * Get color of tetromino
   * @returns {string} color
   */
  getColor() {
    return this.color;
  }

  /**
   * Get position of tetromino
   * @returns {x,y} position
   */
  getPosition() {
    return {
      x: this.x,
      y: this.y
    };
  }

  getShape() {
    return this.shape;
  }

  getLeftBound() {
    return this.x;
  }

  getRightBound() {
    return this.x + this.shape[0].length;
  }

  getBottomBound() {
    return this.y + this.shape.length;
  }


  // processing methods

  rotate() {
    // rotate shape rotate each time 90 degrees, 4 turns = 360 degrees

    // transpose matrix
    this.shape = this.shape[0].map((col, i) => this.shape.map(row => row[i]));

    // reverse rows
    this.shape = this.shape.map(row => row.reverse());

    // check if new position would collide
    if (this.grid.checkCollision(this)) {
      // if collision, revert rotation
      this.rotate();
    }




  }

  down() {
    // check if we are at the bottom
    if (this.getBottomBound() < 20) {
      this.y++;
      return false;
    } else {
      return true;
    }

  }

  left() {
    if (this.getLeftBound() > 0) {

      // check if new position would collide
      if (this.grid.checkCollision(this.copy().setPosition(this.x - 1, this.y))) {
        return;
      }

      this.x--;
    }
  }

  right() {
    if (this.getRightBound() < 10) {

      // check if new position would collide
      if (this.grid.checkCollision(this.copy().setPosition(this.x + 1, this.y))) {
        return;
      }

      this.x++;
    }
  }

  _logShape() {
    console.table(this.shape);
  }

  copy() {
    let copy = new Tetromino();
    copy.color = this.color;
    copy.x = this.x;
    copy.y = this.y;
    copy.shape = this.shape.map(row => row.map(col => col));
    return copy;
  }

}

class TetrisGrid {

  /**
   * 
   * @param {number} height 
   * @param {number} width 
   */
  constructor(height, width) {
    this.grid = new Array(height).fill(0).map(() => new Array(width).fill(0));

    // canvas
    this.canvas = document.getElementById('tetris');
    this.context = this.canvas.getContext('2d');
    // set canvas
    this.canvas.width = 200;
    this.canvas.height = 400;
  }

  removeTetromino(tetromino) {

    // get position of tetromino
    let pos = tetromino.getPosition();

    // get shape of tetromino
    let shape = tetromino.getShape();

    // map shape to grid
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] == 1) {
          this.grid[pos.y + i][pos.x + j] = 0;
        }
      }
    }

  }

  mapTetromino(tetromino) {

    // get position of tetromino
    let pos = tetromino.getPosition();

    // get shape of tetromino
    let shape = tetromino.getShape();

    // map shape to grid
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] == 1) {
          this.grid[pos.y + i][pos.x + j] = tetromino.getColor();
        }
      }
    }

  }

  _logGrid() {
    console.table(this.grid);
  }

  _toString() {
    // every row in new line, every column separated by space
    return this.grid.map(row => row.join(' ')).join('\n');
  
  }

  _debug() {
    // render grid 
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.grid.forEach((row, i) => {
      row.forEach((col, j) => {
        if (col != 0) {
          this.context.fillStyle = col;
          // small black border around each cell

          this.context.fillRect(j * 20, i * 20, 20, 20);
          this.context.fillStyle = 'gray';

          this.context.strokeRect(j * 20, i * 20, 20, 20);


          // this.context.fillRect(j * 20, i * 20, 20, 20);
        }
      });
    });

      // render score right top corner
      if (rainbowModeAct) {
        this.context.fillStyle = 'white';
        
      } else {
        this.context.fillStyle = 'black';
      }
      this.context.font = '20px Arial';
      this.context.fillText('Score: ' + this.tetris.score, 10, 20);

       





    // var str = this._toString();
    // // wrap 1 in span with red color
    // str = str.replace(/1/g, '<span style="color:red">1</span>');
    // // replace new lines with br
    // str = str.replace(/\n/g, '<br>');
    // document.getElementById('debug').innerHTML = str;
  }

  checkCollision(tetromino) {
    // get position of tetromino
    let pos = tetromino.getPosition();

    // get shape of tetromino
    let shape = tetromino.getShape();

    // check if tetromino collides with grid value
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] != 0 && this.grid[pos.y + i][pos.x + j] != 0) {
          return true;
        }
      }
    }

    return false;

  }

  checkFullRows() {
    let rows = this.grid.filter(row => row.every(col => col != 0));
    return rows.length;
  }

  removeFullRows() {

    if (this.tetromino) {
      this.removeTetromino(this.tetromino);

    }

    // get index of full rows
    let rows = this.grid.map((row, index) => row.every(col => col != 0) ? index : null).filter(row => row != null);

    // sort rows in descending order
    rows.sort((a, b) => b - a);

    rows.forEach((row, index) => {
      this.grid[row].fill(0)

      // move all rows above one row down
      for (let i = row; i > 0; i--) {
        this.grid[i] = this.grid[i - 1].map(col => col);
      }

      // descrease index of rows above
      rows.forEach((r, i) => {
        if (r < row) {
          rows[i]++;
        }
      });
      

    });

    if (this.tetromino) {
      this.mapTetromino(this.tetromino);
    }

  }

  clear() {
    this.grid = new Array(20).fill(0).map(() => new Array(10).fill(0));
  }

  setTetris(tetris) {
    this.tetris = tetris;
  }

}

class Tetris {

  constructor() {
    this.grid = new TetrisGrid(20, 10);
    this.grid.setTetris(this);
    this.colorFactory = new TetrominoColor();
    this.shapeFactory = new TetrominoShape();
    this.tetromino = null;
    this.newShape();
    this.grid._debug();
    this.setupListeneres();
    this.score = 0;
  }

  stopStep() {
    clearTimeout(this.timeout);
  }
  

  newShape() {
    this.tetromino = new Tetromino(this.grid)
                        .setColor(this.colorFactory.getColor())
                        .setPosition(3,0)
                        .setShape(this.shapeFactory.getNewShape());
    // check collision with new shape
    if (this.grid.checkCollision(this.tetromino)) {
      // if collision, game over
      alert('Game Over');
      this.grid.clear();
      clearTimeout(this.timeout);
      this.startStep();
    }
  }

  step(exec, doCollisionCheck = true) {
    var newTetroCreated = false;
    this.grid.removeTetromino(this.tetromino);
    var tCopy = this.tetromino.copy();
    if (!exec) {
      if (this.tetromino.down()) {
        this.grid.mapTetromino(this.tetromino);
        newTetroCreated = true;

      }
    } else {
      exec();
    }
      
    if (doCollisionCheck) {
      if (this.grid.checkCollision(this.tetromino)) {
        this.grid.mapTetromino(tCopy);
        newTetroCreated = true;
      } else {
        this.grid.mapTetromino(this.tetromino);
      }
    } else {
      this.grid.mapTetromino(this.tetromino);

    }
    this.grid._debug();

    // check full rows
    if (newTetroCreated) {
      let fullRows = this.grid.checkFullRows();
      if (fullRows > 0) {
        this.grid.removeFullRows();
        this.score += fullRows * 250;
        this.grid._debug();
      }

      this.newShape();

    }

  }

  startStep() {
    this.grid._debug();
    this.timeout = setTimeout(() => {
      this.step();
      this.startStep()
    }, 1000);
  }

  setupListeneres() {
    document.addEventListener('keydown', (event) => {
      switch(event.key) {
        case 'ArrowLeft':
          this.step(() => this.tetromino.left(), false);
          break;
        case 'ArrowRight':
          this.step(() => this.tetromino.right(), false);
          
          break;
        case 'ArrowDown':
          this.step();
          break;
        case ' ':
          this.grid.removeTetromino(this.tetromino);
          this.tetromino.rotate();
          this.grid.mapTetromino(this.tetromino);
          this.grid._debug();
          break;
      }
    });
  }

}

