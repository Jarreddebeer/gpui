import { vec4, mat4 } from 'gl-matrix';

export class Object3d {

    constructor(mesh) {
        this.translate = new Attribute3d(0, 0, 0);
        this.rotate    = new Attribute3d(0, 0, 0);
        this.scale     = new Attribute3d(1, 1, 1);
        this.transform = mat4.create();
        this.opacity = 1;
        this.bounds = null;
        if (mesh) this.mesh = mesh;
        Cleanser.primitives.add(this);
    }
    
    get translate() { return this._translate; }
    set translate(attr3d) { 
        this._translate = attr3d; 
        Cleanser.objects.add(this); 
    }
    
    get rotate() { return this._rotate; }
    set rotate(attr3d) { 
        this._rotate = attr3d; 
        Cleanser.objects.add(this); 
    }
    
    get scale() { return this._scale; }
    set scale(attr3d) { 
        this._scale = attr3d; 
        Cleanser.objects.add(this); 
    }
    
    set mesh(m) {
        this._mesh = m;
        this._setBounds();
    }
    
    get mesh() {
        return this._mesh;
    }
    
    bake() {
        // scaleRotateXYZTranslate 
        mat4.identity(this.transform);
        mat4.scale(this.transform, this.transform, this.scale.xyz.vec);
        mat4.rotate(this.transform, this.transform, this.rotate.x, new Float32Array([1, 0, 0]));
        mat4.rotate(this.transform, this.transform, this.rotate.y, new Float32Array([0, 1, 0]));
        mat4.rotate(this.transform, this.transform, this.rotate.z, new Float32Array([0, 0, 1]));
        mat4.translate(this.transform, this.transform, this.translate.xyz.vec);
        if (this.color) this.mesh.color = this.color;
    }

    // TODO: this results in wrong bounds.
    _setBounds() {
        let xmin = 1e9 ; let ymin = 1e9 ; let zmin = 1e9 ; 
        let xmax = -1e9; let ymax = -1e9; let zmax = -1e9;
        for (let i = 0; i < this.mesh.vtx.length; i += 3) {
            const x = this.mesh.vtx[i];
            const y = this.mesh.vtx[i + 1];
            const z = this.mesh.vtx[i + 2];
            xmin = Math.min(xmin, x); xmax = Math.max(xmax, x);
            ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
            zmin = Math.min(zmin, z); zmax = Math.max(zmax, z);
        }

        const tl_vec4 = new Float32Array([xmin, ymin, zmax, 0]); 
        const br_vec4 = new Float32Array([xmax, ymax, zmin, 0]); 
        vec4.transformMat4(tl_vec4, tl_vec4, this.transform);
        vec4.transformMat4(br_vec4, br_vec4, this.transform);
        const tl = new XYZ(tl_vec4[0], tl_vec4[1], tl_vec4[2]);
        const br = new XYZ(br_vec4[0], br_vec4[1], br_vec4[2]);
        this.bounds = new Quad3d(tl, br);
    }

    set pivot(xyz) {
        this.translate.x += xyz.x; 
        this.translate.y += xyz.y;
        this.translate.z += xyz.z;
        this.mesh.offset = new XYZ(-xyz.x, -xyz.y, -xyz.z);
    }

    get color() { 
        return this._color; 
    }

    set color(rgba) { 
        this._color = rgba;
        this.mesh.color = rgba; 
    }

    copyShallow() {
        const obj = new Object3d(this.mesh);
        obj.translate = this.translate;
        obj.rotate    = this.rotate;
        obj.scale     = this.scale;
        return obj;
    }
    
}

export class TextObject extends Object3d {
    constructor(vbo) {
        super(vbo);
    }
}

export class Camera {

    constructor(canvas) {
        this.canvas     = canvas;
        this._width     = canvas.width;
        this._height    = canvas.height;
        this.near       = 0.01;
        this.far        = 1000;
        this.view       = mat4.create();
        this.projection = mat4.create();
        this._translate = new Attribute3d(0, 0, this.focalZ); 
        this._lookAt    = new Attribute3d(0, 0, 0);
        this._up        = new Attribute3d(0, 1, 0);
        Cleanser.objects.add(this);
    }

