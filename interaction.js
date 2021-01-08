export class InteractionFrontend { 

    addEventListener(name, listener) {
        // Implement    
    }
    
    removeEventListener(name, listener) {
        // Implement 
    }
}

export class InteractionBackend {
    
    select(object) {
        // Implement 
    }
    
    deselect(object) {
        // Implement
    }
    
}

export class InteractionEngine {
    
    constructor(frontend, backend) {
        this.frontend = frontend;
        this.backend = backend;
    }
    
    start() {
        // implement 
    }
    
    stop() {
        // implement 
    }

    run() {
        // implement
    }

    get shouldRenderInteraction() {
        // implement
    }
    
    reset() {
        // implement
    }
    
    select(object) {
        // implement
    }
    
    deselect(object) {
        // implement        
    }
}

class Action {

    constructor() {
        this.reset();
    }
    
    reset() {
        this.fired = false;
    }
    
    listener()    { /* implement in child class */ }
}

class MouseMoveAction extends Action {

    constructor() {
        super();
        this.pos = {x: -1, y: -1}
    }
    
    listener(e) {
        this.pos.x = e.offsetX;
        this.pos.y = e.offsetY;
        this.fired = true;
    }
}

export class Mouse {

    constructor() {
        this.move = new MouseMoveAction();
        this.pos = this.move.pos; 
    }

    get mousemove() {
        return this.mouse.move.listener;
    }
    get moved() {
        return this.move.fired;
    }
    
    reset() {
        this.move.reset();
    }
    
}

export class CanvasInteractionFrontend extends InteractionFrontend {
    
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    
    addEventListener(name, hasListener) {
        this.canvas.addEventListener(name, hasListener.listener.bind(hasListener));
    }
    
    removeEventListener(listener) {
        this.canvas.removeEventListener(name, listener);
    }
}