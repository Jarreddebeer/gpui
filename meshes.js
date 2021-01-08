import { Quad2d, Quad3d, XYZ, RGBA } from "./objects.js";

const fallback_rgba = new RGBA(0.3, 0.3, 0.3);

class VBO_F32 {

    constructor(length) {
        this.vbo = new Float32Array(length);
    }
    
    setXyz(vec, offs) {
        this.vbo.set(vec, offs);
    }

    addXyz(vec, offs) {
        this.vbo[offs]   += vec[0];
        this.vbo[offs+1] += vec[1];
        this.vbo[offs+2] += vec[2];
    }
    
    multiplyXyz(vec, offs) {
        this.vbo[offs]   *= vec[0];
        this.vbo[offs+1] *= vec[1];
        this.vbo[offs+2] *= vec[2];
    }
    
    setRgba(vec, offs) {
        this.vbo.set(vec, offs);
    }

    setUv(vec, offs) {
        this.vbo.set([vec[0], vec[1]], offs);
    }
    
    copy() {
        const vbo_f32 = new VBO_F32(this.vbo.length);
        vbo_f32.vbo.set(this.vbo);
        return vbo_f32;
    }
}

class VBO_U16 {

    constructor(length) {
        this.vbo = new Uint16Array(length);
    }
}

export class Mesh {

    constructor(lengthOrQuad=1) {
        const isQuad = isNaN(lengthOrQuad);
        const length = isQuad ? 1 : Math.max(1, lengthOrQuad);
        // TODO: note, meshes currenly only configured for quads
        this.vtx = new VBO_F32(length * 3 * 4);
        this.col = new VBO_F32(length * 4 * 4);
        this.ind = new VBO_U16(length * 6    );
        if (isQuad) {
            this.setQuad(lengthOrQuad, fallback_rgba, 0);
            this.color = new RGBA(252/255, 246/255, 245/255);
        }

    }
    
    setXyz(vbo, xyz, i) {
        vbo.setXyz(xyz.vec, i*3); 
    }
    
    addXyz(vbo, xyz, i) {
        vbo.addXyz(xyz.vec, i*3);
    }
    
    multiplyXyz(vbo, xyz, i) {
        vbo.multiplyXyz(xyz.vec, i*3);
    }
    
    setRgba(vbo, rgba, i) {
        vbo.setRgba(rgba.vec, i*4);
    }
    
    setInd(vbo, i, j, v, offs) {
        vbo.vbo[i+j] = offs + v;
    }

    setQuad(quad, rgb, i) {
        if (quad) this.setQuadVtx(quad, i);
        if (rgb)  this.setQuadCol(rgb, i);
        this.setQuadInd(i);
    }
    
    setQuadVtx(quad3d, i) {
        const idx = i * 4;
        const vbo = this.vtx;
        this.setXyz(vbo, quad3d.tl, idx  );
        this.setXyz(vbo, quad3d.tr, idx+1);
        this.setXyz(vbo, quad3d.br, idx+2);
        this.setXyz(vbo, quad3d.bl, idx+3);
    }

    setQuadCol(rgba, i) {
        const idx = i * 4;
        const vbo = this.col;
        this.setRgba(vbo, rgba, idx  );
        this.setRgba(vbo, rgba, idx+1);
        this.setRgba(vbo, rgba, idx+2);
        this.setRgba(vbo, rgba, idx+3);
    }

    setQuadAlpha(a, i) {
        const idx = i*4;
        const vbo = this.col;
        vbo.vbo[idx+3 ].a = a;
        vbo.vbo[idx+7 ].a = a;
        vbo.vbo[idx+11].a = a;
        vbo.vbo[idx+15].a = a;
    }

