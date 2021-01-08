import { Camera, Cleanser, RGBA } from './objects.js';
import { Animation } from './animation.js';
import { OffscreenFramebuffer, OnscreenFramebuffer } from './backend/framebuffers.js';
import { ViewportGrid, VrViewportGrid, WebglRenderer } from './backend/renderer.js';
import { CanvasInteractionFrontend } from './interaction.js';
import { GeneralInteractionEngine, GeneralInteractionBackend } from './interaction/general.js';
import Theme from './theme.js';

export default class Bootstrap {

    constructor(canvas) {
        
        this.canvas = canvas;
        this.gl = WebglRenderer.createContext(canvas);
        
        const onscreen  = new OnscreenFramebuffer();
        const offscreen = new OffscreenFramebuffer(this.gl);
        offscreen.createReadPixels(this.gl);

        this.camera = new Camera(this.gl);
        this.camera.ortho = true;

        this.render_context = {
            framebuffers: {
                'onscreen': onscreen,
                'offscreen': offscreen
            },
            cameras: {
                'camera': this.camera 
            },
            programs: {
                'program': null
            },
            objects: {
                'object': null
            }
        };

        this.render_layers = [{
            framebuffer: 'onscreen',
            frames: [{
                camera: 'camera',
                passes: [{
                    program: 'program',
                    objects: 'object'
                }]
            }]
        }];
        
        const theme = {
            bg:   new RGBA(137/255, 171/255, 227/255),
            col1: new RGBA(252/255, 246/255, 245/255),
            col2: new RGBA(255/255, 150/255, 150/255)   
        };
        
        Theme.use(theme);
        
        this.renderer = new WebglRenderer(this.gl, this.render_context, this.render_layers);
        this.renderer.background = Theme.bg;
        
        const vrViewportGrid = new VrViewportGrid(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        //const fullViewportGrid = this.renderer.viewportGrid;
        //const quadViewportGrid = new ViewportGrid(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight, 2, 2);
        this.renderer.viewportGrid = vrViewportGrid;

        /*{const self = this;
        setInterval(_ => {
            self.renderer.viewportGrid = (self.renderer.viewportGrid == vrViewportGrid) ? 
                fullViewportGrid : 
                self.renderer.viewportGrid == fullViewportGrid ? 
                    quadViewportGrid :
                        vrViewportGrid; 
        }, 1500)}*/
            
        
        const interactionFrontend = new CanvasInteractionFrontend(canvas);
        const interactionBackend  = new GeneralInteractionBackend();
        const interactionEngine   = new GeneralInteractionEngine(interactionFrontend, interactionBackend);
        this.interactionEngine = interactionEngine;
        interactionEngine.start();

        this.useAnimation = false;
        this.useCleanser = false;
        this.useInteraction = true;
        
        {const self = this;
        window.onresize = function(_) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            self.renderer.resize(self.gl);
            //fullViewportGrid.update(self.gl.drawingBufferWidth, self.gl.drawingBufferHeight);
            //vrViewportGrid.update(self.gl.drawingBufferWidth, self.gl.drawingBufferHeight);
            //quadViewportGrid.update(self.gl.drawingBufferWidth, self.gl.drawingBufferHeight);
        }};
    }
    
    //
    
    addObject(obj) {
        this.render_context.objects.object = obj;
    }
    
    set program(program) {
        this.render_context.programs.program = program;
    }
    
    run() {
        requestAnimationFrame(_run.bind(this));
        function _run(now) {
            if (this.useAnimation) {
                Animation.process(now);
            }
            if (this.useCleanser) {
                Cleanser.process(this.render_context);
            }
            if (this.useInteraction) {
                this.interactionEngine.run(this.gl, this.renderer);
            }
            this.renderer.render(this.gl)
            requestAnimationFrame(_run.bind(this));
        }
    }
}
