import { __awaiter, __generator } from "tslib";
import { Observable } from "../Misc/observable.js";
import { WebXRState } from "./webXRTypes.js";
import { Tools } from "../Misc/tools.js";
/**
 * Button which can be used to enter a different mode of XR
 */
var WebXREnterExitUIButton = /** @class */ (function () {
    /**
     * Creates a WebXREnterExitUIButton
     * @param element button element
     * @param sessionMode XR initialization session mode
     * @param referenceSpaceType the type of reference space to be used
     */
    function WebXREnterExitUIButton(
    /** button element */
    element, 
    /** XR initialization options for the button */
    sessionMode, 
    /** Reference space type */
    referenceSpaceType) {
        this.element = element;
        this.sessionMode = sessionMode;
        this.referenceSpaceType = referenceSpaceType;
    }
    /**
     * Extendable function which can be used to update the button's visuals when the state changes
     * @param activeButton the current active button in the UI
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    WebXREnterExitUIButton.prototype.update = function (activeButton) { };
    return WebXREnterExitUIButton;
}());
export { WebXREnterExitUIButton };
/**
 * Options to create the webXR UI
 */
var WebXREnterExitUIOptions = /** @class */ (function () {
    function WebXREnterExitUIOptions() {
    }
    return WebXREnterExitUIOptions;
}());
export { WebXREnterExitUIOptions };
/**
 * UI to allow the user to enter/exit XR mode
 */
var WebXREnterExitUI = /** @class */ (function () {
    /**
     * Construct a new EnterExit UI class
     *
     * @param _scene babylon scene object to use
     * @param options (read-only) version of the options passed to this UI
     */
    function WebXREnterExitUI(_scene, 
    /** version of the options passed to this UI */
    options) {
        var _this = this;
        this._scene = _scene;
        this.options = options;
        this._activeButton = null;
        this._buttons = [];
        /**
         * Fired every time the active button is changed.
         *
         * When xr is entered via a button that launches xr that button will be the callback parameter
         *
         * When exiting xr the callback parameter will be null)
         */
        this.activeButtonChangedObservable = new Observable();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._onSessionGranted = function (evt) {
            // This section is for future reference.
            // As per specs, evt.session.mode should have the supported session mode, but no browser supports it for now.
            // // check if the session granted is the same as the one requested
            // const grantedMode = (evt.session as any).mode;
            // if (grantedMode) {
            //     this._buttons.some((btn, idx) => {
            //         if (btn.sessionMode === grantedMode) {
            //             this._enterXRWithButtonIndex(idx);
            //             return true;
            //         }
            //         return false;
            //     });
            // } else
            if (_this._helper) {
                _this._enterXRWithButtonIndex(0);
            }
        };
        this.overlay = document.createElement("div");
        this.overlay.classList.add("xr-button-overlay");
        this.overlay.style.cssText = "z-index:11;position: absolute; right: 20px;bottom: 50px;";
        // prepare for session granted event
        if (!options.ignoreSessionGrantedEvent && navigator.xr) {
            navigator.xr.addEventListener("sessiongranted", this._onSessionGranted);
        }
        // if served over HTTP, warn people.
        // Hopefully the browsers will catch up
        if (typeof window !== "undefined") {
            if (window.location && window.location.protocol === "http:" && window.location.hostname !== "localhost") {
                Tools.Warn("WebXR can only be served over HTTPS");
                throw new Error("WebXR can only be served over HTTPS");
            }
        }
        if (options.customButtons) {
            this._buttons = options.customButtons;
        }
        else {
            var sessionMode = options.sessionMode || "immersive-vr";
            var referenceSpaceType = options.referenceSpaceType || "local-floor";
            var url = typeof SVGSVGElement === "undefined"
                ? "https://cdn.babylonjs.com/Assets/vrButton.png"
                : "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%222048%22%20height%3D%221152%22%20viewBox%3D%220%200%202048%201152%22%20version%3D%221.1%22%3E%3Cpath%20transform%3D%22rotate%28180%201024%2C576.0000000000001%29%22%20d%3D%22m1109%2C896q17%2C0%2030%2C-12t13%2C-30t-12.5%2C-30.5t-30.5%2C-12.5l-170%2C0q-18%2C0%20-30.5%2C12.5t-12.5%2C30.5t13%2C30t30%2C12l170%2C0zm-85%2C256q59%2C0%20132.5%2C-1.5t154.5%2C-5.5t164.5%2C-11.5t163%2C-20t150%2C-30t124.5%2C-41.5q23%2C-11%2042%2C-24t38%2C-30q27%2C-25%2041%2C-61.5t14%2C-72.5l0%2C-257q0%2C-123%20-47%2C-232t-128%2C-190t-190%2C-128t-232%2C-47l-81%2C0q-37%2C0%20-68.5%2C14t-60.5%2C34.5t-55.5%2C45t-53%2C45t-53%2C34.5t-55.5%2C14t-55.5%2C-14t-53%2C-34.5t-53%2C-45t-55.5%2C-45t-60.5%2C-34.5t-68.5%2C-14l-81%2C0q-123%2C0%20-232%2C47t-190%2C128t-128%2C190t-47%2C232l0%2C257q0%2C68%2038%2C115t97%2C73q54%2C24%20124.5%2C41.5t150%2C30t163%2C20t164.5%2C11.5t154.5%2C5.5t132.5%2C1.5zm939%2C-298q0%2C39%20-24.5%2C67t-58.5%2C42q-54%2C23%20-122%2C39.5t-143.5%2C28t-155.5%2C19t-157%2C11t-148.5%2C5t-129.5%2C1.5q-59%2C0%20-130%2C-1.5t-148%2C-5t-157%2C-11t-155.5%2C-19t-143.5%2C-28t-122%2C-39.5q-34%2C-14%20-58.5%2C-42t-24.5%2C-67l0%2C-257q0%2C-106%2040.5%2C-199t110%2C-162.5t162.5%2C-109.5t199%2C-40l81%2C0q27%2C0%2052%2C14t50%2C34.5t51%2C44.5t55.5%2C44.5t63.5%2C34.5t74%2C14t74%2C-14t63.5%2C-34.5t55.5%2C-44.5t51%2C-44.5t50%2C-34.5t52%2C-14l14%2C0q37%2C0%2070%2C0.5t64.5%2C4.5t63.5%2C12t68%2C23q71%2C30%20128.5%2C78.5t98.5%2C110t63.5%2C133.5t22.5%2C149l0%2C257z%22%20fill%3D%22white%22%20/%3E%3C/svg%3E%0A";
            var css = ".babylonVRicon { color: #868686; border-color: #868686; border-style: solid; margin-left: 10px; height: 50px; width: 80px; background-color: rgba(51,51,51,0.7); background-image: url(" +
                url +
                "); background-size: 80%; background-repeat:no-repeat; background-position: center; border: none; outline: none; transition: transform 0.125s ease-out } .babylonVRicon:hover { transform: scale(1.05) } .babylonVRicon:active {background-color: rgba(51,51,51,1) } .babylonVRicon:focus {background-color: rgba(51,51,51,1) }";
            css += '.babylonVRicon.vrdisplaypresenting { background-image: none;} .vrdisplaypresenting::after { content: "EXIT"} .xr-error::after { content: "ERROR"}';
            var style = document.createElement("style");
            style.appendChild(document.createTextNode(css));
            document.getElementsByTagName("head")[0].appendChild(style);
            var hmdBtn_1 = document.createElement("button");
            hmdBtn_1.className = "babylonVRicon";
            hmdBtn_1.title = "".concat(sessionMode, " - ").concat(referenceSpaceType);
            this._buttons.push(new WebXREnterExitUIButton(hmdBtn_1, sessionMode, referenceSpaceType));
            this._buttons[this._buttons.length - 1].update = function (activeButton) {
                this.element.style.display = activeButton === null || activeButton === this ? "" : "none";
                hmdBtn_1.className = "babylonVRicon" + (activeButton === this ? " vrdisplaypresenting" : "");
            };
            this._updateButtons(null);
        }
        var renderCanvas = _scene.getEngine().getInputElement();
        if (renderCanvas && renderCanvas.parentNode) {
            renderCanvas.parentNode.appendChild(this.overlay);
            _scene.onDisposeObservable.addOnce(function () {
                _this.dispose();
            });
        }
    }
    /**
     * Set the helper to be used with this UI component.
     * The UI is bound to an experience helper. If not provided the UI can still be used but the events should be registered by the developer.
     *
     * @param helper the experience helper to attach
     * @param renderTarget an optional render target (in case it is created outside of the helper scope)
     * @returns a promise that resolves when the ui is ready
     */
    WebXREnterExitUI.prototype.setHelperAsync = function (helper, renderTarget) {
        return __awaiter(this, void 0, void 0, function () {
            var supportedPromises, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._helper = helper;
                        this._renderTarget = renderTarget;
                        supportedPromises = this._buttons.map(function (btn) {
                            return helper.sessionManager.isSessionSupportedAsync(btn.sessionMode);
                        });
                        helper.onStateChangedObservable.add(function (state) {
                            if (state == WebXRState.NOT_IN_XR) {
                                _this._updateButtons(null);
                            }
                        });
                        return [4 /*yield*/, Promise.all(supportedPromises)];
                    case 1:
                        results = _a.sent();
                        results.forEach(function (supported, i) {
                            if (supported) {
                                _this.overlay.appendChild(_this._buttons[i].element);
                                _this._buttons[i].element.onclick = _this._enterXRWithButtonIndex.bind(_this, i);
                            }
                            else {
                                Tools.Warn("Session mode \"".concat(_this._buttons[i].sessionMode, "\" not supported in browser"));
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates UI to allow the user to enter/exit XR mode
     * @param scene the scene to add the ui to
     * @param helper the xr experience helper to enter/exit xr with
     * @param options options to configure the UI
     * @returns the created ui
     */
    WebXREnterExitUI.CreateAsync = function (scene, helper, options) {
        return __awaiter(this, void 0, void 0, function () {
            var ui;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ui = new WebXREnterExitUI(scene, options);
                        return [4 /*yield*/, ui.setHelperAsync(helper, options.renderTarget || undefined)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, ui];
                }
            });
        });
    };
    WebXREnterExitUI.prototype._enterXRWithButtonIndex = function (idx) {
        if (idx === void 0) { idx = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var e_1, element, prevTitle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this._helper.state == WebXRState.IN_XR)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._helper.exitXRAsync()];
                    case 1:
                        _a.sent();
                        this._updateButtons(null);
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(this._helper.state == WebXRState.NOT_IN_XR)) return [3 /*break*/, 6];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._helper.enterXRAsync(this._buttons[idx].sessionMode, this._buttons[idx].referenceSpaceType, this._renderTarget, {
                                optionalFeatures: this.options.optionalFeatures,
                                requiredFeatures: this.options.requiredFeatures,
                            })];
                    case 4:
                        _a.sent();
                        this._updateButtons(this._buttons[idx]);
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        // make sure button is visible
                        this._updateButtons(null);
                        element = this._buttons[idx].element;
                        prevTitle = element.title;
                        element.title = "Error entering XR session : " + prevTitle;
                        element.classList.add("xr-error");
                        if (this.options.onError) {
                            this.options.onError(e_1);
                        }
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Disposes of the XR UI component
     */
    WebXREnterExitUI.prototype.dispose = function () {
        var renderCanvas = this._scene.getEngine().getInputElement();
        if (renderCanvas && renderCanvas.parentNode && renderCanvas.parentNode.contains(this.overlay)) {
            renderCanvas.parentNode.removeChild(this.overlay);
        }
        this.activeButtonChangedObservable.clear();
        navigator.xr.removeEventListener("sessiongranted", this._onSessionGranted);
    };
    WebXREnterExitUI.prototype._updateButtons = function (activeButton) {
        var _this = this;
        this._activeButton = activeButton;
        this._buttons.forEach(function (b) {
            b.update(_this._activeButton);
        });
        this.activeButtonChangedObservable.notifyObservers(this._activeButton);
    };
    return WebXREnterExitUI;
}());
export { WebXREnterExitUI };
//# sourceMappingURL=webXREnterExitUI.js.map