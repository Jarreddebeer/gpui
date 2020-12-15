import { UV, XY, RGBA } from './objects';

const defaultCol = new RGBA(0.3, 0.3, 0.3);

export class Font {

    constructor(chardata) { 
        this._chardata = chardata;
    }
    
    get chars() {
        return this._chardata.chars;
    }
    
    get size() {
        return this._chardata.info.size;
    }
    
    get lineHeight() {
        return this._chardata.common.lineHeight;
    }
    
    get base() {
        return this._chardata.common.base;
    }
    
    generateChars(txt, col=defaultCol) {

        const chars    = new Array(256);
        const metadata = new Array(txt.length);
        const pen      = {x: 0, y: 0};
        const start_pos = {x: 0, y: 0};

        this.chars.map(chr => { chars[chr.id] = chr; });

        for (let i = 0; i < txt.length; i++) {
            const c = txt.charCodeAt(i);
            const chr = txt.charAt(i);
            if (!chars.hasOwnProperty(c)) {
                metadata[i] = new CharData({
                    character: chr,
                    uv0:       new UV(0, 0),
                    uv1:       new UV(0, 0),
                    size:      new XY(0, 0),
                    advancex:  0,
                    offset:    new XY(0, 0),
                    origin:    new XY(0, 0),
                    position:  new XY(pen.x, pen.y),
                    color:     col
                });
            } else {
                const tex_w = this._chardata.common.scaleW;
                const tex_h = this._chardata.common.scaleH;
                const w = chars[c].width;
                const h = chars[c].height;
                metadata[i] = new CharData({
                    character: chr,
                    uv0:       new UV( chars[c].x / tex_w, (chars[c].y + h) / tex_h),
                    uv1:       new UV((chars[c].x + w) / tex_w, chars[c].y / tex_h),
                    size:      new XY(w, h),
                    advancex:  chars[c].xadvance,
                    offset:    new XY(chars[c].xoffset, chars[c].yoffset),
                    origin:    new XY( pen.x, pen.y ),
                    position:  new XY( pen.x, pen.y ),
                    color:     col
                });
            }

            if (metadata[i].advancex)
                pen.x += metadata[i].advancex;

            if (metadata[i].character == '\n') {
                pen.x = start_pos.x;
                pen.y -= this.lineHeight; 
            }
            
            if (metadata[i].character == '\t') {
                const c = '-'.charCodeAt(0);
                pen.x += chars[c].size.w * 4;
            }
        }
        return metadata;
    }
}

class CharData {
    
    constructor(cd) {
        this.character = cd.character;
        this.uv0 = cd.uv0;
        this.uv1 = cd.uv1;
        this.size = cd.size;
        this.advancex = cd.advancex;
        this.offset = cd.offset;
        this.origin = cd.origin; 
        this.position = cd.position;
        this.color = cd.color;
    }
    
}



/*
function apply(object, context) {

    if (context.hasOwnProperty('color')) {
        applyFontColor(object, context.color);
    }

    if (context.hasOwnProperty('fontScale')) {
        applyFontScale(object, context.fontScale);
    }

    if (context.hasOwnProperty('textAlign') && context.hasOwnProperty('bounds')) {
        applyTextAlign(object, context.textAlign, context.bounds);
    }

    if (context.hasOwnProperty('verticalAlign') && context.hasOwnProperty('bounds')) {
        applyVerticalAlign(object, context.verticalAlign, context.bounds);
    }

    if (context.hasOwnProperty('pivot')) {
        applyPivot(object, context.pivot);
    }
    
}

function applyFontColor(object, color) {
    object.mesh.color(color.r, color.g, color.b);
}

function applyFontScale(object, scale) {
    object.mesh.scale(scale, scale);
    object.setBounds();
}

function applyTextAlign(object, tAlign, bounds) {
    switch (tAlign) {
        case textAlign.LEFT:
            break;
        case textAlign.CENTER:
            const bCenter = bounds.getCenter();
            const oCenter = object.bounds.getCenter();
            const x = bCenter.x - oCenter.x;
            object.mesh.translate(x);
            for (let i = 0; i < object.charData.length; i++) {
                object.charData[i].posx += x;
            }
            break;
        case textAlign.RIGHT:
            break;
    }
}

function applyVerticalAlign(object, vAlign, bounds, applyTransform) {
    switch (vAlign) {
        case verticalAlign.LEFT:
            break;
        case verticalAlign.MIDDLE:
            const bCenter = bounds.getCenter();
            const oCenter = object.bounds.getCenter();
            const y = bCenter.y - oCenter.y;
            object.mesh.translate(0, y);
            for (let i = 0; i < object.charData.length; i++) {
                object.charData[i].posy += y;
            }
            break;
        case verticalAlign.RIGHT:
            break;
    }
}

function applyPivot(object, pivot) {
    object.setPivot(pivot);
    for (let i = 0; i < object.charData.length; i++) {
        object.charData[i].posx -= pivot.x;
        object.charData[i].posy -= pivot.y;
    }
}
*/
