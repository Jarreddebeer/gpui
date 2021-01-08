import { OnscreenFramebuffer } from './framebuffers.js';

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
        this.objects = Array.isArray(objects) ? objects : [objects];
    }
}

export class ViewportGrid {

    constructor(width, height, cols=1, rows=1) {
        this.width = width;
        this.height = height;
        this.cols = cols;
        this.rows = rows;
        this.viewports = new Array(this.cols * this.rows);
        for (let i = 0; i < this.cols * this.rows; i++) this.viewports[i] = [0, 0, 0, 0];
        if (width && height) this.update(width, height);
    } 
    
    update(width, height) {
        width = width + (this.cols - width % this.cols);
        height = height + (this.rows - height % this.rows);
        this.width = width;
        this.height = height; 
        const w = width / this.cols;
        const h = height / this.rows;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const idx = i * this.cols + j;
                const x = w * j;
                const y = h * i;
                this.viewports[idx][0] = x; 
                this.viewports[idx][1] = y;
                this.viewports[idx][2] = w;
                this.viewports[idx][3] = h;
            }
        }
    }
}

export class FullViewportGrid extends ViewportGrid {
    constructor(width, height) {
        super(width, height, 1, 1);
    }
}

export class VrViewportGrid extends ViewportGrid {
    constructor(width, height) {
        super(width, height, 2, 1);
    }
}

class Renderer {

    constructor(render_context={}, render_layers=[]) { 
        this.renderContext = new RenderContext(render_context);
        this.renderLayers = help_deserializeRenderLayers(render_layers);
        this.viewportGrid = new FullViewportGrid();
        this.flag = 0;
        this.objectFlag = 0;
    }

    _render(gl) { 
        
        for (let viewport of this.viewportGrid.viewports) {
        
            for (let renderLayer of this.renderLayers) {

                const framebuffer = this.getFramebuffer(renderLayer); 
                framebuffer.bind(gl);

                gl.clearColor(this.background[0], this.background[1], this.background[2], this.background[3]);
                this.applyViewportScissorAndClear(gl, viewport);

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
                                if (this.objectFlag == 0 || (this.objectFlag & o.flag)) {
                                    this.renderPass(gl, program, o);
                                }
                            } else {
                                if (this.objectFlag == 0 || (this.objectFlag & obj.flag)) {
                                    this.renderPass(gl, program, obj);
                                }
                            }
                        }
                    } 
                }
            }
        }
    }
    
    applyViewportScissorAndClear() {
        // Implement.
    }
    
    resize() {
        // Implement.
    }
    
    getFramebuffer(renderLayer) {
        return this.renderContext.framebuffers[renderLayer.framebuffer];
    }
    
    getOffscreenFramebuffer() {
        return this.renderContext.framebuffers['offscreen'];
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
        gl.enable(gl.SCISSOR_TEST);
        this.background = [1.0, 1.0, 1.0, 0.0];
        this.viewportGrid.update(gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    static createContext(canvas) {
        return canvas.getContext('webgl', {
            antialias: true, 
            alpha: false, 
            premultipliedAlpha: false
        });
    }
    
    get background() { return this._clearColor; }
    set background(rgba) {
        this._clearColor = rgba.vec;
    } 

    applyViewportScissorAndClear(gl, viewport) {
        gl.viewport.apply(gl, viewport);
        gl.scissor.apply(gl, viewport);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    
    resize(gl) {
        this.getOffscreenFramebuffer().resize(gl);
        this.viewportGrid.update(gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    getFramebuffer(renderLayer) {
        const framebuffer = this.renderContext.framebuffers[renderLayer.framebuffer];
        if (!this._interaction) { 
            return framebuffer; 
        }
        // TODO: get OnscreenFramebuffer out of here
        if (framebuffer instanceof OnscreenFramebuffer) {
            return this.renderContext.framebuffers.offscreen;
        }
        return framebuffer;
    }
    
    render(gl) {
        this._interaction = false;
        gl.clearColor(this.background[0], this.background[1], this.background[2], this.background[3]);
        this._render(gl);
    }
    
    renderInteraction(gl) {
        this._interaction = true;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._render(gl);
    }
    
    // called from this._render in parent class
    renderPass(gl, program, object) {
        program.model = object.transform;
        // TODO: add an override (flag) for object opacity
        if (!this._interaction) {
            program.setUniform(gl, 'opacity', object.opacity, 'float');
            program.draw(gl, object.mesh);
        } else {
            program.setUniform(gl, 'opacity', 1, 'float');
            program.draw(gl, object.interactiveMesh);
        }
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