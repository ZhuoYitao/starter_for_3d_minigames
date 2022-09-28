import { WebGPUEngine } from "../../webgpuEngine.js";
WebGPUEngine.prototype.updateDynamicIndexBuffer = function (indexBuffer, indices, offset) {
    if (offset === void 0) { offset = 0; }
    var gpuBuffer = indexBuffer;
    var view;
    if (indices instanceof Uint16Array) {
        if (indexBuffer.is32Bits) {
            view = Uint32Array.from(indices);
        }
        else {
            view = indices;
        }
    }
    else if (indices instanceof Uint32Array) {
        if (indexBuffer.is32Bits) {
            view = indices;
        }
        else {
            view = Uint16Array.from(indices);
        }
    }
    else {
        if (indexBuffer.is32Bits) {
            view = new Uint32Array(indices);
        }
        else {
            view = new Uint16Array(indices);
        }
    }
    this._bufferManager.setSubData(gpuBuffer, offset, view);
};
WebGPUEngine.prototype.updateDynamicVertexBuffer = function (vertexBuffer, data, byteOffset, byteLength) {
    var dataBuffer = vertexBuffer;
    if (byteOffset === undefined) {
        byteOffset = 0;
    }
    var view;
    if (byteLength === undefined) {
        if (data instanceof Array) {
            view = new Float32Array(data);
        }
        else if (data instanceof ArrayBuffer) {
            view = new Uint8Array(data);
        }
        else {
            view = data;
        }
        byteLength = view.byteLength;
    }
    else {
        if (data instanceof Array) {
            view = new Float32Array(data);
        }
        else if (data instanceof ArrayBuffer) {
            view = new Uint8Array(data);
        }
        else {
            view = data;
        }
    }
    this._bufferManager.setSubData(dataBuffer, byteOffset, view, 0, byteLength);
};
//# sourceMappingURL=engine.dynamicBuffer.js.map