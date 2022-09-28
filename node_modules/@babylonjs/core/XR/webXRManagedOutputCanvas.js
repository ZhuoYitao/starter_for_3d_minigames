import { __awaiter, __generator } from "tslib";
import { Observable } from "../Misc/observable.js";
import { Tools } from "../Misc/tools.js";
import { WebXRWebGLLayerWrapper } from "./webXRWebGLLayer.js";
/**
 * Configuration object for WebXR output canvas
 */
var WebXRManagedOutputCanvasOptions = /** @class */ (function () {
    function WebXRManagedOutputCanvasOptions() {
    }
    /**
     * Get the default values of the configuration object
     * @param engine defines the engine to use (can be null)
     * @returns default values of this configuration object
     */
    WebXRManagedOutputCanvasOptions.GetDefaults = function (engine) {
        var defaults = new WebXRManagedOutputCanvasOptions();
        defaults.canvasOptions = {
            antialias: true,
            depth: true,
            stencil: engine ? engine.isStencilEnable : true,
            alpha: true,
            multiview: false,
            framebufferScaleFactor: 1,
        };
        defaults.newCanvasCssStyle = "position:absolute; bottom:0px;right:0px;z-index:10;width:90%;height:100%;background-color: #000000;";
        return defaults;
    };
    return WebXRManagedOutputCanvasOptions;
}());
export { WebXRManagedOutputCanvasOptions };
/**
 * Creates a canvas that is added/removed from the webpage when entering/exiting XR
 */
var WebXRManagedOutputCanvas = /** @class */ (function () {
    /**
     * Initializes the canvas to be added/removed upon entering/exiting xr
     * @param _xrSessionManager The XR Session manager
     * @param _options optional configuration for this canvas output. defaults will be used if not provided
     */
    function WebXRManagedOutputCanvas(_xrSessionManager, _options) {
        if (_options === void 0) { _options = WebXRManagedOutputCanvasOptions.GetDefaults(); }
        var _this = this;
        this._options = _options;
        this._canvas = null;
        this._engine = null;
        /**
         * xr layer for the canvas
         */
        this.xrLayer = null;
        this._xrLayerWrapper = null;
        /**
         * Observers registered here will be triggered when the xr layer was initialized
         */
        this.onXRLayerInitObservable = new Observable();
        this._engine = _xrSessionManager.scene.getEngine();
        this._engine.onDisposeObservable.addOnce(function () {
            _this._engine = null;
        });
        if (!_options.canvasElement) {
            var canvas = document.createElement("canvas");
            canvas.style.cssText = this._options.newCanvasCssStyle || "position:absolute; bottom:0px;right:0px;";
            this._setManagedOutputCanvas(canvas);
        }
        else {
            this._setManagedOutputCanvas(_options.canvasElement);
        }
        _xrSessionManager.onXRSessionInit.add(function () {
            _this._addCanvas();
        });
        _xrSessionManager.onXRSessionEnded.add(function () {
            _this._removeCanvas();
        });
    }
    /**
     * Disposes of the object
     */
    WebXRManagedOutputCanvas.prototype.dispose = function () {
        this._removeCanvas();
        this._setManagedOutputCanvas(null);
    };
    /**
     * Initializes a XRWebGLLayer to be used as the session's baseLayer.
     * @param xrSession xr session
     * @returns a promise that will resolve once the XR Layer has been created
     */
    WebXRManagedOutputCanvas.prototype.initializeXRLayerAsync = function (xrSession) {
        return __awaiter(this, void 0, void 0, function () {
            var createLayer;
            var _this = this;
            return __generator(this, function (_a) {
                createLayer = function () {
                    _this.xrLayer = new XRWebGLLayer(xrSession, _this.canvasContext, _this._options.canvasOptions);
                    _this._xrLayerWrapper = new WebXRWebGLLayerWrapper(_this.xrLayer);
                    _this.onXRLayerInitObservable.notifyObservers(_this.xrLayer);
                    return _this.xrLayer;
                };
                // support canvases without makeXRCompatible
                if (!this.canvasContext.makeXRCompatible) {
                    return [2 /*return*/, Promise.resolve(createLayer())];
                }
                return [2 /*return*/, this.canvasContext
                        .makeXRCompatible()
                        .then(
                    // catch any error and continue. When using the emulator is throws this error for no apparent reason.
                    function () { }, function () {
                        // log the error, continue nonetheless!
                        Tools.Warn("Error executing makeXRCompatible. This does not mean that the session will work incorrectly.");
                    })
                        .then(function () {
                        return createLayer();
                    })];
            });
        });
    };
    WebXRManagedOutputCanvas.prototype._addCanvas = function () {
        var _this = this;
        if (this._canvas && this._engine && this._canvas !== this._engine.getRenderingCanvas()) {
            document.body.appendChild(this._canvas);
        }
        if (this.xrLayer) {
            this._setCanvasSize(true);
        }
        else {
            this.onXRLayerInitObservable.addOnce(function () {
                _this._setCanvasSize(true);
            });
        }
    };
    WebXRManagedOutputCanvas.prototype._removeCanvas = function () {
        if (this._canvas && this._engine && document.body.contains(this._canvas) && this._canvas !== this._engine.getRenderingCanvas()) {
            document.body.removeChild(this._canvas);
        }
        this._setCanvasSize(false);
    };
    WebXRManagedOutputCanvas.prototype._setCanvasSize = function (init, xrLayer) {
        if (init === void 0) { init = true; }
        if (xrLayer === void 0) { xrLayer = this._xrLayerWrapper; }
        if (!this._canvas || !this._engine) {
            return;
        }
        if (init) {
            if (xrLayer) {
                if (this._canvas !== this._engine.getRenderingCanvas()) {
                    this._canvas.style.width = xrLayer.getWidth() + "px";
                    this._canvas.style.height = xrLayer.getHeight() + "px";
                }
                else {
                    this._engine.setSize(xrLayer.getWidth(), xrLayer.getHeight());
                }
            }
        }
        else {
            if (this._originalCanvasSize) {
                if (this._canvas !== this._engine.getRenderingCanvas()) {
                    this._canvas.style.width = this._originalCanvasSize.width + "px";
                    this._canvas.style.height = this._originalCanvasSize.height + "px";
                }
                else {
                    this._engine.setSize(this._originalCanvasSize.width, this._originalCanvasSize.height);
                }
            }
        }
    };
    WebXRManagedOutputCanvas.prototype._setManagedOutputCanvas = function (canvas) {
        this._removeCanvas();
        if (!canvas) {
            this._canvas = null;
            this.canvasContext = null;
        }
        else {
            this._originalCanvasSize = {
                width: canvas.offsetWidth,
                height: canvas.offsetHeight,
            };
            this._canvas = canvas;
            this.canvasContext = this._canvas.getContext("webgl2");
            if (!this.canvasContext) {
                this.canvasContext = this._canvas.getContext("webgl");
            }
        }
    };
    return WebXRManagedOutputCanvas;
}());
export { WebXRManagedOutputCanvas };
//# sourceMappingURL=webXRManagedOutputCanvas.js.map