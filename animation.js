let now = 0;
let animationQueue = [];

class AnimationEngine {

    static schedule(start_ms, boundCurve) {
        animationQueue.push([start_ms, boundCurve]);
    }

    static process(t=0) {
        now = t;
        for (let i = 0; i < animationQueue.length; i++) {

            const [start_ms, boundCurve] = animationQueue[i];
            const curve = boundCurve.curve;
            
            if (curve.expired(start_ms)) {
                const v = curve.endValue;
                BoundCurve.apply(boundCurve, v);
                animationQueue[i] = null;
                curve.index = 0;
                continue;
            }
            
            curve.trim(start_ms);

            if (curve.active(start_ms)) {
                const v = curve.value(start_ms);
                BoundCurve.apply(boundCurve, v);
            }
        }

        animationQueue = animationQueue.filter(abc => abc != null);
    }
    
    static boundCurveExpired(start_ms, boundCurve) {
        const last_keyframe = boundCurve.keyframes[boundCurve.keyframes.length-1];
        return start_ms + last_keyframe.time < now;
    }
    
    static boundCurveActive(start_ms, boundCurve) {
        const first_keyframe = boundCurve.keyframes[0];
        return start_ms + first_keyframe.time >= now;
    }

}

export class Keyframe {
    constructor(time, value) {
        this.time = time;
        this.value = value;
    }
    set time(v) { this._time = v; }
    get time() { return this._time; }
    
    set value(v) { this._value = v; }
    get value() { return this._value; }
}

export class Curve {

    // ary1 is an array of Keyframes. 
    //   otherwise ary1 is an array of time_ms and ary2 is the corresponding array of values
    constructor(ary1, ary2) {
        let keyframes = ary1;
        if (arguments.length == 2) {
            keyframes = new Array(ary1.length);
            for (let i = 0; i < keyframes.length; i++) {
                keyframes[i] = new Keyframe(ary1[i], ary2[i]);
            }
        }
        this.keyframes = keyframes;
        // TODO: take index out
        this.index = 0;
    }
    
    expired(start_ms) {
        if (this.index >= this.keyframes.length) return true;
        const end_key = this.keyframes[this.keyframes.length-1];
        return start_ms + end_key.time < now;
    }
    
    get endValue() {
        const end_key = this.keyframes[this.keyframes.length-1];
        return end_key.value;
    }

    value(start_ms) {
        return this.interpolate(start_ms); 
    }
    
    active(start_ms) {
        if (this.index >= this.keyframes.length) return false;
        const start_key = this.keyframes[this.index];
        return start_ms + start_key.time <= now;
    }
    
    trim(start_ms) {
        while (this.index < this.keyframes.length-1 && (start_ms + this.keyframes[this.index+1].time) < now) {
            this.index++;
        }
    }
    
    interpolate(start_ms) {
        const t1 = this.keyframes[this.index].time;
        const t2 = this.keyframes[this.index+1].time;
        const x1 = this.keyframes[this.index].value;
        const x2 = this.keyframes[this.index+1].value;
        const t = (now - t1 - start_ms) / (t2 - t1);
        return x1 + t * (x2 - x1);
    }
}

export class StepCurve extends Curve {

    interpolate(start_ms) {
        return this.keyframes[this.index].value;
    }

}

export class TwoKeyframeCurve extends Curve {
    constructor(object, key, delay, duration, startValue, endValue) {
        super(object, key, 
            new Keyframe(delay, startValue),
            new Keyframe(delay+duration, endValue)
        );
    }
}

export class BoundCurve {
    
    constructor(object, property, curve) {
        this.object = object;
        this.property = property;
        this.curve = curve; 
    }
    
    /*bakeTime(time_ms) {
        const keys = this.curve.keyframes.map(k => new Keyframe(time_ms + k.time, k.value));
        const fixedCurve = new this.curve.constructor(keys);
        return new BoundCurve(this.object, this.property, fixedCurve);
    }*/

    static apply(boundCurve, value) {
        boundCurve.object[boundCurve.property] = value;
    }
}

export class Animation {
    
    constructor() {
        this.boundCurves = [];
    }
    
    link(object, property, curve) {
        this.boundCurves.push(
            new BoundCurve(object, property, curve)
        );
    }

