class Shader {

    constructor(gl, type, code) {
        this.id = gl.createShader(type);
        //this.uniforms = {}
        gl.shaderSource(this.id, code);
        gl.compileShader(this.id);
        this._checkCompileError(gl);
    }

    _checkCompileError(gl) {
        if (!gl.getShaderParameter(this.id, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(this.id));
        }
    }

    /*addUniform(uniform) {
        this.uniforms[uniform.name] = uniform;
    }*/

    /*setUniformLocations(gl, program) {
        for (let name in this.uniforms) {
            const uniform = this.uniforms[name];
            uniform.location = gl.getUniformLocation(program, uniform.name);
        }
    }*/

}

export class VertexShader extends Shader {

    constructor(gl, code, attributes)  { 
        super(gl, gl.VERTEX_SHADER, code); 

        this.attributes = [];
        this.vertexBuffers = {};
        this.elementArrayBuffer = null;
        this.dataMap = {};

        for (let dataKey in attributes) {
            this.dataMap[dataKey] = attributes[dataKey].name;
        }
    }

    addVertexBuffer(buffer) {
        this.attributes.push(buffer.attribute);
        this.vertexBuffers[buffer.attribute.name] = buffer;
    }

    addElementArrayBuffer(buffer) {
        this.elementArrayBuffer = buffer;
    }

    setAttributeLocations(gl, program) {
        for (let attribute of this.attributes) {
            attribute.location = gl.getAttribLocation(program, attribute.name);
        }
    }

    setVbos(mesh) {
        this.elementArrayBuffer.data = mesh.ind;
        for (let key in mesh) {
            const name = this.dataMap[key];
            if (!this.vertexBuffers.hasOwnProperty(name))
                continue;
            const data = mesh[key];
            this.vertexBuffers[name].data = data;
        }
    }

}

export class FragmentShader extends Shader {

    constructor(gl, code) {
        super(gl, gl.FRAGMENT_SHADER, code);
        this.textures = []
        this.samplers = {};
    }

    addSampler(uniformSampler) {
        this.samplers[uniformSampler.name] = uniformSampler;
    }
}
