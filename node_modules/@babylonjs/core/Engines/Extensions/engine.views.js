import { Engine } from "../engine.js";
/**
 * Class used to define an additional view for the engine
 * @see https://doc.babylonjs.com/divingDeeper/scene/multiCanvas
 */
var EngineView = /** @class */ (function () {
    function EngineView() {
    }
    return EngineView;
}());
export { EngineView };
Object.defineProperty(Engine.prototype, "inputElement", {
    get: function () {
        return this._inputElement;
    },
    set: function (value) {
        var _a;
        if (this._inputElement !== value) {
            this._inputElement = value;
            (_a = this._onEngineViewChanged) === null || _a === void 0 ? void 0 : _a.call(this);
        }
    },
});
Engine.prototype.getInputElement = function () {
    return this.inputElement || this.getRenderingCanvas();
};
Engine.prototype.registerView = function (canvas, camera, clearBeforeCopy) {
    var _this = this;
    if (!this.views) {
        this.views = [];
    }
    for (var _i = 0, _a = this.views; _i < _a.length; _i++) {
        var view = _a[_i];
        if (view.target === canvas) {
            return view;
        }
    }
    var masterCanvas = this.getRenderingCanvas();
    if (masterCanvas) {
        canvas.width = masterCanvas.width;
        canvas.height = masterCanvas.height;
    }
    var newView = { target: canvas, camera: camera, clearBeforeCopy: clearBeforeCopy, enabled: true };
    this.views.push(newView);
    if (camera) {
        camera.onDisposeObservable.add(function () {
            _this.unRegisterView(canvas);
        });
    }
    return newView;
};
Engine.prototype.unRegisterView = function (canvas) {
    if (!this.views) {
        return this;
    }
    for (var _i = 0, _a = this.views; _i < _a.length; _i++) {
        var view = _a[_i];
        if (view.target === canvas) {
            var index = this.views.indexOf(view);
            if (index !== -1) {
                this.views.splice(index, 1);
            }
            break;
        }
    }
    return this;
};
Engine.prototype._renderViews = function () {
    if (!this.views) {
        return false;
    }
    var parent = this.getRenderingCanvas();
    if (!parent) {
        return false;
    }
    for (var _i = 0, _a = this.views; _i < _a.length; _i++) {
        var view = _a[_i];
        if (!view.enabled) {
            continue;
        }
        var canvas = view.target;
        var context_1 = canvas.getContext("2d");
        if (!context_1) {
            continue;
        }
        var camera = view.camera;
        var previewCamera = null;
        var scene = null;
        if (camera) {
            scene = camera.getScene();
            if (scene.activeCameras && scene.activeCameras.length) {
                continue;
            }
            this.activeView = view;
            previewCamera = scene.activeCamera;
            scene.activeCamera = camera;
        }
        if (view.customResize) {
            view.customResize(canvas);
        }
        else {
            // Set sizes
            var width = Math.floor(canvas.clientWidth / this._hardwareScalingLevel);
            var height = Math.floor(canvas.clientHeight / this._hardwareScalingLevel);
            var dimsChanged = width !== canvas.width || parent.width !== canvas.width || height !== canvas.height || parent.height !== canvas.height;
            if (canvas.clientWidth && canvas.clientHeight && dimsChanged) {
                canvas.width = width;
                canvas.height = height;
                this.setSize(width, height);
            }
        }
        if (!parent.width || !parent.height) {
            return false;
        }
        // Render the frame
        this._renderFrame();
        this.flushFramebuffer();
        // Copy to target
        if (view.clearBeforeCopy) {
            context_1.clearRect(0, 0, parent.width, parent.height);
        }
        context_1.drawImage(parent, 0, 0);
        // Restore
        if (previewCamera && scene) {
            scene.activeCamera = previewCamera;
        }
    }
    this.activeView = null;
    return true;
};
//# sourceMappingURL=engine.views.js.map