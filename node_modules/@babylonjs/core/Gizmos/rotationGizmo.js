import { __extends } from "tslib";
import { Logger } from "../Misc/logger.js";
import { Observable } from "../Misc/observable.js";
import { Vector3 } from "../Maths/math.vector.js";
import { Color3 } from "../Maths/math.color.js";
import { Gizmo } from "./gizmo.js";
import { PlaneRotationGizmo } from "./planeRotationGizmo.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
/**
 * Gizmo that enables rotating a mesh along 3 axis
 */
var RotationGizmo = /** @class */ (function (_super) {
    __extends(RotationGizmo, _super);
    /**
     * Creates a RotationGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param tessellation Amount of tessellation to be used when creating rotation circles
     * @param useEulerRotation Use and update Euler angle instead of quaternion
     * @param thickness display gizmo axis thickness
     * @param gizmoManager Gizmo manager
     * @param options More options
     */
    function RotationGizmo(gizmoLayer, tessellation, useEulerRotation, thickness, gizmoManager, options) {
        if (gizmoLayer === void 0) { gizmoLayer = UtilityLayerRenderer.DefaultUtilityLayer; }
        if (tessellation === void 0) { tessellation = 32; }
        if (useEulerRotation === void 0) { useEulerRotation = false; }
        if (thickness === void 0) { thickness = 1; }
        var _this = _super.call(this, gizmoLayer) || this;
        /** Fires an event when any of it's sub gizmos are dragged */
        _this.onDragStartObservable = new Observable();
        /** Fires an event when any of it's sub gizmos are released from dragging */
        _this.onDragEndObservable = new Observable();
        _this._observables = [];
        /** Node Caching for quick lookup */
        _this._gizmoAxisCache = new Map();
        var xColor = options && options.xOptions && options.xOptions.color ? options.xOptions.color : Color3.Red().scale(0.5);
        var yColor = options && options.yOptions && options.yOptions.color ? options.yOptions.color : Color3.Green().scale(0.5);
        var zColor = options && options.zOptions && options.zOptions.color ? options.zOptions.color : Color3.Blue().scale(0.5);
        _this.xGizmo = new PlaneRotationGizmo(new Vector3(1, 0, 0), xColor, gizmoLayer, tessellation, _this, useEulerRotation, thickness);
        _this.yGizmo = new PlaneRotationGizmo(new Vector3(0, 1, 0), yColor, gizmoLayer, tessellation, _this, useEulerRotation, thickness);
        _this.zGizmo = new PlaneRotationGizmo(new Vector3(0, 0, 1), zColor, gizmoLayer, tessellation, _this, useEulerRotation, thickness);
        // Relay drag events and set update scale
        [_this.xGizmo, _this.yGizmo, _this.zGizmo].forEach(function (gizmo) {
            //must set updateScale on each gizmo, as setting it on root RotationGizmo doesnt prevent individual gizmos from updating
            //currently updateScale is a property with no getter/setter, so no good way to override behavior at runtime, so we will at least set it on startup
            if (options && options.updateScale != undefined) {
                gizmo.updateScale = options.updateScale;
            }
            gizmo.dragBehavior.onDragStartObservable.add(function () {
                _this.onDragStartObservable.notifyObservers({});
            });
            gizmo.dragBehavior.onDragEndObservable.add(function () {
                _this.onDragEndObservable.notifyObservers({});
            });
        });
        _this.attachedMesh = null;
        _this.attachedNode = null;
        if (gizmoManager) {
            gizmoManager.addToAxisCache(_this._gizmoAxisCache);
        }
        else {
            // Only subscribe to pointer event if gizmoManager isnt
            Gizmo.GizmoAxisPointerObserver(gizmoLayer, _this._gizmoAxisCache);
        }
        return _this;
    }
    Object.defineProperty(RotationGizmo.prototype, "attachedMesh", {
        get: function () {
            return this._meshAttached;
        },
        set: function (mesh) {
            this._meshAttached = mesh;
            this._nodeAttached = mesh;
            this._checkBillboardTransform();
            [this.xGizmo, this.yGizmo, this.zGizmo].forEach(function (gizmo) {
                if (gizmo.isEnabled) {
                    gizmo.attachedMesh = mesh;
                }
                else {
                    gizmo.attachedMesh = null;
                }
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RotationGizmo.prototype, "attachedNode", {
        get: function () {
            return this._nodeAttached;
        },
        set: function (node) {
            this._meshAttached = null;
            this._nodeAttached = node;
            this._checkBillboardTransform();
            [this.xGizmo, this.yGizmo, this.zGizmo].forEach(function (gizmo) {
                if (gizmo.isEnabled) {
                    gizmo.attachedNode = node;
                }
                else {
                    gizmo.attachedNode = null;
                }
            });
        },
        enumerable: false,
        configurable: true
    });
    RotationGizmo.prototype._checkBillboardTransform = function () {
        if (this._nodeAttached && this._nodeAttached.billboardMode) {
            console.log("Rotation Gizmo will not work with transforms in billboard mode.");
        }
    };
    Object.defineProperty(RotationGizmo.prototype, "isHovered", {
        /**
         * True when the mouse pointer is hovering a gizmo mesh
         */
        get: function () {
            var hovered = false;
            [this.xGizmo, this.yGizmo, this.zGizmo].forEach(function (gizmo) {
                hovered = hovered || gizmo.isHovered;
            });
            return hovered;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RotationGizmo.prototype, "updateGizmoRotationToMatchAttachedMesh", {
        get: function () {
            return this.xGizmo.updateGizmoRotationToMatchAttachedMesh;
        },
        set: function (value) {
            if (this.xGizmo) {
                this.xGizmo.updateGizmoRotationToMatchAttachedMesh = value;
                this.yGizmo.updateGizmoRotationToMatchAttachedMesh = value;
                this.zGizmo.updateGizmoRotationToMatchAttachedMesh = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RotationGizmo.prototype, "snapDistance", {
        get: function () {
            return this.xGizmo.snapDistance;
        },
        /**
         * Drag distance in babylon units that the gizmo will snap to when dragged (Default: 0)
         */
        set: function (value) {
            if (this.xGizmo) {
                this.xGizmo.snapDistance = value;
                this.yGizmo.snapDistance = value;
                this.zGizmo.snapDistance = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RotationGizmo.prototype, "scaleRatio", {
        get: function () {
            return this.xGizmo.scaleRatio;
        },
        /**
         * Ratio for the scale of the gizmo (Default: 1)
         */
        set: function (value) {
            if (this.xGizmo) {
                this.xGizmo.scaleRatio = value;
                this.yGizmo.scaleRatio = value;
                this.zGizmo.scaleRatio = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Builds Gizmo Axis Cache to enable features such as hover state preservation and graying out other axis during manipulation
     * @param mesh Axis gizmo mesh
     * @param cache Gizmo axis definition used for reactive gizmo UI
     */
    RotationGizmo.prototype.addToAxisCache = function (mesh, cache) {
        this._gizmoAxisCache.set(mesh, cache);
    };
    /**
     * Disposes of the gizmo
     */
    RotationGizmo.prototype.dispose = function () {
        var _this = this;
        this.xGizmo.dispose();
        this.yGizmo.dispose();
        this.zGizmo.dispose();
        this.onDragStartObservable.clear();
        this.onDragEndObservable.clear();
        this._observables.forEach(function (obs) {
            _this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(obs);
        });
    };
    /**
     * CustomMeshes are not supported by this gizmo
     */
    RotationGizmo.prototype.setCustomMesh = function () {
        Logger.Error("Custom meshes are not supported on this gizmo, please set the custom meshes on the gizmos contained within this one (gizmo.xGizmo, gizmo.yGizmo, gizmo.zGizmo)");
    };
    return RotationGizmo;
}(Gizmo));
export { RotationGizmo };
//# sourceMappingURL=rotationGizmo.js.map