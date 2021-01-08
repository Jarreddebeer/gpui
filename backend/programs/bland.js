import { Program } from '../program.js';

const fallback_vert = `
attribute vec3 position;
attribute vec4 color;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec4 vColor;

void main(void) {
  gl_Position = projection * view * model * vec4(position, 1);
  vColor = color;
}
`;

const fallback_frag = `
precision mediump float;

varying vec4 vColor;
uniform float opacity;

void main(void) {
  gl_FragColor = vec4(vColor.rgb, opacity);
}
`;

const config = {
    shader: {
        vert: null,
        frag: null 
    },
    attribute: {
        vtx: { name: 'position', size: 3 },
        col: { name: 'color',    size: 4 },
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
        cfg.shader.vert = vert || fallback_vert;
        cfg.shader.frag = frag || fallback_frag;
        super(gl, cfg);
    }
}