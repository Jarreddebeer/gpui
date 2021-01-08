import { InteractionEngine, InteractionBackend, Mouse } from '../interaction.js';
import { Object3d, RGBA } from '../objects.js';
import Theme from '../theme.js';

let selected_object;

export class GeneralInteractionEngine extends InteractionEngine {
    
    constructor(frontend, backend) {
        super(frontend, backend);
        this.mouse = new Mouse();
    }
    
    get shouldRenderInteraction() {
        return this.mouse.moved;
    }
    
    start() {
        this.frontend.addEventListener('mousemove', this.mouse.move); 
    }
    
    stop() {
        this.frontend.removeEventListener('mousemove', this.mouse.move);
    }

    run(gl, renderer) {
        
        const offscreenFramebuffer = renderer.getOffscreenFramebuffer();
        
        if (this.shouldRenderInteraction) {
            renderer.renderInteraction(gl);
            offscreenFramebuffer.readPixels(gl);
        }
        
        if (this.mouse.moved) {
            const {x, y} = this.mouse.pos;
            const pixel = offscreenFramebuffer.readPixel(x, y);
            const object = Object3d.getInteractiveObject(pixel);
            if (selected_object && object && object != selected_object) {
                this.backend.deselect(selected_object);
            } 
            else if (object && selected_object != object) {
                selected_object = object;
                this.backend.select(object);
            }
            else if (selected_object && !object) {
                this.backend.deselect(selected_object);
                selected_object = null;
            }
        }
        
        this.reset();
    }
    
    reset() {
        if (this.mouse) this.mouse.reset();
    }
}

export class GeneralInteractionBackend extends InteractionBackend {
    
    select(object) {
        object.color = Theme.col2;
    }
    
    deselect(object) {
        object.color = Theme.col1;
    }

}