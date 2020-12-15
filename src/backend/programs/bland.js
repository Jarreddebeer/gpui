import { Program } from '../program';

const config = {
    shader: {
        vert: null,
        frag: null 
    },
    attribute: {
        vtx: { name: 'position', size: 3 },
        col: { name: 'color',       size: 4 },
    },
    uniform: {
        model: {name: 'model', value: null},
        view: {name: 'view', value: null},
        projection: {name: 'projection', value: null}
    }
}

export default class BlandProgram extends Program {

    constructor(gl, vert, frag) {
        const cfg = JSON.parse(JSON.stringify(config));
        cfg.shader.vert = vert;
        cfg.shader.frag = frag;
        super(gl, cfg);
    }
}