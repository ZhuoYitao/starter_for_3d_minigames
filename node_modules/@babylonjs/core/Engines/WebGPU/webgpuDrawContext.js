import * as WebGPUConstants from "./webgpuConstants.js";
/** @hidden */
var WebGPUDrawContext = /** @class */ (function () {
    function WebGPUDrawContext(bufferManager) {
        this._bufferManager = bufferManager;
        this.uniqueId = WebGPUDrawContext._Counter++;
        this._useInstancing = false;
        this._currentInstanceCount = 0;
        this.reset();
    }
    WebGPUDrawContext.prototype.isDirty = function (materialContextUpdateId) {
        return this._isDirty || this._materialContextUpdateId !== materialContextUpdateId;
    };
    WebGPUDrawContext.prototype.resetIsDirty = function (materialContextUpdateId) {
        this._isDirty = false;
        this._materialContextUpdateId = materialContextUpdateId;
    };
    Object.defineProperty(WebGPUDrawContext.prototype, "useInstancing", {
        get: function () {
            return this._useInstancing;
        },
        set: function (use) {
            if (this._useInstancing === use) {
                return;
            }
            if (!use) {
                if (this.indirectDrawBuffer) {
                    this._bufferManager.releaseBuffer(this.indirectDrawBuffer);
                }
                this.indirectDrawBuffer = undefined;
                this._indirectDrawData = undefined;
            }
            else {
                this.indirectDrawBuffer = this._bufferManager.createRawBuffer(40, WebGPUConstants.BufferUsage.CopyDst | WebGPUConstants.BufferUsage.Indirect);
                this._indirectDrawData = new Uint32Array(5);
                this._indirectDrawData[3] = 0;
                this._indirectDrawData[4] = 0;
            }
            this._useInstancing = use;
            this._currentInstanceCount = -1;
        },
        enumerable: false,
        configurable: true
    });
    WebGPUDrawContext.prototype.reset = function () {
        this.buffers = {};
        this._isDirty = true;
        this._materialContextUpdateId = 0;
        this.fastBundle = undefined;
        this.bindGroups = undefined;
    };
    WebGPUDrawContext.prototype.setBuffer = function (name, buffer) {
        var _a;
        this._isDirty || (this._isDirty = (buffer === null || buffer === void 0 ? void 0 : buffer.uniqueId) !== ((_a = this.buffers[name]) === null || _a === void 0 ? void 0 : _a.uniqueId));
        this.buffers[name] = buffer;
    };
    WebGPUDrawContext.prototype.setIndirectData = function (indexOrVertexCount, instanceCount, firstIndexOrVertex) {
        if (instanceCount === this._currentInstanceCount || !this.indirectDrawBuffer || !this._indirectDrawData) {
            // The current buffer is already up to date so do nothing
            // Note that we only check for instanceCount and not indexOrVertexCount nor firstIndexOrVertex because those values
            // are supposed to not change during the lifetime of a draw context
            return;
        }
        this._currentInstanceCount = instanceCount;
        this._indirectDrawData[0] = indexOrVertexCount;
        this._indirectDrawData[1] = instanceCount;
        this._indirectDrawData[2] = firstIndexOrVertex;
        this._bufferManager.setRawData(this.indirectDrawBuffer, 0, this._indirectDrawData, 0, 20);
    };
    WebGPUDrawContext.prototype.dispose = function () {
        if (this.indirectDrawBuffer) {
            this._bufferManager.releaseBuffer(this.indirectDrawBuffer);
            this.indirectDrawBuffer = undefined;
            this._indirectDrawData = undefined;
        }
        this.fastBundle = undefined;
        this.bindGroups = undefined;
        this.buffers = undefined;
    };
    WebGPUDrawContext._Counter = 0;
    return WebGPUDrawContext;
}());
export { WebGPUDrawContext };
//# sourceMappingURL=webgpuDrawContext.js.map