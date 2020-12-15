import { Texture } from './textures';
import { VertexShader, FragmentShader } from './shaders';
import { VertexBuffer, ElementArrayBuffer } from './buffers';

export class Program {

    constructor(gl, config) {

        this.viewport = [0, 0, 0, 0]; // set some time before draw
        this.program = null;
        this.vertexShader = null;
        this.fragmentShader = null;
        this._depth = false; 

        if (config.extensions) {
            for (let extension of config.extensions) {
                gl.getExtension(extension);
            }
        }

        this.program = gl.createProgram();

        this.vertexShader   = new VertexShader(gl, config.shader.vert, config.attribute);
        this.fragmentShader = new FragmentShader(gl, config.shader.frag);

        gl.attachShader(this.program, this.vertexShader.id);
        gl.attachShader(this.program, this.fragmentShader.id);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);

        for (let key in config.attribute) {
            const attr = config.attribute[key];
            this.vertexShader.addVertexBuffer(
                new VertexBuffer(gl, attr.name, attr.size)
            );
        }

        this.vertexShader.addElementArrayBuffer(
            new ElementArrayBuffer(gl)
        );

        for (let key in config.uniform) {
            const uniform = config.uniform[key];
            this.vertexShader.addUniform(
                new UniformMat4(uniform.name, uniform.value)
            );
        }

        this.vertexShader.setAttributeLocations(gl, this.program);
        this.vertexShader.setUniformLocations(gl, this.program);

        if (config.samplers) {
            for (let i = 0; i < config.samplers.length; i++) {
                this.fragmentShader.addUniform(
                    new UniformSampler(gl, i, config.samplers[i])
                );
            }
        }
        
        if (config.depth) {
            this._depth = true;
        }
    }

    attachShaders(gl) {
        gl.attachShader(this.program, this.vertexShader.id);
        gl.attachShader(this.program, this.fragmentShader.id);
    }

    linkAndUseProgram(gl) {
        gl.linkProgram(this.program);
        gl.useProgram(this.program);
        this.vertexShader.setAttributeLocations();
        this.fragmentShader.setAttributeLocations();
    }

    set model(model) {
        this.vertexShader.uniforms.model.value = model;
    }

    set view(view) {
        this.vertexShader.uniforms.view.value = view;
    }

    set projection(projection) {
        this.vertexShader.uniforms.projection.value = projection;
    }
    
    setViewport(width, height) {
        this.viewport[2] = width;
        this.viewport[3] = height;
    }

    setFragmentShaderUniform(gl, name, type, value) {
        if (this.fragmentShader.uniforms.hasOwnProperty(name)) {
            this.fragmentShader.uniforms[name].value = value;
            return;
        } 
        switch (type) {

            // float types

            case 'float': {
                const uniformFloat = new UniformFloat(name, value);
                uniformFloat.location = gl.getUniformLocation(this.program, name);
                this.fragmentShader.addUniform(uniformFloat);
            } break;
            case 'vec2': {
                const vec2 = new UniformVec2f(name, value);
                vec2.location = gl.getUniformLocation(this.program, name);
                this.fragmentShader.addUniform(vec2);
            } break;
            case 'vec3': {
                const vec3 = new UniformVec3f(name, value);
                vec3.location = gl.getUniformLocation(this.program, name);
                this.fragmentShader.addUniform(vec3);
            } break;
            case 'vec4': {
                const vec4 = new UniformVec4f(name, value);
                vec4.location = gl.getUniformLocation(this.program, name);
                this.fragmentShader.addUniform(vec4);
            } break;
            
            // int types

            case 'int': {
                const uniformFloat = new UniformInt(name, value);
                uniformFloat.location = gl.getUniformLocation(this.program, name);
                this.fragmentShader.addUniform(uniformFloat);
            } break;
            case 'vec2i': {
                const vec2 = new UniformVec2i(name, value);
                vec2.location = gl.getUniformLocation(this.program, name);
                this.fragmentShader.addUniform(vec2);
            } break;
            case 'vec3i': {
                const vec3 = new UniformVec3i(name, value);
                vec3.location = gl.getUniformLocation(this.program, name);
                this.fragmentShader.addUniform(vec3);
            } break;
            case 'vec4i': {
                const vec4 = new UniformVec4i(name, value);
                vec4.location = gl.getUniformLocation(this.program, name);
                this.fragmentShader.addUniform(vec4);
            } break;
        }
    }
    
    beforeDraw(gl) { 
        // Implement me in child class. If needed.
    }

    draw(gl, mesh) {
        
        this.beforeDraw(gl);
        this.vertexShader.setVbos(mesh);

        gl.viewport.apply(gl, this.viewport);
        gl.useProgram(this.program);
        
        if (this._depth) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }

        for (let name in this.vertexShader.uniforms) {
            this.vertexShader.uniforms[name].use(gl);
        }

        for (let name in this.fragmentShader.uniforms)  {
            this.fragmentShader.uniforms[name].use(gl);
        }

        for (let name in this.vertexShader.vertexBuffers) {
            this.vertexShader.vertexBuffers[name].bindAndBuffer(gl);
        }

        this.vertexShader.elementArrayBuffer.bindAndBuffer(gl);

        gl.drawElements(gl.TRIANGLES, this.vertexShader.elementArrayBuffer.data.vbo.length, gl.UNSIGNED_SHORT, 0);
        this.afterDraw(gl);

    }
    
    afterDraw(gl) { 
        // Implement me in child class. If needed.
    }
}


//

class Uniform {

    constructor(name, value) { 
        this.name = name; 
        this.value = value;
        this.location = null
    }

    use(gl) {
        // Implement me in child class.
    }
}

class UniformFloat extends Uniform {

    constructor(name, value) {
        super(name, value);
    }

    use(gl) {
        gl.uniform1f(this.location, this.value);
    }

}

class UniformVec2f extends Uniform {

    constructor(name, value) {
        super(name, value);
    }

    use(gl) {
        gl.uniform2fv(this.location, this.value);
    }

}

class UniformVec3f extends Uniform {

    constructor(name, value) {
        super(name, value);
    }
    
    use(gl) {
        gl.uniform3fv(this.location, this.value);
    }
    
}

class UniformVec4f extends Uniform {

    constructor(name, value) {
        super(name, value);
    }
    
    use(gl) {
        gl.uniform4fv(this.location, this.value);
    }
    
}

class UniformMat4 extends Uniform {

    constructor(name, value) {
        super(name, value);
    }

    use(gl) {
        gl.uniformMatrix4fv(this.location, false, this.value);
    }

}

class UniformInt extends Uniform {

    constructor(name, value) {
        super(name, value);
    }

    use(gl) {
        gl.uniform1i(this.location, this.value);
    }

}

class UniformVec2i extends Uniform {

    constructor(name, value) {
        super(name, value);
    }

    use(gl) {
        gl.uniform2iv(this.location, this.value);
    }

}

class UniformVec3i extends Uniform {

    constructor(name, value) {
        super(name, value);
    }
    
    use(gl) {
        gl.uniform3iv(this.location, this.value);
    }
    
}

class UniformVec4i extends Uniform {

    constructor(name, value) {
        super(name, value);
    }
    
    use(gl) {
        gl.uniform4iv(this.location, this.value);
    }
    
}

class UniformSampler extends Uniform {

    constructor(gl, unit, sampler) {
        super(sampler.name, null);
        this.unit = unit;
        const glUnit = gl['TEXTURE'+unit];
        this.texture = new Texture(gl, glUnit, sampler.src);
    }

    use(gl) {
        gl.activeTexture(this.texture.unit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture.id);
    }
}


// Helpers
