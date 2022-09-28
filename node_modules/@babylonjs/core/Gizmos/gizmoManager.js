import { Observable } from "../Misc/observable.js";
import { PointerEventTypes } from "../Events/pointerEvents.js";
import { AbstractMesh } from "../Meshes/abstractMesh.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
import { Color3 } from "../Maths/math.color.js";
import { SixDofDragBehavior } from "../Behaviors/Meshes/sixDofDragBehavior.js";
import { Gizmo } from "./gizmo.js";
import { RotationGizmo } from "./rotationGizmo.js";
import { PositionGizmo } from "./positionGizmo.js";
import { ScaleGizmo } from "./scaleGizmo.js";
import { BoundingBoxGizmo } from "./boundingBoxGizmo.js";
/**
 * Helps setup gizmo's in the scene to rotate/scale/position nodes
 */
var GizmoManager = /** @class */ (function () {
    /**
     * Instantiates a gizmo manager
     * @param _scene the scene to overlay the gizmos on top of
     * @param thickness display gizmo axis thickness
     * @param utilityLayer the layer where gizmos are rendered
     * @param keepDepthUtilityLayer the layer where occluded gizmos are rendered
     */
    function GizmoManager(_scene, thickness, utilityLayer, keepDepthUtilityLayer) {
        if (thickness === void 0) { thickness = 1; }
        if (utilityLayer === void 0) { utilityLayer = UtilityLayerRenderer.DefaultUtilityLayer; }
        if (keepDepthUtilityLayer === void 0) { keepDepthUtilityLayer = UtilityLayerRenderer.DefaultKeepDepthUtilityLayer; }
        this._scene = _scene;
        /** When true, the gizmo will be detached from the current object when a pointer down occurs with an empty picked mesh */
        this.clearGizmoOnEmptyPointerEvent = false;
        /** When true (default), picking to attach a new mesh is enabled. This works in sync with inspector autopicking. */
        this.enableAutoPicking = true;
        /** Fires an event when the manager is attached to a mesh */
        this.onAttachedToMeshObservable = new Observable();
        /** Fires an event when the manager is attached to a node */
        this.onAttachedToNodeObservable = new Observable();
        this._gizmosEnabled = { positionGizmo: false, rotationGizmo: false, scaleGizmo: false, boundingBoxGizmo: false };
        this._pointerObservers = [];
        this._attachedMesh = null;
        this._attachedNode = null;
        this._boundingBoxColor = Color3.FromHexString("#0984e3");
        this._thickness = 1;
        this._scaleRatio = 1;
        /** Node Caching for quick lookup */
        this._gizmoAxisCache = new Map();
        /**
         * When bounding box gizmo is enabled, this can be used to track drag/end events
         */
        this.boundingBoxDragBehavior = new SixDofDragBehavior();
        /**
         * Array of meshes which will have the gizmo attached when a pointer selected them. If null, all meshes are attachable. (Default: null)
         */
        this.attachableMeshes = null;
        /**
         * Array of nodes which will have the gizmo attached when a pointer selected them. If null, all nodes are attachable. (Default: null)
         */
        this.attachableNodes = null;
        /**
         * If pointer events should perform attaching/detaching a gizmo, if false this can be done manually via attachToMesh/attachToNode. (Default: true)
         */
        this.usePointerToAttachGizmos = true;
        this._defaultUtilityLayer = utilityLayer;
        this._defaultKeepDepthUtilityLayer = keepDepthUtilityLayer;
        this._defaultKeepDepthUtilityLayer.utilityLayerScene.autoClearDepthAndStencil = false;
        this._thickness = thickness;
        this.gizmos = { positionGizmo: null, rotationGizmo: null, scaleGizmo: null, boundingBoxGizmo: null };
        var attachToMeshPointerObserver = this._attachToMeshPointerObserver(_scene);
        var gizmoAxisPointerObserver = Gizmo.GizmoAxisPointerObserver(this._defaultUtilityLayer, this._gizmoAxisCache);
        this._pointerObservers = [attachToMeshPointerObserver, gizmoAxisPointerObserver];
    }
    Object.defineProperty(GizmoManager.prototype, "keepDepthUtilityLayer", {
        /**
         * Utility layer that the bounding box gizmo belongs to
         */
        get: function () {
            return this._defaultKeepDepthUtilityLayer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GizmoManager.prototype, "utilityLayer", {
        /**
         * Utility layer that all gizmos besides bounding box belong to
         */
        get: function () {
            return this._defaultUtilityLayer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GizmoManager.prototype, "isHovered", {
        /**
         * True when the mouse pointer is hovering a gizmo mesh
         */
        get: function () {
            var hovered = false;
            for (var key in this.gizmos) {
                var gizmo = this.gizmos[key];
                if (gizmo && gizmo.isHovered) {
                    hovered = true;
                    break;
                }
            }
            return hovered;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GizmoManager.prototype, "scaleRatio", {
        get: function () {
            return this._scaleRatio;
        },
        /**
         * Ratio for the scale of the gizmo (Default: 1)
         */
        set: function (value) {
            this._scaleRatio = value;
            [this.gizmos.positionGizmo, this.gizmos.rotationGizmo, this.gizmos.scaleGizmo].forEach(function (gizmo) {
                if (gizmo) {
                    gizmo.scaleRatio = value;
                }
            });
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Subscribes to pointer down events, for attaching and detaching mesh
     * @param scene The scene layer the observer will be added to
     */
    GizmoManager.prototype._attachToMeshPointerObserver = function (scene) {
        var _this = this;
        // Instantiate/dispose gizmos based on pointer actions
        var pointerObserver = scene.onPointerObservable.add(function (pointerInfo) {
            if (!_this.usePointerToAttachGizmos) {
                return;
            }
            if (pointerInfo.type == PointerEventTypes.POINTERDOWN) {
                if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {
                    if (_this.enableAutoPicking) {
                        var node_1 = pointerInfo.pickInfo.pickedMesh;
                        if (_this.attachableMeshes == null) {
                            // Attach to the most parent node
                            while (node_1 && node_1.parent != null) {
                                node_1 = node_1.parent;
                            }
                        }
                        else {
                            // Attach to the parent node that is an attachableMesh
                            var found_1 = false;
                            _this.attachableMeshes.forEach(function (mesh) {
                                if (node_1 && (node_1 == mesh || node_1.isDescendantOf(mesh))) {
                                    node_1 = mesh;
                                    found_1 = true;
                                }
                            });
                            if (!found_1) {
                                node_1 = null;
                            }
                        }
                        if (node_1 instanceof AbstractMesh) {
                            if (_this._attachedMesh != node_1) {
                                _this.attachToMesh(node_1);
                            }
                        }
                        else {
                            if (_this.clearGizmoOnEmptyPointerEvent) {
                                _this.attachToMesh(null);
                            }
                        }
                    }
                }
                else {
                    if (_this.clearGizmoOnEmptyPointerEvent) {
                        _this.attachToMesh(null);
                    }
                }
            }
        });
        return pointerObserver;
    };
    /**
     * Attaches a set of gizmos to the specified mesh
     * @param mesh The mesh the gizmo's should be attached to
     */
    GizmoManager.prototype.attachToMesh = function (mesh) {
        if (this._attachedMesh) {
            this._attachedMesh.removeBehavior(this.boundingBoxDragBehavior);
        }
        if (this._attachedNode) {
            this._attachedNode.removeBehavior(this.boundingBoxDragBehavior);
        }
        this._attachedMesh = mesh;
        this._attachedNode = null;
        for (var key in this.gizmos) {
            var gizmo = this.gizmos[key];
            if (gizmo && this._gizmosEnabled[key]) {
                gizmo.attachedMesh = mesh;
            }
        }
        if (this.boundingBoxGizmoEnabled && this._attachedMesh) {
            this._attachedMesh.addBehavior(this.boundingBoxDragBehavior);
        }
        this.onAttachedToMeshObservable.notifyObservers(mesh);
    };
    /**
     * Attaches a set of gizmos to the specified node
     * @param node The node the gizmo's should be attached to
     */
    GizmoManager.prototype.attachToNode = function (node) {
        if (this._attachedMesh) {
            this._attachedMesh.removeBehavior(this.boundingBoxDragBehavior);
        }
        if (this._attachedNode) {
            this._attachedNode.removeBehavior(this.boundingBoxDragBehavior);
        }
        this._attachedMesh = null;
        this._attachedNode = node;
        for (var key in this.gizmos) {
            var gizmo = this.gizmos[key];
            if (gizmo && this._gizmosEnabled[key]) {
                gizmo.attachedNode = node;
            }
        }
        if (this.boundingBoxGizmoEnabled && this._attachedNode) {
            this._attachedNode.addBehavior(this.boundingBoxDragBehavior);
        }
        this.onAttachedToNodeObservable.notifyObservers(node);
    };
    Object.defineProperty(GizmoManager.prototype, "positionGizmoEnabled", {
        get: function () {
            return this._gizmosEnabled.positionGizmo;
        },
        /**
         * If the position gizmo is enabled
         */
        set: function (value) {
            if (value) {
                if (!this.gizmos.positionGizmo) {
                    this.gizmos.positionGizmo = new PositionGizmo(this._defaultUtilityLayer, this._thickness, this);
                }
                if (this._attachedNode) {
                    this.gizmos.positionGizmo.attachedNode = this._attachedNode;
                }
                else {
                    this.gizmos.positionGizmo.attachedMesh = this._attachedMesh;
                }
            }
            else if (this.gizmos.positionGizmo) {
                this.gizmos.positionGizmo.attachedNode = null;
            }
            this._gizmosEnabled.positionGizmo = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GizmoManager.prototype, "rotationGizmoEnabled", {
        get: function () {
            return this._gizmosEnabled.rotationGizmo;
        },
        /**
         * If the rotation gizmo is enabled
         */
        set: function (value) {
            if (value) {
                if (!this.gizmos.rotationGizmo) {
                    this.gizmos.rotationGizmo = new RotationGizmo(this._defaultUtilityLayer, 32, false, this._thickness, this);
                }
                if (this._attachedNode) {
                    this.gizmos.rotationGizmo.attachedNode = this._attachedNode;
                }
                else {
                    this.gizmos.rotationGizmo.attachedMesh = this._attachedMesh;
                }
            }
            else if (this.gizmos.rotationGizmo) {
                this.gizmos.rotationGizmo.attachedNode = null;
            }
            this._gizmosEnabled.rotationGizmo = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GizmoManager.prototype, "scaleGizmoEnabled", {
        get: function () {
            return this._gizmosEnabled.scaleGizmo;
        },
        /**
         * If the scale gizmo is enabled
         */
        set: function (value) {
            if (value) {
                this.gizmos.scaleGizmo = this.gizmos.scaleGizmo || new ScaleGizmo(this._defaultUtilityLayer, this._thickness, this);
                if (this._attachedNode) {
                    this.gizmos.scaleGizmo.attachedNode = this._attachedNode;
                }
                else {
                    this.gizmos.scaleGizmo.attachedMesh = this._attachedMesh;
                }
            }
            else if (this.gizmos.scaleGizmo) {
                this.gizmos.scaleGizmo.attachedNode = null;
            }
            this._gizmosEnabled.scaleGizmo = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GizmoManager.prototype, "boundingBoxGizmoEnabled", {
        get: function () {
            return this._gizmosEnabled.boundingBoxGizmo;
        },
        /**
         * If the boundingBox gizmo is enabled
         */
        set: function (value) {
            if (value) {
                this.gizmos.boundingBoxGizmo = this.gizmos.boundingBoxGizmo || new BoundingBoxGizmo(this._boundingBoxColor, this._defaultKeepDepthUtilityLayer);
                if (this._attachedMesh) {
                    this.gizmos.boundingBoxGizmo.attachedMesh = this._attachedMesh;
                }
                else {
                    this.gizmos.boundingBoxGizmo.attachedNode = this._attachedNode;
                }
                if (this._attachedMesh) {
                    this._attachedMesh.removeBehavior(this.boundingBoxDragBehavior);
                    this._attachedMesh.addBehavior(this.boundingBoxDragBehavior);
                }
                else if (this._attachedNode) {
                    this._attachedNode.removeBehavior(this.boundingBoxDragBehavior);
                    this._attachedNode.addBehavior(this.boundingBoxDragBehavior);
                }
            }
            else if (this.gizmos.boundingBoxGizmo) {
                if (this._attachedMesh) {
                    this._attachedMesh.removeBehavior(this.boundingBoxDragBehavior);
                }
                else if (this._attachedNode) {
                    this._attachedNode.removeBehavior(this.boundingBoxDragBehavior);
                }
                this.gizmos.boundingBoxGizmo.attachedNode = null;
            }
            this._gizmosEnabled.boundingBoxGizmo = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Builds Gizmo Axis Cache to enable features such as hover state preservation and graying out other axis during manipulation
     * @param gizmoAxisCache Gizmo axis definition used for reactive gizmo UI
     */
    GizmoManager.prototype.addToAxisCache = function (gizmoAxisCache) {
        var _this = this;
        if (gizmoAxisCache.size > 0) {
            gizmoAxisCache.forEach(function (v, k) {
                _this._gizmoAxisCache.set(k, v);
            });
        }
    };
    /**
     * Disposes of the gizmo manager
     */
    GizmoManager.prototype.dispose = function () {
        var _this = this;
        var _a, _b;
        this._pointerObservers.forEach(function (observer) {
            _this._scene.onPointerObservable.remove(observer);
        });
        for (var key in this.gizmos) {
            var gizmo = this.gizmos[key];
            if (gizmo) {
                gizmo.dispose();
            }
        }
        if (this._defaultKeepDepthUtilityLayer !== UtilityLayerRenderer._DefaultKeepDepthUtilityLayer) {
            (_a = this._defaultKeepDepthUtilityLayer) === null || _a === void 0 ? void 0 : _a.dispose();
        }
        if (this._defaultUtilityLayer !== UtilityLayerRenderer._DefaultUtilityLayer) {
            (_b = this._defaultUtilityLayer) === null || _b === void 0 ? void 0 : _b.dispose();
        }
        this.boundingBoxDragBehavior.detach();
        this.onAttachedToMeshObservable.clear();
    };
    return GizmoManager;
}());
export { GizmoManager };
//# sourceMappingURL=gizmoManager.js.map