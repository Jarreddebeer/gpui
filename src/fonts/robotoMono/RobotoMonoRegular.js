import { Font } from '../../font';
import { vert, frag } from '../../backend/shaders/msdf/index';
import SingleUvSamplerProgram from '../../backend/programs/singleUvSampler';

const json = require('./RobotoMono-Regular.json');
const src = require('./RobotoMono-Regular.ttf.png').default;

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