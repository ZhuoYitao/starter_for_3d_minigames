import { __extends } from "tslib";
import { Logger } from "../Misc/logger.js";
import { Observable } from "../Misc/observable.js";
import { Vector3 } from "../Maths/math.vector.js";
import { Color3 } from "../Maths/math.color.js";
import { CreatePolyhedron } from "../Meshes/Builders/polyhedronBuilder.js";
import { Gizmo } from "./gizmo.js";
import { AxisScaleGizmo } from "./axisScaleGizmo.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
import { StandardMaterial } from "../Materials/standardMaterial.js";
/**
 * Gizmo that enables scaling a mesh along 3 axis
 */
var ScaleGizmo = /** @class */ (function (_super) {
    __extends(ScaleGizmo, _super);
    /**
     * Creates a ScaleGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param thickness display gizmo axis thickness
     * @param gizmoManager
     */
    function ScaleGizmo(gizmoLayer, thickness, gizmoManager) {
        if (gizmoLayer === void 0) { gizmoLayer = UtilityLayerRenderer.DefaultUtilityLayer; }
        if (thickness === void 0) { thickness = 1; }
        var _this = _super.call(this, gizmoLayer) || this;
        _this._meshAttached = null;
        _this._nodeAttached = null;
        _this._sensitivity = 1;
        _this._observables = [];
        /** Node Caching for quick lookup */
        _this._gizmoAxisCache = new Map();
        /** Fires an event when any of it's sub gizmos are dragged */
        _this.onDragStartObservable = new Observable();
        /** Fires an event when any of it's sub gizmos are released from dragging */
        _this.onDragEndObservable = new Observable();
        _this.uniformScaleGizmo = _this._createUniformScaleMesh();
        _this.xGizmo = new AxisScaleGizmo(new Vector3(1, 0, 0), Color3.Red().scale(0.5), gizmoLayer, _this, thickness);
        _this.yGizmo = new AxisScaleGizmo(new Vector3(0, 1, 0), Color3.Green().scale(0.5), gizmoLayer, _this, thickness);
        _this.zGizmo = new AxisScaleGizmo(new Vector3(0, 0, 1), Color3.Blue().scale(0.5), gizmoLayer, _this, thickness);
        // Relay drag events
        [_this.xGizmo, _this.yGizmo, _this.zGizmo, _this.uniformScaleGizmo].forEach(function (gizmo) {
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
    Object.defineProperty(ScaleGizmo.prototype, "attachedMesh", {
        get: function () {
            return this._meshAttached;
        },
        set: function (mesh) {
            this._meshAttached = mesh;
            this._nodeAttached = mesh;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.uniformScaleGizmo].forEach(function (gizmo) {
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
    Object.defineProperty(ScaleGizmo.prototype, "attachedNode", {
        get: function () {
            return this._nodeAttached;
        },
        set: function (node) {
            this._meshAttached = null;
            this._nodeAttached = node;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.uniformScaleGizmo].forEach(function (gizmo) {
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
    Object.defineProperty(ScaleGizmo.prototype, "isHovered", {
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
    /** Create Geometry for Gizmo */
    ScaleGizmo.prototype._createUniformScaleMesh = function () {
        this._coloredMaterial = new StandardMaterial("", this.gizmoLayer.utilityLayerScene);
        this._coloredMaterial.diffuseColor = Color3.Gray();
        this._hoverMaterial = new StandardMaterial("", this.gizmoLayer.utilityLayerScene);
        this._hoverMaterial.diffuseColor = Color3.Yellow();
        this._disableMaterial = new StandardMaterial("", this.gizmoLayer.utilityLayerScene);
        this._disableMaterial.diffuseColor = Color3.Gray();
        this._disableMaterial.alpha = 0.4;
        var uniformScaleGizmo = new AxisScaleGizmo(new Vector3(0, 1, 0), Color3.Gray().scale(0.5), this.gizmoLayer, this);
        uniformScaleGizmo.updateGizmoRotationToMatchAttachedMesh = false;
        uniformScaleGizmo.uniformScaling = true;
        this._uniformScalingMesh = CreatePolyhedron("uniform", { type: 1 }, uniformScaleGizmo.gizmoLayer.utilityLayerScene);
        this._uniformScalingMesh.scaling.scaleInPlace(0.01);
        this._uniformScalingMesh.visibility = 0;
        this._octahedron = CreatePolyhedron("", { type: 1 }, uniformScaleGizmo.gizmoLayer.utilityLayerScene);
        this._octahedron.scaling.scaleInPlace(0.007);
        this._uniformScalingMesh.addChild(this._octahedron);
        uniformScaleGizmo.setCustomMesh(this._uniformScalingMesh, true);
        var light = this.gizmoLayer._getSharedGizmoLight();
        light.includedOnlyMeshes = light.includedOnlyMeshes.concat(this._octahedron);
        var cache = {
            gizmoMeshes: [this._octahedron, this._uniformScalingMesh],
            colliderMeshes: [this._uniformScalingMesh],
            material: this._coloredMaterial,
            hoverMaterial: this._hoverMaterial,
            disableMaterial: this._disableMaterial,
            active: false,
            dragBehavior: uniformScaleGizmo.dragBehavior,
        };
        this.addToAxisCache(uniformScaleGizmo._rootMesh, cache);
        return uniformScaleGizmo;
    };
    Object.defineProperty(ScaleGizmo.prototype, "updateGizmoRotationToMatchAttachedMesh", {
        get: function () {
            return this._updateGizmoRotationToMatchAttachedMesh;
        },
        set: function (value) {
            if (!value) {
                Logger.Warn("Setting updateGizmoRotationToMatchAttachedMesh = false on scaling gizmo is not supported.");
            }
            else {
                this._updateGizmoRotationToMatchAttachedMesh = value;
                [this.xGizmo, this.yGizmo, this.zGizmo, this.uniformScaleGizmo].forEach(function (gizmo) {
                    if (gizmo) {
                        gizmo.updateGizmoRotationToMatchAttachedMesh = value;
                    }
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScaleGizmo.prototype, "snapDistance", {
        get: function () {
            return this._snapDistance;
        },
        /**
         * Drag distance in babylon units that the gizmo will snap to when dragged (Default: 0)
         */
        set: function (value) {
            this._snapDistance = value;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.uniformScaleGizmo].forEach(function (gizmo) {
                if (gizmo) {
                    gizmo.snapDistance = value;
                }
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScaleGizmo.prototype, "scaleRatio", {
        get: function () {
            return this._scaleRatio;
        },
        /**
         * Ratio for the scale of the gizmo (Default: 1)
         */
        set: function (value) {
            this._scaleRatio = value;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.uniformScaleGizmo].forEach(function (gizmo) {
                if (gizmo) {
                    gizmo.scaleRatio = value;
                }
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScaleGizmo.prototype, "sensitivity", {
        get: function () {
            return this._sensitivity;
        },
        /**
         * Sensitivity factor for dragging (Default: 1)
         */
        set: function (value) {
            this._sensitivity = value;
            [this.xGizmo, this.yGizmo, this.zGizmo, this.uniformScaleGizmo].forEach(function (gizmo) {
                if (gizmo) {
                    gizmo.sensitivity = value;
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
    ScaleGizmo.prototype.addToAxisCache = function (mesh, cache) {
        this._gizmoAxisCache.set(mesh, cache);
    };
    /**
     * Disposes of the gizmo
     */
    ScaleGizmo.prototype.dispose = function () {
        var _this = this;
        [this.xGizmo, this.yGizmo, this.zGizmo, this.uniformScaleGizmo].forEach(function (gizmo) {
            if (gizmo) {
                gizmo.dispose();
            }
        });
        this._observables.forEach(function (obs) {
            _this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(obs);
        });
        this.onDragStartObservable.clear();
        this.onDragEndObservable.clear();
        [this._uniformScalingMesh, this._octahedron].forEach(function (msh) {
            if (msh) {
                msh.dispose();
            }
        });
        [this._coloredMaterial, this._hoverMaterial, this._disableMaterial].forEach(function (matl) {
            if (matl) {
                matl.dispose();
            }
        });
    };
    return ScaleGizmo;
}(Gizmo));
export { ScaleGizmo };
//# sourceMappingURL=scaleGizmo.js.map