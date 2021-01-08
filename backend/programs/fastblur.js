import { vert, frag } from '../shaders/fastblur/index.js';
import singleUvSamplerProgram from './singleUvSampler.js';

const config_overrides = {
    depth: false
}

export default class FastBlur {
    
    constructor(gl, textureId) {
        this._program = new singleUvSamplerProgram(gl, vert, frag, textureId, config_overrides);
    }
    
    get program() {
        return this._program;
    }
    
}