import { __awaiter, __extends, __generator } from "tslib";
import { Tools } from "../../Misc/tools.js";
import { WebXRFeatureName, WebXRFeaturesManager } from "../webXRFeaturesManager.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
/**
 * DOM Overlay Feature
 *
 * @since 5.0.0
 */
var WebXRDomOverlay = /** @class */ (function (_super) {
    __extends(WebXRDomOverlay, _super);
    /**
     * Creates a new instance of the dom-overlay feature
     * @param _xrSessionManager an instance of WebXRSessionManager
     * @param options options to use when constructing this feature
     */
    function WebXRDomOverlay(_xrSessionManager, 
    /**
     * options to use when constructing this feature
     */
    options) {
        var _this = _super.call(this, _xrSessionManager) || this;
        _this.options = options;
        /**
         * Type of overlay - non-null when available
         */
        _this._domOverlayType = null;
        /**
         * Event Listener to supress "beforexrselect" events.
         */
        _this._beforeXRSelectListener = null;
        /**
         * Element used for overlay
         */
        _this._element = null;
        _this.xrNativeFeatureName = "dom-overlay";
        // https://immersive-web.github.io/dom-overlays/
        Tools.Warn("dom-overlay is an experimental and unstable feature.");
        return _this;
    }
    /**
     * attach this feature
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRDomOverlay.prototype.attach = function () {
        if (!_super.prototype.attach.call(this)) {
            return false;
        }
        // Feature not available
        if (!this._xrSessionManager.session.domOverlayState || this._xrSessionManager.session.domOverlayState.type === null) {
            return false;
        }
        this._domOverlayType = this._xrSessionManager.session.domOverlayState.type;
        if (this._element !== null && this.options.supressXRSelectEvents === true) {
            this._beforeXRSelectListener = function (ev) {
                ev.preventDefault();
            };
            this._element.addEventListener("beforexrselect", this._beforeXRSelectListener);
        }
        return true;
    };
    Object.defineProperty(WebXRDomOverlay.prototype, "domOverlayType", {
        /**
         * The type of DOM overlay (null when not supported).  Provided by UA and remains unchanged for duration of session.
         */
        get: function () {
            return this._domOverlayType;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Dispose this feature and all of the resources attached
     */
    WebXRDomOverlay.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this._element !== null && this._beforeXRSelectListener) {
            this._element.removeEventListener("beforexrselect", this._beforeXRSelectListener);
        }
    };
    WebXRDomOverlay.prototype._onXRFrame = function (_xrFrame) {
        /* empty */
    };
    /**
     * Extends the session init object if needed
     * @returns augmentation object for the xr session init object.
     */
    WebXRDomOverlay.prototype.getXRSessionInitExtension = function () {
        return __awaiter(this, void 0, void 0, function () {
            var selectedElement;
            return __generator(this, function (_a) {
                if (this.options.element === undefined) {
                    Tools.Warn('"element" option must be provided to attach xr-dom-overlay feature.');
                    return [2 /*return*/, {}];
                }
                else if (typeof this.options.element === "string") {
                    selectedElement = document.querySelector(this.options.element);
                    if (selectedElement === null) {
                        Tools.Warn("element not found '".concat(this.options.element, "' (not requesting xr-dom-overlay)"));
                        return [2 /*return*/, {}];
                    }
                    this._element = selectedElement;
                }
                else {
                    this._element = this.options.element;
                }
                return [2 /*return*/, {
                        domOverlay: {
                            root: this._element,
                        },
                    }];
            });
        });
    };
    /**
     * The module's name
     */
    WebXRDomOverlay.Name = WebXRFeatureName.DOM_OVERLAY;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRDomOverlay.Version = 1;
    return WebXRDomOverlay;
}(WebXRAbstractFeature));
export { WebXRDomOverlay };
//register the plugin
WebXRFeaturesManager.AddWebXRFeature(WebXRDomOverlay.Name, function (xrSessionManager, options) {
    return function () { return new WebXRDomOverlay(xrSessionManager, options); };
}, WebXRDomOverlay.Version, false);
//# sourceMappingURL=WebXRDOMOverlay.js.map