    // NOTE: uses vertical fov. targetting default horizontal fov of 80deg.
    get fov()    { return 80 * Math.PI / 180; }

    get focalZ() { return this.height / (Math.tan(this.fov / 2) * 2); }
    
    set width(v) { this._width = v; }
    get width()  { return (this.canvas) ? this.canvas.width : this._width; }
    
    set height(v) { this._height = v; }
    get height()  { return (this.canvas) ? this.canvas.height : this._height; }
    
    set ortho(isOn) {
        if (isOn) this.bakeOrtho();
        else      this.bakePerspective(); 
    }

    set perspective(isOn) {
        if (isOn) this.bakePerspective();
        else      this.bakeOrtho();
    }
    
    bake() {
        //this.bakeOrtho();
        //this.bakePerspective();
        this.bakeView();
    }
    
    bakeOrtho() {
        mat4.ortho(this.projection, -this.width/2, this.width/2, -this.height/2, this.height/2, this.near, this.far);
    }
    
    bakePerspective() {
        mat4.perspective(this.projection, this.fov, this.width/this.height, this.near, this.far);
    }

    bakeView() {
        mat4.lookAt(this.view, this.translate.xyz.vec, this.lookAt.xyz.vec, this.up.xyz.vec);
    }
    
    set translate(xyz) { this._translate.xyz = xyz; }
    get translate() { return this._translate; } 
    
    set lookAt(xyz) { this._lookAt.xyz = xyz; }
    get lookAt() { return this._lookAt; }
    
    up(xyz) { this._up.xyz = xyz; }
    get up() { return this._up; }

}

//

export class RGBA {

    constructor(r=0, g=0, b=0, a=1) {
        this.vec = new Float32Array([r, g, b, a]);
        Cleanser.primitives.add(this);
    }
    
    get r() { return this.vec[0]; }
    set r(v) { 
        this.vec[0] = v; 
        Cleanser.primitives.add(this);
    }
    
    get g() { return this.vec[1]; }
    set g(v) { 
        this.vec[1] = v; 
        Cleanser.primitives.add(this);
    }
    
    get b() { return this.vec[2]; }
    set b(v) { 
        this.vec[2] = v; 
        Cleanser.primitives.add(this);
    }
    
    get a() { return this.vec[3]; }
    set a(v) { 
        this.vec[3] = v; 
        Cleanser.primitives.add(this);
    }
    
    copy() {
        return new RGBA(this.r, this.g, this.b, this.a);
    }

}

export class XY {
    
    constructor(x=0, y=0) {
        this.vec = new Float32Array([x, y, 0]);
        Cleanser.primitives.add(this);
    }

    get x() { return this.vec[0]; }
    set x(a) { 
        this.vec[0] = a; 
        Cleanser.primitives.add(this); 
    }
    
    get y() { return this.vec[1]; }
    set y(a) { 
        this.vec[1] = a; 
        Cleanser.primitives.add(this); 
    }
    
    copy() {
        return new XY(this.x, this.y, 0);
    }
}

export class XYZ extends XY {
    
    constructor(x=0, y=0, z=0) {
        super(x, y);
        this.z = z;
    }
    
    get z() { return this.vec[2]; }
    set z(v) { 
        this.vec[2] = v; 
        Cleanser.primitives.add(this); 
    }
    
    copy() {
        return new XYZ(this.x, this.y, this.z);
    }
}

export class UV extends XY {
    
    constructor(u=0, v=0) {
        super(u, v);
    }
    
    get u() { return this.x; }
    set u(a) { 
        this.x = a; 
    }
    
    get v() { return this.y; }
    set v(a) { this.y = a;}
    
    copy() {
        return new UV(this.u, this.v);
    }
    
}

export class Quad2d {

    constructor(tl, br) {
        this._tr = tl.copy()
        this._bl = br.copy(); 
        // tr, bl are updated in below assignments
        this.tl = tl; // top left front
        this.br = br; // bot right back
    }

