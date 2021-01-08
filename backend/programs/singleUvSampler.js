import { Program } from '../program.js';

const config = {
    shader: {
        vert: null,
        frag: null 
    },
    samplers: [{
        name: 'uvSampler', 
        src: null
    }],
    attribute: {
        vtx: { name: 'position', size: 3 },
        uv:  { name: 'uv',       size: 2 },
        col: { name: 'color',    size: 4 },
    },
    uniform: {
        model: {name: 'model', value: null},
        view: {name: 'view', value: null},
        projection: {name: 'projection', value: null}
    },
    depth: true
}

export default class SingleUvSamplerProgram extends Program {

    constructor(gl, vert, frag, src, cfgOverrides) {
        const cfg = JSON.parse(JSON.stringify(config));
        cfg.shader.vert = vert;
        cfg.shader.frag = frag;
        cfg.samplers[0].src = src;
        for (let key in cfgOverrides) {
            cfg[key] = cfgOverrides[key];
        }
        super(gl, cfg);
    }
}
