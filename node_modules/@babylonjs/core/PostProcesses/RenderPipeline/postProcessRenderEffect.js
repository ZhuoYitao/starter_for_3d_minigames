import { Tools } from "../../Misc/tools.js";
/**
 * This represents a set of one or more post processes in Babylon.
 * A post process can be used to apply a shader to a texture after it is rendered.
 * @example https://doc.babylonjs.com/how_to/how_to_use_postprocessrenderpipeline
 */
var PostProcessRenderEffect = /** @class */ (function () {
    /**
     * Instantiates a post process render effect.
     * A post process can be used to apply a shader to a texture after it is rendered.
     * @param engine The engine the effect is tied to
     * @param name The name of the effect
     * @param getPostProcesses A function that returns a set of post processes which the effect will run in order to be run.
     * @param singleInstance False if this post process can be run on multiple cameras. (default: true)
     */
    function PostProcessRenderEffect(engine, name, getPostProcesses, singleInstance) {
        this._name = name;
        this._singleInstance = singleInstance || true;
        this._getPostProcesses = getPostProcesses;
        this._cameras = {};
        this._indicesForCamera = {};
        this._postProcesses = {};
    }
    Object.defineProperty(PostProcessRenderEffect.prototype, "isSupported", {
        /**
         * Checks if all the post processes in the effect are supported.
         */
        get: function () {
            for (var index in this._postProcesses) {
                if (Object.prototype.hasOwnProperty.call(this._postProcesses, index)) {
                    var pps = this._postProcesses[index];
                    for (var ppIndex = 0; ppIndex < pps.length; ppIndex++) {
                        if (!pps[ppIndex].isSupported) {
                            return false;
                        }
                    }
                }
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Updates the current state of the effect
     * @hidden
     */
    PostProcessRenderEffect.prototype._update = function () { };
    /**
     * Attaches the effect on cameras
     * @param cameras The camera to attach to.
     * @hidden
     */
    PostProcessRenderEffect.prototype._attachCameras = function (cameras) {
        var _this = this;
        var cameraKey;
        var cams = Tools.MakeArray(cameras || this._cameras);
        if (!cams) {
            return;
        }
        var _loop_1 = function (i) {
            var camera = cams[i];
            if (!camera) {
                return "continue";
            }
            var cameraName = camera.name;
            if (this_1._singleInstance) {
                cameraKey = 0;
            }
            else {
                cameraKey = cameraName;
            }
            if (!this_1._postProcesses[cameraKey]) {
                var postProcess = this_1._getPostProcesses();
                if (postProcess) {
                    this_1._postProcesses[cameraKey] = Array.isArray(postProcess) ? postProcess : [postProcess];
                }
            }
            if (!this_1._indicesForCamera[cameraName]) {
                this_1._indicesForCamera[cameraName] = [];
            }
            this_1._postProcesses[cameraKey].forEach(function (postProcess) {
                var index = camera.attachPostProcess(postProcess);
                _this._indicesForCamera[cameraName].push(index);
            });
            if (!this_1._cameras[cameraName]) {
                this_1._cameras[cameraName] = camera;
            }
        };
        var this_1 = this;
        for (var i = 0; i < cams.length; i++) {
            _loop_1(i);
        }
    };
    /**
     * Detaches the effect on cameras
     * @param cameras The camera to detach from.
     * @hidden
     */
    PostProcessRenderEffect.prototype._detachCameras = function (cameras) {
        var cams = Tools.MakeArray(cameras || this._cameras);
        if (!cams) {
            return;
        }
        var _loop_2 = function (i) {
            var camera = cams[i];
            var cameraName = camera.name;
            var postProcesses = this_2._postProcesses[this_2._singleInstance ? 0 : cameraName];
            if (postProcesses) {
                postProcesses.forEach(function (postProcess) {
                    camera.detachPostProcess(postProcess);
                });
            }
            if (this_2._cameras[cameraName]) {
                this_2._cameras[cameraName] = null;
            }
        };
        var this_2 = this;
        for (var i = 0; i < cams.length; i++) {
            _loop_2(i);
        }
    };
    /**
     * Enables the effect on given cameras
     * @param cameras The camera to enable.
     * @hidden
     */
    PostProcessRenderEffect.prototype._enable = function (cameras) {
        var _this = this;
        var cams = Tools.MakeArray(cameras || this._cameras);
        if (!cams) {
            return;
        }
        var _loop_3 = function (i) {
            var camera = cams[i];
            var cameraName = camera.name;
            var _loop_4 = function (j) {
                if (camera._postProcesses[this_3._indicesForCamera[cameraName][j]] === undefined || camera._postProcesses[this_3._indicesForCamera[cameraName][j]] === null) {
                    this_3._postProcesses[this_3._singleInstance ? 0 : cameraName].forEach(function (postProcess) {
                        cams[i].attachPostProcess(postProcess, _this._indicesForCamera[cameraName][j]);
                    });
                }
            };
            for (var j = 0; j < this_3._indicesForCamera[cameraName].length; j++) {
                _loop_4(j);
            }
        };
        var this_3 = this;
        for (var i = 0; i < cams.length; i++) {
            _loop_3(i);
        }
    };
    /**
     * Disables the effect on the given cameras
     * @param cameras The camera to disable.
     * @hidden
     */
    PostProcessRenderEffect.prototype._disable = function (cameras) {
        var cams = Tools.MakeArray(cameras || this._cameras);
        if (!cams) {
            return;
        }
        var _loop_5 = function (i) {
            var camera = cams[i];
            var cameraName = camera.name;
            this_4._postProcesses[this_4._singleInstance ? 0 : cameraName].forEach(function (postProcess) {
                camera.detachPostProcess(postProcess);
            });
        };
        var this_4 = this;
        for (var i = 0; i < cams.length; i++) {
            _loop_5(i);
        }
    };
    /**
     * Gets a list of the post processes contained in the effect.
     * @param camera The camera to get the post processes on.
     * @returns The list of the post processes in the effect.
     */
    PostProcessRenderEffect.prototype.getPostProcesses = function (camera) {
        if (this._singleInstance) {
            return this._postProcesses[0];
        }
        else {
            if (!camera) {
                return null;
            }
            return this._postProcesses[camera.name];
        }
    };
    return PostProcessRenderEffect;
}());
export { PostProcessRenderEffect };
//# sourceMappingURL=postProcessRenderEffect.js.map