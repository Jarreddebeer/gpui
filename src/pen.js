import { RGBA, TextObject, XYZ } from './objects';
import { TextUvMesh } from './meshes';

class FontSize {

    constructor() {
        this._px = 12;    
    }

    get px() {
        return this._px;
    }
    
    set px(v) {
        this._px = v;
    }
    
    // TODO: add pt and other dimensions of size

}

export class FontStyle {

    constructor() {
        this.size = new FontSize();
        this.color = new RGBA(0.0, 0.0, 0.0);
    }
    
}

export default class Pen {
    
    constructor() { 
        this.context = null;
        this.font = null;
        this.xy = null;
        this.style = new FontStyle();
    }
    
    writeTo(context) {
        this.context = context;
    }

    write(txt) {
        const chardata = this.font.generateChars(txt, this.style.color);
        const mesh     = new TextUvMesh(chardata);
        const obj      = new TextObject(mesh);
        obj.color = this.style.color;

        const scale_fac = this.style.size.px / this.font.size;
        mesh.scale = new XYZ(scale_fac, scale_fac, 1);

        obj.translate.x = this.xy.x
        obj.translate.y = this.xy.y;
        obj.translate.z = this.xy.z || 0;

        if (this.context) {
            this.context.push(obj);
            return;
        }
        return obj;
    }
}
