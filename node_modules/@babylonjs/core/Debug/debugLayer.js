import { __assign } from "tslib";
import { Tools } from "../Misc/tools.js";
import { Observable } from "../Misc/observable.js";
import { Scene } from "../scene.js";
import { Engine } from "../Engines/engine.js";
import { EngineStore } from "../Engines/engineStore.js";
Object.defineProperty(Scene.prototype, "debugLayer", {
    get: function () {
        if (!this._debugLayer) {
            this._debugLayer = new DebugLayer(this);
        }
        return this._debugLayer;
    },
    enumerable: true,
    configurable: true,
});
/**
 * Enum of inspector action tab
 */
export var DebugLayerTab;
(function (DebugLayerTab) {
    /**
     * Properties tag (default)
     */
    DebugLayerTab[DebugLayerTab["Properties"] = 0] = "Properties";
    /**
     * Debug tab
     */
    DebugLayerTab[DebugLayerTab["Debug"] = 1] = "Debug";
    /**
     * Statistics tab
     */
    DebugLayerTab[DebugLayerTab["Statistics"] = 2] = "Statistics";
    /**
     * Tools tab
     */
    DebugLayerTab[DebugLayerTab["Tools"] = 3] = "Tools";
    /**
     * Settings tab
     */
    DebugLayerTab[DebugLayerTab["Settings"] = 4] = "Settings";
})(DebugLayerTab || (DebugLayerTab = {}));
/**
 * The debug layer (aka Inspector) is the go to tool in order to better understand
 * what is happening in your scene
 * @see https://doc.babylonjs.com/features/playground_debuglayer
 */
