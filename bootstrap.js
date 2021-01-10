import { Camera, Cleanser, RGBA } from './objects.js';
import { Animation } from './animation.js';
import { OffscreenFramebuffer, OnscreenFramebuffer, XrFramebuffer } from './backend/framebuffers.js';
import { WebglRenderer, XrRenderer } from './backend/renderer.js';
import { CanvasInteractionFrontend } from './interaction.js';
import { GeneralInteractionEngine, GeneralInteractionBackend } from './interaction/general.js';
import Theme from './theme.js';
import BlandProgram from './backend/programs/bland.js';

export default class Bootstrap {

    constructor(canvas) {
        
        this.canvas = canvas;
        //this.gl = WebglRenderer.createContext(canvas);
        
        this.xrOnscreen = null;
        //const onscreen  = new OnscreenFramebuffer();
        //const offscreen = new OffscreenFramebuffer(this.gl);
        //offscreen.createReadPixels(this.gl);

        //this.camera = new Camera(this.gl);
        //this.camera.ortho = true;

        this.render_context = {
            framebuffers: {
                //'onscreen': onscreen,
                //'offscreen': offscreen
                'onscreen': null,
                'offscreen': null
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
        
        //this.renderer = new WebglRenderer(this.gl, this.render_context, this.render_layers);
        //this.renderer.background = Theme.bg;
        
        const interactionFrontend = new CanvasInteractionFrontend(canvas);
        const interactionBackend  = new GeneralInteractionBackend();
        const interactionEngine   = new GeneralInteractionEngine(interactionFrontend, interactionBackend);
        this.interactionEngine = interactionEngine;
        interactionEngine.start();

        this.useAnimation = false;
        this.useCleanser = false;
        this.useInteraction = true;
        this.useInteraction = false;
        
        {const self = this;
        window.onresize = function(_) {
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            self.renderer.resize(self.gl);
        }};
        
        this.startXrSession();
    }
    
    //
    
    addObject(obj) {
        this.render_context.objects.object = obj;
    }
    
    set program(program) {
        this.render_context.programs.program = program;
    }
    
    startXrSession() {

        if (!navigator.xr) return;
        
        const self = this;
        navigator.xr.isSessionSupported('immersive-vr').then(supported => {
            
            const sessionType = supported ? 'immersive-vr' : 'inline';

            navigator.xr.requestSession(sessionType).then(onXrSessionStarted);

            function onXrSessionStarted(session) {
                session.addEventListener('end', onXrSessionEnded);
                
                const gl = XrRenderer.createContext(self.canvas)
                self.gl = gl;

                self.renderer = new XrRenderer(gl, self.render_context, self.render_layers);
                self.renderer.background = Theme.bg;

                const glLayer = new XRWebGLLayer(session, gl);
                session.updateRenderState({baseLayer: glLayer});
                
                const spaceType = supported ? 'local' : 'viewer';
                session.requestReferenceSpace(spaceType).then(refSpace => {
                    self.xr = { session: session, refSpace: refSpace }
                    self.render_context.framebuffers.onscreen = new XrFramebuffer(glLayer);
                    self.render_context.programs.program = new BlandProgram(gl);
                    //
                    const offscreen = new OffscreenFramebuffer(gl);
                    offscreen.createReadPixels(gl);
                    self.render_context.framebuffers.offscreen = offscreen;
                    //
                    self.camera = new Camera(gl);
                    self.camera.ortho = true;
                    self.camera.translate.y = 80;
                    self.camera.lookAt.y = 80;
                    self.render_context.cameras.camera = self.camera;
                })

                function onXrSessionEnded() {
                    self.xr = null;
                }
            }
        }); 
    }
    
    requestAnimationFrame() {
        
        this.xr.session.requestAnimationFrame(run.bind(this));
        //requestAnimationFrame(run.bind(this))

        function run(now, frame) {

            if (this.useAnimation) {
                Animation.process(now);
            }

            if (this.useCleanser) {
                Cleanser.process(this.render_context);
            }

            if (this.useInteraction) {
                this.interactionEngine.run(this.gl, this.renderer);
            }

            if (this.xr == null) {
                requestAnimationFrame(run.bind(this));
                this.renderer.render(this.gl)

            } else {
                frame.session.requestAnimationFrame(run.bind(this)); 
                this.renderer.render(this.gl, frame, this.xr.refSpace);
            }
        }

    }
}
