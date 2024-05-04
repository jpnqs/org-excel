
class Renderable {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    update() {
            
    }

    render(context) {

    }

}

class Ship extends Renderable {

    constructor(x, y, width, height) {
        super(x, y, width, height);
    }

    update() {
            
    }

    render(context) {
        context.fillStyle = 'blue';
        context.fillRect(this.x, this.y, this.width, this.height);
    }

class SpaceInvaders {

    constructor() {
        this.canvas = document.getElementById('space-invaders');
        this.context = this.canvas.getContext('2d');
        // canvas width full view size
        this.canvas.width = window.innerWidth;
        // canvas height full view size
        this.canvas.height = window.innerHeight;
        this.renderables = [];
        this.score = 0;
    }

    addRenderable(renderable) {
        this.renderables.push(renderable);
    }

    removeRenderable(renderable) {
        this.renderables = this.renderables.filter(r => r !== renderable);
    }

    update() {
        this.renderables.forEach(r => r.update());
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderables.forEach(r => r.render(this.context));
    }


}