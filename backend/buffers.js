class Attribute {
    constructor(name) { 
        this.name = name; 
        this.location = null
    }
}

class Buffer {
    constructor(gl) {
        this.id = gl.createBuffer();
        this.data = {vbo: []};
    }
}

export class VertexBuffer extends Buffer {

    constructor(gl, attribute, numElements) {
        super(gl);
        this.attribute = new Attribute(attribute);
        this.numElements = numElements;
    }

    bindAndBuffer(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.id);
        gl.bufferData(gl.ARRAY_BUFFER, this.data.vbo, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.attribute.location, this.numElements, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribute.location);
    }
}

export class ElementArrayBuffer extends Buffer {

    constructor(gl) {
        super(gl);
    }

    bindAndBuffer(gl) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.id);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data.vbo, gl.STATIC_DRAW);
    }

}