    schedule(delay) {
        const t = now + delay;
        for (let i = 0; i < this.boundCurves.length; i++) {
            const boundCurve = this.boundCurves[i];
            //const bakedBoundCurve = boundCurve.bakeTime(t);
            AnimationEngine.schedule(t, boundCurve);
        }
    }
    
    static process(t) {
        AnimationEngine.process(t); 
    }

}

export class RotateX {
    static animate(object, delay=0, duration=2000, startValue=-2, endValue=-20) {
        const tran = new Curve(object.rotate, 'x', 
            new Keyframe(0, startValue),
            new Keyframe(duration, endValue)
        );
        Animation.schedule(delay, tran);
    }
}

export class RotateX360 {
    static animate(object, delay, duration, isReversed=false) {
        RotateX.animate(object, delay, duration, 0, (isReversed ? -1 : 1) * 2 * Math.PI);
    }
}

export class RotateXInOut {
    static animate(object) {
        const rotIn = new Curve(object.rotate, 'x', [
            new Keyframe(0,    0),
            new Keyframe(2000, Math.PI)
        ]);
        const rotOut = new Curve(object.rotate, 'x', [
            new Keyframe(2000, Math.PI),
            new Keyframe(4000, 0)
        ]);
        Animation.schedule(0, rotIn);
        Animation.schedule(0, rotOut);
    }
}

export class RotateXInOutVersion2 {
    static animate(object) {
        RotateX360.animate(object, 0,    1000);
        RotateX360.animate(object, 1000, 1000, true);
    }
}

export class RotateXInOutVersion3 {
    static animate(object) {
        Animation.schedule(0, 
            new TwoKeyframeCurve(object.translate, 'x', 0, 2000, 0, 100),
            new TwoKeyframeCurve(object.translate, 'x', 2000, 2000, 100, 0)
        );
    }
}

export class RotateXYScaleY {
    static animate(object) {
        Animation.schedule(0,
            new TwoKeyframeCurve(object.rotate, 'z', 1000, 1500, 0, 4*Math.PI),
            new TwoKeyframeCurve(object.scale, 'y', 1000, 500, 1, 1.3),
            new TwoKeyframeCurve(object.scale, 'y', 1500, 500, 1.3, 1),
            new TwoKeyframeCurve(object.rotate, 'y', 1500, 1000, 0, 4*Math.PI)
        )
    }
}

export class BobbingInMotion {
    static animate(object) {
        Animation.schedule(0,
            new TwoKeyframeCurve(object.scale, 'x', 1030, 100, 1, 1.0526),
            new TwoKeyframeCurve(object.scale, 'y', 1000, 100, 1, 0.95),

            new TwoKeyframeCurve(object.scale, 'x', 1130, 100, 1.0526, 0.5),
            new TwoKeyframeCurve(object.scale, 'y', 1100, 100, 0.95, 1.5),

            new TwoKeyframeCurve(object.scale, 'x', 1230, 100, 0.5, 0.8),
            new TwoKeyframeCurve(object.scale, 'y', 1200, 100, 1.5, 0.8),

            new TwoKeyframeCurve(object.scale, 'x', 1330, 100, 0.8, 1.5),
            new TwoKeyframeCurve(object.scale, 'y', 1300, 100, 0.8, 0.5),

            new TwoKeyframeCurve(object.scale, 'x', 1430, 100, 1.5, 0.83),
            new TwoKeyframeCurve(object.scale, 'y', 1400, 100, 0.5, 1.2),

            new TwoKeyframeCurve(object.scale, 'x', 1530, 100, 0.83, 1.2),
            new TwoKeyframeCurve(object.scale, 'y', 1500, 100, 1.2, 0.83),

            new TwoKeyframeCurve(object.scale, 'x', 1630, 100, 1.2, 0.91),
            new TwoKeyframeCurve(object.scale, 'y', 1600, 100, 0.83, 1.1),

            new TwoKeyframeCurve(object.scale, 'x', 1730, 100, 0.91, 1.05),
            new TwoKeyframeCurve(object.scale, 'y', 1700, 100, 1.1, 0.952),

            new TwoKeyframeCurve(object.scale, 'x', 1830, 150, 1.05, 0.97),
            new TwoKeyframeCurve(object.scale, 'y', 1800, 150, 0.952, 1.03),

            new TwoKeyframeCurve(object.scale, 'x', 1980, 130, 0.97, 1.0),
            new TwoKeyframeCurve(object.scale, 'y', 1950, 130, 1.03, 1.0),
        )
    }
}