import { WebGPUEngine } from "../../webgpuEngine.js";
WebGPUEngine.prototype._debugPushGroup = function (groupName, targetObject) {
    if (!this._options.enableGPUDebugMarkers) {
        return;
    }
    if (targetObject === 0 || targetObject === 1) {
        var encoder = targetObject === 0 ? this._renderEncoder : this._renderTargetEncoder;
        encoder.pushDebugGroup(groupName);
    }
    else if (this._currentRenderPass) {
        this._currentRenderPass.pushDebugGroup(groupName);
    }
    else {
        this._pendingDebugCommands.push(["push", groupName]);
    }
};
WebGPUEngine.prototype._debugPopGroup = function (targetObject) {
    if (!this._options.enableGPUDebugMarkers) {
        return;
    }
    if (targetObject === 0 || targetObject === 1) {
        var encoder = targetObject === 0 ? this._renderEncoder : this._renderTargetEncoder;
        encoder.popDebugGroup();
    }
    else if (this._currentRenderPass) {
        this._currentRenderPass.popDebugGroup();
    }
    else {
        this._pendingDebugCommands.push(["pop", null]);
    }
};
WebGPUEngine.prototype._debugInsertMarker = function (text, targetObject) {
    if (!this._options.enableGPUDebugMarkers) {
        return;
    }
    if (targetObject === 0 || targetObject === 1) {
        var encoder = targetObject === 0 ? this._renderEncoder : this._renderTargetEncoder;
        encoder.insertDebugMarker(text);
    }
    else if (this._currentRenderPass) {
        this._currentRenderPass.insertDebugMarker(text);
    }
    else {
        this._pendingDebugCommands.push(["insert", text]);
    }
};
WebGPUEngine.prototype._debugFlushPendingCommands = function () {
    for (var i = 0; i < this._pendingDebugCommands.length; ++i) {
        var _a = this._pendingDebugCommands[i], name_1 = _a[0], param = _a[1];
        switch (name_1) {
            case "push":
                this._debugPushGroup(param);
                break;
            case "pop":
                this._debugPopGroup();
                break;
            case "insert":
                this._debugInsertMarker(param);
                break;
        }
    }
    this._pendingDebugCommands.length = 0;
};
//# sourceMappingURL=engine.debugging.js.map