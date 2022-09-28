import { __extends } from "tslib";
import { Logger } from "../Misc/logger.js";
import { Observable } from "../Misc/observable.js";
import { Vector3 } from "../Maths/math.vector.js";
import { Color3 } from "../Maths/math.color.js";
import { Gizmo } from "./gizmo.js";
import { AxisDragGizmo } from "./axisDragGizmo.js";
import { PlaneDragGizmo } from "./planeDragGizmo.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
/**
 * Gizmo that enables dragging a mesh along 3 axis
 */
var PositionGizmo = /** @class */ (function (_super) {
    __extends(PositionGizmo, _super);
    /**
     * Creates a PositionGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
      @param thickness display gizmo axis thickness
     * @param gizmoManager
     */
    function PositionGizmo(gizmoLayer, thickness, gizmoManager) {
        if (gizmoLayer === void 0) { gizmoLayer = UtilityLayerRenderer.DefaultUtilityLayer; }
        if (thickness === void 0) { thickness = 1; }
        var _this = _super.call(this, gizmoLayer) || this;
        /**
         * private variables
         */
        _this._meshAttached = null;
        _this._nodeAttached = null;
        _this._observables = [];
        /** Node Caching for quick lookup */
        _this._gizmoAxisCache = new Map();
        /** Fires an event when any of it's sub gizmos are dragged */
        _this.onDragStartObservable = new Observable();
        /** Fires an event when any of it's sub gizmos are released from dragging */
        _this.onDragEndObservable = new Observable();
        /**
         * If set to true, planar drag is enabled
         */
        _this._planarGizmoEnabled = false;
        _this.xGizmo = new AxisDragGizmo(new Vector3(1, 0, 0), Color3.Red().scale(0.5), gizmoLayer, _this, thickness);
        _this.yGizmo = new AxisDragGizmo(new Vector3(0, 1, 0), Color3.Green().scale(0.5), gizmoLayer, _this, thickness);
        _this.zGizmo = new AxisDragGizmo(new Vector3(0, 0, 1), Color3.Blue().scale(0.5), gizmoLayer, _this, thickness);
        _this.xPlaneGizmo = new PlaneDragGizmo(new Vector3(1, 0, 0), Color3.Red().scale(0.5), _this.gizmoLayer, _this);
        _this.yPlaneGizmo = new PlaneDragGizmo(new Vector3(0, 1, 0), Color3.Green().scale(0.5), _this.gizmoLayer, _this);
        _this.zPlaneGizmo = new PlaneDragGizmo(new Vector3(0, 0, 1), Color3.Blue().scale(0.5), _this.gizmoLayer, _this);
        // Relay drag events
        [_this.xGizmo, _this.yGizmo, _this.zGizmo, _this.xPlaneGizmo, _this.yPlaneGizmo, _this.zPlaneGizmo].forEach(function (gizmo) {
            gizmo.dragBehavior.onDragStartObservable.add(function () {
                _this.onDragStartObservable.notifyObservers({});
            });
            gizmo.dragBehavior.onDragEndObservable.add(function () {
                _this.onDragEndObservable.notifyObservers({});
            });
        });
        _this.attachedMesh = null;
        if (gizmoManager) {
            gizmoManager.addToAxisCache(_this._gizmoAxisCache);
        }
        else {
            // Only subscribe to pointer event if gizmoManager isnt
            Gizmo.GizmoAxisPointerObserver(gizmoLayer, _this._gizmoAxisCache);
        }
        return _this;
    }
    Object.defineProperty(PositionGizmo.prototype, "attachedMesh", {
        get: function () {
            return this._meshAttached;
        },
        set: function (mesh) {
            this._meshAttached = mesh;
            this._nodeAttached = mesh;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.xPlaneGizmo, this.yPlaneGizmo, this.zPlaneGizmo].forEach(function (gizmo) {
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
    Object.defineProperty(PositionGizmo.prototype, "attachedNode", {
        get: function () {
            return this._nodeAttached;
        },
        set: function (node) {
            this._meshAttached = null;
            this._nodeAttached = node;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.xPlaneGizmo, this.yPlaneGizmo, this.zPlaneGizmo].forEach(function (gizmo) {
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
    Object.defineProperty(PositionGizmo.prototype, "isHovered", {
        /**
         * True when the mouse pointer is hovering a gizmo mesh
         */
        get: function () {
            var hovered = false;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.xPlaneGizmo, this.yPlaneGizmo, this.zPlaneGizmo].forEach(function (gizmo) {
                hovered = hovered || gizmo.isHovered;
            });
            return hovered;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PositionGizmo.prototype, "planarGizmoEnabled", {
        get: function () {
            return this._planarGizmoEnabled;
        },
        /**
         * If the planar drag gizmo is enabled
         * setting this will enable/disable XY, XZ and YZ planes regardless of individual gizmo settings.
         */
        set: function (value) {
            var _this = this;
            this._planarGizmoEnabled = value;
            [this.xPlaneGizmo, this.yPlaneGizmo, this.zPlaneGizmo].forEach(function (gizmo) {
                if (gizmo) {
                    gizmo.isEnabled = value;
                    if (value) {
                        if (gizmo.attachedMesh) {
                            gizmo.attachedMesh = _this.attachedMesh;
                        }
                        else {
                            gizmo.attachedNode = _this.attachedNode;
                        }
                    }
                }
            }, this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PositionGizmo.prototype, "updateGizmoRotationToMatchAttachedMesh", {
        get: function () {
            return this._updateGizmoRotationToMatchAttachedMesh;
        },
        set: function (value) {
            this._updateGizmoRotationToMatchAttachedMesh = value;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.xPlaneGizmo, this.yPlaneGizmo, this.zPlaneGizmo].forEach(function (gizmo) {
                if (gizmo) {
                    gizmo.updateGizmoRotationToMatchAttachedMesh = value;
                }
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PositionGizmo.prototype, "snapDistance", {
        get: function () {
            return this._snapDistance;
        },
        /**
         * Drag distance in babylon units that the gizmo will snap to when dragged (Default: 0)
         */
        set: function (value) {
            this._snapDistance = value;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.xPlaneGizmo, this.yPlaneGizmo, this.zPlaneGizmo].forEach(function (gizmo) {
                if (gizmo) {
                    gizmo.snapDistance = value;
                }
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PositionGizmo.prototype, "scaleRatio", {
        get: function () {
            return this._scaleRatio;
        },
        /**
         * Ratio for the scale of the gizmo (Default: 1)
         */
        set: function (value) {
            this._scaleRatio = value;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.xPlaneGizmo, this.yPlaneGizmo, this.zPlaneGizmo].forEach(function (gizmo) {
                if (gizmo) {
                    gizmo.scaleRatio = value;
                }
            });
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Builds Gizmo Axis Cache to enable features such as hover state preservation and graying out other axis during manipulation
     * @param mesh Axis gizmo mesh
     * @param cache Gizmo axis definition used for reactive gizmo UI
     */
    PositionGizmo.prototype.addToAxisCache = function (mesh, cache) {
        this._gizmoAxisCache.set(mesh, cache);
    };
    /**
     * Disposes of the gizmo
     */
    PositionGizmo.prototype.dispose = function () {
        var _this = this;
        [this.xGizmo, this.yGizmo, this.zGizmo, this.xPlaneGizmo, this.yPlaneGizmo, this.zPlaneGizmo].forEach(function (gizmo) {
            if (gizmo) {
                gizmo.dispose();
            }
        });
        this._observables.forEach(function (obs) {
            _this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(obs);
        });
        this.onDragStartObservable.clear();
        this.onDragEndObservable.clear();
    };
    /**
     * CustomMeshes are not supported by this gizmo
     */
    PositionGizmo.prototype.setCustomMesh = function () {
        Logger.Error("Custom meshes are not supported on this gizmo, please set the custom meshes on the gizmos contained within this one (gizmo.xGizmo, gizmo.yGizmo, gizmo.zGizmo,gizmo.xPlaneGizmo, gizmo.yPlaneGizmo, gizmo.zPlaneGizmo)");
    };
    return PositionGizmo;
}(Gizmo));
export { PositionGizmo };
//# sourceMappingURL=positionGizmo.js.map