import { WebGPUEngine } from "../../webgpuEngine.js";
import * as WebGPUConstants from "../webgpuConstants.js";
WebGPUEngine.prototype.createUniformBuffer = function (elements) {
    var view;
    if (elements instanceof Array) {
        view = new Float32Array(elements);
    }
    else {
        view = elements;
    }
    var dataBuffer = this._bufferManager.createBuffer(view, WebGPUConstants.BufferUsage.Uniform | WebGPUConstants.BufferUsage.CopyDst);
    return dataBuffer;
};
WebGPUEngine.prototype.createDynamicUniformBuffer = function (elements) {
    return this.createUniformBuffer(elements);
};
WebGPUEngine.prototype.updateUniformBuffer = function (uniformBuffer, elements, offset, count) {
    if (offset === undefined) {
        offset = 0;
    }
    var dataBuffer = uniformBuffer;
    var view;
    if (count === undefined) {
        if (elements instanceof Float32Array) {
            view = elements;
        }
        else {
            view = new Float32Array(elements);
        }
        count = view.byteLength;
    }
    else {
        if (elements instanceof Float32Array) {
            view = elements;
        }
        else {
            view = new Float32Array(elements);
        }
    }
    this._bufferManager.setSubData(dataBuffer, offset, view, 0, count);
};
WebGPUEngine.prototype.bindUniformBufferBase = function (buffer, location, name) {
    this._currentDrawContext.setBuffer(name, buffer);
};
WebGPUEngine.prototype.bindUniformBlock = function () { };
//# sourceMappingURL=engine.uniformBuffer.js.map