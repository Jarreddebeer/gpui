export class Texture {

    constructor(gl, unit, src) { 

        if (!src) throw new Error('Texture needs a src url or a texture Id');
        
        const isSrcString = typeof src === 'string' || src instanceof String;
        const isSrcTextureId = !isSrcString && src.constructor && src.constructor.name == "WebGLTexture";

        this.id = isSrcTextureId ? src : null;
        this.src = isSrcString ? src : null; 
        this.unit = unit;
        this.image = null
        this.uniform = null

        if (!this.id)
            this._load(gl);
    }

    _load(gl) {
        this.id = gl.createTexture();
        this._bindBeforeLoad(gl);
        this.image = new Image();
        this.image.src = this.src;
        const self = this;
        this.image.onload = _ => {
            self._bindAfterLoad(gl);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }
    
    _bindBeforeLoad(gl) {
        gl.bindTexture(gl.TEXTURE_2D, this.id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([150, 150, 150, 150]));
    }
    
    _bindAfterLoad(gl) {
        gl.bindTexture(gl.TEXTURE_2D, this.id);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // NOTE: not using mipmaps because it leads to poor texture quality
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

}