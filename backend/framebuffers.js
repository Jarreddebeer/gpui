class Framebuffer {
    
    bind(gl) {
        // Implement me in child class
    }
    
}

export class OffscreenFramebuffer extends Framebuffer {

    constructor(gl) {

        super();
        this.width = gl.drawingBufferWidth;
        this.height = gl.drawingBufferHeight;
        this.depthId = null
        this.textureId = null
        this.framebufferId = null

        this._createRenderToTexture(gl);
        this._createFramebuffer(gl);
        this._createDepthBuffer(gl);
    }
    
    _createRenderToTexture(gl) {
        this.textureId = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    
    _createFramebuffer(gl) {
        this.framebufferId = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferId);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureId, 0);
    }
    
    _createDepthBuffer(gl) {
        this.depthId = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthId);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthId);
    }

    bind(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferId);
    }

    createReadPixels(gl) {
        this._pixels = new Uint8Array(4 * this.width * this.height); 
    }
    
    readPixels(gl) {
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, this._pixels);
    }
    
    readPixel(x, y) {
        const idx = ((this.height - y) * this.width + x) * 4;
        const r = this._pixels[idx + 0];
        const g = this._pixels[idx + 1];
        const b = this._pixels[idx + 2];
        const a = this._pixels[idx + 3];
        return r + (g << 8) + (b << 16); // TODO: a? 
    }
    
    resize(gl, width, height) {
        const useDrawingBufferDim = !width || !height; 
        this.width = useDrawingBufferDim ? gl.drawingBufferWidth : width;
        this.height = useDrawingBufferDim ? gl.drawingBufferHeight : height;

        const new_size = 4 * this.width * this.height;
        let cur_size = this._pixels.length;
        while (cur_size < new_size) cur_size *= 2;
        if (new_size < cur_size) {
            this._pixels = new Uint8Array(cur_size);
        }
        
        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthId);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
}

export class OnscreenFramebuffer extends Framebuffer {
    bind(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

export class XrFramebuffer extends Framebuffer {

    constructor(glLayer) {
        super(); 
        this.framebufferId = glLayer.framebuffer; 
    }
    
    bind(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferId);
    }
    
}
