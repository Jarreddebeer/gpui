export class RenderContext {

    constructor(render_context) {
        this.cameras = render_context.cameras;
        this.objects = render_context.objects;
        this.programs = render_context.programs;
        this.framebuffers = render_context.framebuffers;
    }
    
    addCamera(obj) {
        this.add('cameras', obj);
    }
    
    addObject(obj) {
        this.add('objects', obj);
    }
    
    addProgram(obj) {
        this.add('programs', obj);
    }
    
    addFramebuffer(obj) {
        this.add("framebuffers", obj);
    }
    
    add(prop, obj) {
        for (let key of Object.keys(obj)) {
            this[prop][key] = obj[key];
        }
    }
}

class RenderLayer {
    constructor(framebuffer, renderFrames) {
        this.framebuffer = framebuffer;
        this.frames = renderFrames;
    }
}

class RenderFrame {
    constructor(flag, camera, passes) {
        this.flag = flag;
        this.camera = camera;
        this.passes = passes;
    }
}

class RenderPass {
    constructor(program, objects) {
        this.program = program;
        this.objects = objects;
    }
}

class Renderer {

    constructor(render_context={}, render_layers=[]) { 
        this.renderContext = render_context;
        this.renderLayers = help_deserializeRenderLayers(render_layers);
        this.flag = 0;
        this.cleanse = [];
    }
    
    _render(gl, renderLayer) { 

        const renderFrames = renderLayer.frames;

        for (let renderFrame of renderFrames) {

            if (renderFrame.flag && (renderFrame.flag & this.flag) == 0) 
                continue;
            
            const camera = this.renderContext.cameras[renderFrame.camera];

            for (let renderPass of renderFrame.passes) {

                const program = this.renderContext.programs[renderPass.program];
                program.view = camera.view;
                program.projection = camera.projection;

                for (let obj_name of renderPass.objects) {
                    const obj = this.renderContext.objects[obj_name];
                    if (obj.constructor == Array) for (let o of obj) {      
                        this.renderPass(gl, program, o.transform, o.opacity, o.mesh);
                    } else {
                        this.renderPass(gl, program, obj.transform, obj.opacity, obj.mesh);
                    }
                }
            } 
        }
    }

    renderPass() { 
        console.log('renderPass needs to be implemented in sub class.');
    }
}

export class WebglRenderer extends Renderer {

    constructor(gl, render_context, render_layers) {
        super(render_context, render_layers);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.DEPTH_TEST);
        this._clearColor = [1.0, 1.0, 1.0, 0.0];
    }
    
    static createContext(canvas) {
        return canvas.getContext('webgl', {
            antialias: true, 
            alpha: false, 
            premultipliedAlpha: false
        });
    }
    
    set background(rgba) {
        this._clearColor = rgba.vec;
    } 
    
    get background() {
        return this._clearColor;
    }

    render(gl) {
        gl.clearColor(this.background[0], this.background[1], this.background[2], this.background[3]);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for (let renderLayer of this.renderLayers) {
            const framebuffer = this.renderContext.framebuffers[renderLayer.framebuffer];
            framebuffer.bind(gl);
            this._render(gl, renderLayer);
        }
    }
    
    // called from this._render in parent class
    renderPass(gl, program, model_mat, opacity, mesh) {
        program.setViewport(gl.drawingBufferWidth, gl.drawingBufferHeight);
        program.model = model_mat;
        program.setFragmentShaderUniform(gl, 'opacity', 'float', opacity);
        program.draw(gl, mesh);
    }
}


// Helpers

const help_deserializeRenderLayers = (render_layers) => {
    let renderLayers = new Array(render_layers.length);
    for (let i = 0; i < render_layers.length; i++) {
        const layer = render_layers[i];
        const frames = layer.frames;
        const renderFrames = new Array(frames.length);
        for (let j = 0; j < frames.length; j++) {
            const frame = frames[j];
            const passes = frame.passes;
            const renderPasses = new Array(passes.length);
            for (let k = 0; k < passes.length; k++) {
                const pass = passes[k];
                renderPasses[k] = new RenderPass(pass.program, pass.objects);
            }
            renderFrames[j] = new RenderFrame(frame.flag, frame.camera, renderPasses);
        }
        renderLayers[i] = new RenderLayer(layer.framebuffer, renderFrames);
    }
    return renderLayers;
}