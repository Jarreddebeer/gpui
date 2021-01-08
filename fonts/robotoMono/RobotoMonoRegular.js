import { Font } from '../../font.js';
import { vert, frag } from '../../backend/shaders/msdf/index.js';
import SingleUvSamplerProgram from '../../backend/programs/singleUvSampler.js';

import json from './RobotoMono-Regular.json.js';
import src from  './RobotoMono-Regular.ttf.png.js';

const config_overrides = {
    extensions: ['OES_standard_derivatives', 'EXT_shader_texture_lod']
}

export default class {
    
    constructor(gl) {
        this._program = new SingleUvSamplerProgram(gl, vert, frag, src, config_overrides);
        this._font = new Font(json);
    }
    
    get program() {
        return this._program;
    }
    
    get font() {
        return this._font;
    }

}