var DebugLayer = /** @class */ (function () {
    /**
     * Instantiates a new debug layer.
     * The debug layer (aka Inspector) is the go to tool in order to better understand
     * what is happening in your scene
     * @see https://doc.babylonjs.com/features/playground_debuglayer
     * @param scene Defines the scene to inspect
     */
    function DebugLayer(scene) {
        var _this = this;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        this.BJSINSPECTOR = this._getGlobalInspector();
        this._scene = scene || EngineStore.LastCreatedScene;
        if (!this._scene) {
            return;
        }
        this._scene.onDisposeObservable.add(function () {
            // Debug layer
            if (_this._scene._debugLayer) {
                _this._scene._debugLayer.hide();
            }
        });
    }
    Object.defineProperty(DebugLayer.prototype, "onPropertyChangedObservable", {
        /**
         * Observable triggered when a property is changed through the inspector.
         */
        get: function () {
            if (this.BJSINSPECTOR && this.BJSINSPECTOR.Inspector) {
                return this.BJSINSPECTOR.Inspector.OnPropertyChangedObservable;
            }
            if (!this._onPropertyChangedObservable) {
                this._onPropertyChangedObservable = new Observable();
            }
            return this._onPropertyChangedObservable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DebugLayer.prototype, "onSelectionChangedObservable", {
        /**
         * Observable triggered when the selection is changed through the inspector.
         */
        get: function () {
            if (this.BJSINSPECTOR && this.BJSINSPECTOR.Inspector) {
                return this.BJSINSPECTOR.Inspector.OnSelectionChangeObservable;
            }
            if (!this._onSelectionChangedObservable) {
                this._onSelectionChangedObservable = new Observable();
            }
            return this._onSelectionChangedObservable;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates the inspector window.
     * @param config
     */
    DebugLayer.prototype._createInspector = function (config) {
        if (this.isVisible()) {
            return;
        }
        if (this._onPropertyChangedObservable) {
            for (var _i = 0, _a = this._onPropertyChangedObservable.observers; _i < _a.length; _i++) {
                var observer = _a[_i];
                this.BJSINSPECTOR.Inspector.OnPropertyChangedObservable.add(observer);
            }
            this._onPropertyChangedObservable.clear();
            this._onPropertyChangedObservable = undefined;
        }
        if (this._onSelectionChangedObservable) {
            for (var _b = 0, _c = this._onSelectionChangedObservable.observers; _b < _c.length; _b++) {
                var observer = _c[_b];
                this.BJSINSPECTOR.Inspector.OnSelectionChangedObservable.add(observer);
            }
            this._onSelectionChangedObservable.clear();
            this._onSelectionChangedObservable = undefined;
        }
        var userOptions = __assign({ overlay: false, showExplorer: true, showInspector: true, embedMode: false, handleResize: true, enablePopup: true }, config);
        this.BJSINSPECTOR = this.BJSINSPECTOR || this._getGlobalInspector();
        this.BJSINSPECTOR.Inspector.Show(this._scene, userOptions);
    };
    /**
     * Select a specific entity in the scene explorer and highlight a specific block in that entity property grid
     * @param entity defines the entity to select
     * @param lineContainerTitles defines the specific blocks to highlight (could be a string or an array of strings)
     */
    DebugLayer.prototype.select = function (entity, lineContainerTitles) {
        if (this.BJSINSPECTOR) {
            if (lineContainerTitles) {
                if (Object.prototype.toString.call(lineContainerTitles) == "[object String]") {
                    this.BJSINSPECTOR.Inspector.MarkLineContainerTitleForHighlighting(lineContainerTitles);
                }
                else {
                    this.BJSINSPECTOR.Inspector.MarkMultipleLineContainerTitlesForHighlighting(lineContainerTitles);
                }
            }
            this.BJSINSPECTOR.Inspector.OnSelectionChangeObservable.notifyObservers(entity);
        }
    };
    /** Get the inspector from bundle or global */
    DebugLayer.prototype._getGlobalInspector = function () {
        // UMD Global name detection from Webpack Bundle UMD Name.
        if (typeof INSPECTOR !== "undefined") {
            return INSPECTOR;
        }
        // In case of module let s check the global emitted from the Inspector entry point.
        if (typeof BABYLON !== "undefined" && typeof BABYLON.Inspector !== "undefined") {
            return BABYLON;
        }
        return undefined;
    };
    /**
     * Get if the inspector is visible or not.
     * @returns true if visible otherwise, false
     */
    DebugLayer.prototype.isVisible = function () {
        return this.BJSINSPECTOR && this.BJSINSPECTOR.Inspector.IsVisible;
    };
    /**
     * Hide the inspector and close its window.
     */
    DebugLayer.prototype.hide = function () {
        if (this.BJSINSPECTOR) {
            this.BJSINSPECTOR.Inspector.Hide();
        }
    };
    /**
     * Update the scene in the inspector
     */
    DebugLayer.prototype.setAsActiveScene = function () {
        if (this.BJSINSPECTOR) {
            this.BJSINSPECTOR.Inspector._SetNewScene(this._scene);
        }
    };
    /**
     * Launch the debugLayer.
     * @param config Define the configuration of the inspector
     * @return a promise fulfilled when the debug layer is visible
     */
    DebugLayer.prototype.show = function (config) {
        var _this = this;
        return new Promise(function (resolve) {
            if (typeof _this.BJSINSPECTOR == "undefined") {
                var inspectorUrl = config && config.inspectorURL ? config.inspectorURL : DebugLayer.InspectorURL;
                // Load inspector and add it to the DOM
                Tools.LoadScript(inspectorUrl, function () {
                    _this._createInspector(config);
                    resolve(_this);
                });
            }
            else {
                // Otherwise creates the inspector
                _this._createInspector(config);
                resolve(_this);
            }
        });
    };
    /**
     * Define the url to get the inspector script from.
     * By default it uses the babylonjs CDN.
     * @ignoreNaming
     */
    DebugLayer.InspectorURL = "https://unpkg.com/babylonjs-inspector@".concat(Engine.Version, "/babylon.inspector.bundle.js");
    return DebugLayer;
}());
export { DebugLayer };
//# sourceMappingURL=debugLayer.js.map