    set tl(tl) {
        this._tl = tl;
        this._tr.y = tl.y;
        this._bl.x = tl.x;
    }
    
    get tl() {
        return this._tl;
    }
    
    set br(br) {
        this._br = br;
        this._tr.x = br.x;
        this._bl.y = br.y;
    }
    
    get br() {
        return this._br;
    }
    
    get tr() {
        return this._tr;
    }
    
    get bl() {
        return this._bl;
    }

    get center() {
        return new Float32Array([ 
            (this.tl.x + this.br.x) / 2, 
            (this.tl.y + this.br.y) / 2 
        ]);
    }

    get width() {
        return this.br.x - this.tl.x;
    }

    get height() {
        return this.tl.y - this.br.y;    
    }
}

export class Quad3d extends Quad2d {
    
    constructor(tl, br) {
        super(tl, br);
        this._tl.z = tl.z;
        this._tr.z = tl.z;
        this._bl.z = br.z;
        this._br.z = br.z;
    }
    
    get center() {
        return new XYZ(
            (this.tl.x + this.br.x) / 2,
            (this.tl.y + this.br.y) / 2,
            (this.tl.z + this.br.z) / 2
        );
    }
        
    get depth() {
        return Math.abs(this.tl.z - this.br.z);
    }
}

class Attribute3d {
    
    constructor(x=0, y=0, z=0) {
        this._xyz    = new XYZ(x, y, z); 
        this._offset = new XYZ(0, 0, 0);
        Cleanser.attributes.add(this);
    }
    
    get xyz() { 
        const xyz = this._xyz.copy();
        xyz.x += this._offset.x;
        xyz.y += this._offset.y;
        xyz.z += this._offset.z;
        return xyz; 
    }

    get x() { return this._xyz.x + this._offset.x; }
    get y() { return this._xyz.y + this._offset.y; }
    get z() { return this._xyz.z + this._offset.z; }
    
    set xyz(abc) { 
        this._xyz = abc; 
        Cleanser.attributes.add(this); 
    }
    set x(v) { this._xyz.x = v; }
    set y(v) { this._xyz.y = v; }
    set z(v) { this._xyz.z = v; }
    
    get offset() { return this._offset; }
    set offset(xyz) { 
        this._offset = xyz; 
        Cleanser.attributes.add(this); 
    }
    
    copyShallow() {
        const a = new Attribute3d();
        a.xyz = this._xyz;
        a.offset = this._offset;
        return a;
    }
}

//

const _cleanser_objects = new Set();
const _cleanser_attributes = new Set();
const _cleanser_primitives = new Set();

export class Cleanser {
    
    get objects() { return _cleanser_objects; }
    get attributes() { return _cleanser_attributes; }
    get primitives() { return _cleanser_primitives; }
    
    static process(renderContext) {
        
        if (Cleanser.attributes.size || Cleanser.primitives.size) {
            Cleanser.processMap(renderContext.objects);
            Cleanser.processMap(renderContext.cameras);
        }
        
        for (let object of Cleanser.objects) {
            object.bake();
        }
        
        Cleanser.objects.clear();
        Cleanser.attributes.clear();
        Cleanser.primitives.clear();
    }
    
    static processMap(map) {
        for (let name in map) {
            let objects = map[name];
            if (!Array.isArray(objects)) {
                objects = [objects];
            }
            for (let object of objects) {
                Cleanser.processObject(object); 
            }
        }
    }
    
    static processObject(object) {
        if (Cleanser.objects.has(object)) return;
        for (let attribute of Cleanser.attributes) {
            if (object.translate == attribute || object.rotate == attribute || object.scale == attribute) {
                Cleanser.objects.add(object);
            }
        }
        if (Cleanser.objects.has(object)) return;
        for (let primitive of Cleanser.primitives) {
            if (object.translate._xyz == primitive || object.translate._offset == primitive ||
                object.rotate._xyz    == primitive || object.rotate._offset    == primitive ||
                object.scale._xyz     == primitive || object.scale._offset     == primitive ||
                object.color          == primitive) {
                    Cleanser.objects.add(object);
                    return;
            }
        }
    }
    
}