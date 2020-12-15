class Framebuffer {

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    bind(gl) {
        // Implement me in child class
    }
}

export class OffscreenFramebuffer extends Framebuffer {

    constructor(gl, width, height, clearCol=[0.0, 0.0, 0.0, 0.0]) {

        super(width, height);
        this.clearCol = clearCol;
        this.depthId = null
        this.textureId = null
        this.framebufferId = null

        this._createRenderToTexture(gl, width, height);
        this._createFramebuffer(gl);
        this._createDepthBuffer(gl, width, height);
    }
    
    _createRenderToTexture = (gl, width, height) => {
        this.textureId = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    
    _createFramebuffer = gl => {
        this.framebufferId = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferId);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureId, 0);
    }
    
    _createDepthBuffer = (gl, width, height) => {
        this.depthId = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthId);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthId);
    }

    bind(gl) {
        const col = gl.getParameter(gl.COLOR_CLEAR_VALUE);
        gl.clearColor(this.clearCol[0], this.clearCol[1], this.clearCol[2], this.clearCol[3]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferId);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(col[0], col[1], col[2], col[3]);
    }
}

export class OnscreenFramebuffer extends Framebuffer {

    constructor(width, height) {
        super(width, height);
     }

    bind(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}
