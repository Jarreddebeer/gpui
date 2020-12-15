let now = 0;
let animationQueue = [];

export const animationTick = (t=0) => {
    now = t;
    for (let i = 0; i < animationQueue.length; i++) {
        animationQueue[i].step();
    }
    animationQueue = animationQueue.filter(anim => anim.valid);
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

export class Transition {

    constructor(object, key, ...keyframes) {
        this.key = key;
        this.object = object;
        this.keyframes = keyframes;
    }
    
    get active() {
        return this.keyframes[0].time <= now;
    }
    
    get valid() {
        return this.keyframes.length >= 2 && 
               this.keyframes[1].time >= now;
    }

    step() {
        while (!this.valid) {
            if (this.keyframes.length < 2) {
                this.close();
                return;
            }
            this.keyframes.shift();
        }
        if (!this.active)
            return;
        const value = this.interpolate();
        this.apply(value);
    }
    
    close() {
        const closing_value = this.keyframes[this.keyframes.length - 1].value;
        this.apply(closing_value);
        this.keyframes.length = 0;
    }
    
    apply(v) {
        this.object[this.key] = v;    
    }
    
    interpolate() {
        const t1 = this.keyframes[0].time;
        const t2 = this.keyframes[1].time;
        const x1 = this.keyframes[0].value;
        const x2 = this.keyframes[1].value;
        const t = (now - t1) / (t2 - t1);
        return x1 + t * (x2 - x1);
    }
}

export class TwoKeyframeTransition extends Transition {

    constructor(object, key, delay, duration, startValue, endValue) {
        super(object, key, 
            new Keyframe(delay, startValue),
            new Keyframe(delay+duration, endValue)
        );
    }
}

export class Animation {
    static schedule(delay, ...transitions) {
        const t = now + delay;
        for (let i = 0; i < transitions.length; i++) {
            const transition = transitions[i];
            const keys = transition.keyframes.map(k => new Keyframe(t + k.time, k.value));
            const anim = new Transition(transition.object, transition.key, ...keys);
            animationQueue.push(anim);
        }
    }
}

export class RotateX {
    
    static animate(object, delay=0, duration=2000, startValue=-2, endValue=-20) {
        const tran = new Transition(object.rotate, 'x', 
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
        const rotIn = new Transition(object.rotate, 'x', [
            new Keyframe(0,    0),
            new Keyframe(2000, Math.PI)
        ]);
        const rotOut = new Transition(object.rotate, 'x', [
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
            new TwoKeyframeTransition(object.translate, 'x', 0, 2000, 0, 100),
            new TwoKeyframeTransition(object.translate, 'x', 2000, 2000, 100, 0)
        );
    }
}