    setQuadInd(i) {
        const idx = i * 6;
        const offs = i * 4;
        const vbo = this.ind;
        this.setInd(vbo, idx, 0, 0, offs);
        this.setInd(vbo, idx, 1, 1, offs);
        this.setInd(vbo, idx, 2, 2, offs);
        this.setInd(vbo, idx, 3, 0, offs);
        this.setInd(vbo, idx, 4, 2, offs);
        this.setInd(vbo, idx, 5, 3, offs);
    }

    set offset(xyz) {
        const vtx = this.vtx;
        for (let i = 0; i < this.vtx.vbo.length / 3; i++) {
            this.addXyz(vtx, xyz, i);
        }
    }

    set scale(xyz) {
        const vtx = this.vtx;
        for (let i = 0; i < this.vtx.vbo.length / 3; i++) {
            this.multiplyXyz(vtx, xyz, i);
        }
    }

    set color(rgba) {
        this._color = rgba;
        const col = this.col;
        for (let i = 0; i < this.col.vbo.length / 4; i++) {
            this.setRgba(col, rgba, i);
        }
    }
    
    get color() {
        return this._color;
    }

    copyShallow() {
        const m = new Mesh();
        m.vtx = this.vtx;
        m.col = this.col;
        m.ind = this.ind;
        return m;
    }
}

export class UvMesh extends Mesh {

    constructor(length) {
        super(length);
        if (!isNaN(length))
            this.uv = new VBO_F32(length * 2 * 4);
    }

    setQuad(quad, rgb, uv, i) {
        if (quad) this.setQuadVtx(quad, i);
        if (rgb) this.setQuadCol(rgb, i);
        if (uv) this.setQuadUv(uv, i);
        this.setQuadInd(i);
    }
    
    setUv(out, uv, i) {
        out.setUv(uv.vec, i*2);
    }

    setQuadUv(quad2d, i) {
        const idx = i * 4;
        const vbo = this.uv;
        this.setUv(vbo, quad2d.tl, idx  );
        this.setUv(vbo, quad2d.tr, idx+1);
        this.setUv(vbo, quad2d.br, idx+2);
        this.setUv(vbo, quad2d.bl, idx+3);
    }

    copyShallow() {
        const m = new Mesh();
        m.vtx = this.vtx;
        m.col = this.col;
        m.ind = this.ind;
        m.uv  = this.uv;
        return m;
    }
}

export class TextUvMesh extends UvMesh {
    
    constructor(charDataArray) {
        super(charDataArray.length);
        this.charDataArray = charDataArray;
        for (let i = 0; i < charDataArray.length; i++) {
            const cd = charDataArray[i];
            const tl = new XYZ(cd.position.x + cd.offset.x, cd.position.y - cd.offset.y - cd.size.y, 0);
            const br = new XYZ(cd.position.x + cd.offset.x + cd.size.x, cd.position.y - cd.offset.y, 0);
            const vtx_quad = new Quad3d(tl, br);
            const uv_quad  = new Quad2d(cd.uv0, cd.uv1);
            this.setQuad(vtx_quad, cd.color, uv_quad, i);
        }
    }
}

// TODO: rework this, it probably doesn't work
export function mergeBufferData(buffer_data_array) {

        if (!buffer_data_array.length) return [];

        const metadata = {};
        for (let b of buffer_data_array) {
            for (let key in b) {
                if (!metadata.hasOwnProperty(key)) metadata[key] = 0
                metadata[key] += b[key].length;
            }
        }

        const buffer_data = new Mesh();
        for (let key in metadata) {
            const length = metadata[key];
            buffer_data[key] = key == 'ind' ? new Uint16Array(new Array(length)) : new Float32Array(new Array(length));
        }

        for (let key in buffer_data) {
            const buffer = buffer_data[key];
            let i = 0;
            let offs = 0;
            for (let bufAry of buffer_data_array) {
                for (let j = 0; j < bufAry[key].length; j++) {
                    buffer[i++] = offs + bufAry[key][j];
                }
                if (key == 'ind') offs += (bufAry['vtx'].length / 3);
            }
        }

        return buffer_data;

    }
