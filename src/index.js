import { Camera, Object3d, Quad2d, Quad3d, RGBA, UV, XY, XYZ, Cleanser} from './objects';
import { UvMesh } from './meshes';
import { RenderContext, WebglRenderer } from './backend/renderer';
import RobotoMonoRegular from './fonts/robotoMono/RobotoMonoRegular';
import { OffscreenFramebuffer, OnscreenFramebuffer } from './backend/framebuffers';
import FastBlur from './backend/programs/fastblur';
import Pen from './pen';
import { animationTick, RotateXInOutVersion3, RotateXInOutVersion2, RotateXInOut, RotateX360, Transition, Animation, Keyframe, RotateX } from './animation';

//

const cv = document.getElementById('canvas');
cv.width = 600; cv.height = 600;

const gl = WebglRenderer.createContext(cv);

//

const camera = new Camera(cv);
camera.ortho = false;

const robotoMonoRegular = new RobotoMonoRegular(gl);

const header = [];
const headerFont = robotoMonoRegular.font;

const pen = new Pen();
pen.font = headerFont;
pen.style.size.px = 32;

pen.xy = new XYZ(0, 0, 0);
pen.style.color = new RGBA(1.0, 0.0, 0.0);
pen.writeTo(header);
pen.write("Hello world!");

const header_shadow = header.map(o => {
    const newo = o.copyShallow();
    newo.translate = o.translate.copyShallow();
    newo.translate.offset = new XYZ(2, -2, 0);
    newo.mesh = newo.mesh.copyShallow();
    newo.mesh.col = newo.mesh.col.copy();
    newo.color = new RGBA(0.0, 1.0, 0.0);
    return newo;
});

setTimeout(_ => {
    //RotateXInOut.animate(header[0]);
    //RotateXInOutVersion2.animate(header[0]);
    RotateXInOutVersion3.animate(camera);
}, 500);

/*setTimeout(_ => {
    header_shadow[0].translate.offset.y = -5;
    setTimeout(_ => {
        header_shadow[0].color.r = 1.0;
    }, 1000);
}, 2000);*/

//
let fullscreenQuad;
{
const v_tl = new XY(-cv.width/2, cv.height/2);
const v_br = new XY(cv.width/2, -cv.height/2);
const quad = new Quad3d(v_tl, v_br);
const col = new RGBA(1.0, 0.0, 1.0, 1.0);
const u_tl = new UV(0.0, 1.0);
const u_br = new UV(1.0, 0.0);
const uv = new Quad2d(u_tl, u_br);
const mesh = new UvMesh(1);
mesh.setQuad(quad, col, uv, 0);
fullscreenQuad = new Object3d(mesh);
}    

const offscreenFramebuffer = new OffscreenFramebuffer(gl, cv.width, cv.height);
const onscreenFramebuffer = new OnscreenFramebuffer(cv.width, cv.height);

const fastblur = new FastBlur(gl, offscreenFramebuffer.textureId);

const renderContext = new RenderContext({
    cameras: {
        main: camera 
    },
    objects: {
        fullscreenQuad: fullscreenQuad,
        header: header,
        headerShadow: header_shadow
    },
    programs: {
        primaryFont: robotoMonoRegular.program,
        fastblur: fastblur.program
        
    },
    framebuffers: {
        onscreenFramebuffer: onscreenFramebuffer,
        offscreenFramebuffer: offscreenFramebuffer
    }
});

const renderLayers = [
    {
        framebuffer: 'offscreenFramebuffer',
        frames: [{
            camera: 'main',
            passes: [{
                program: 'primaryFont',
                objects: ['headerShadow']
            }]
        }]
    }, {
        framebuffer: 'onscreenFramebuffer',
        frames: [{
            camera: 'main',
            passes: [{
                program: 'fastblur',
                objects: ['fullscreenQuad']
            }, {
                program: 'primaryFont',
                objects: ['header']
            }]
        }]
    }
];

let bgCol = new RGBA(1.0, 1.0, 1.0, 0.0);
const renderer = new WebglRenderer(gl, renderContext, renderLayers);
renderer.background = bgCol;

//

let animationFrame;
const run = now => {
    animationTick(now);
    Cleanser.process(renderContext);
    renderer.render(gl); 
    animationFrame = requestAnimationFrame(run);
}

run();