import { __extends } from "tslib";
import { Vector3 } from "../Maths/math.vector.js";
import { Color3 } from "../Maths/math.color.js";
import { Mesh } from "../Meshes/mesh.js";
import { Gizmo } from "./gizmo.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
import { StandardMaterial } from "../Materials/standardMaterial.js";
import { CreateBox } from "../Meshes/Builders/boxBuilder.js";
import { CreateCylinder } from "../Meshes/Builders/cylinderBuilder.js";
import { Matrix } from "../Maths/math.js";
import { CreateLines } from "../Meshes/Builders/linesBuilder.js";
import { PointerEventTypes } from "../Events/pointerEvents.js";
import { Observable } from "../Misc/observable.js";
/**
 * Gizmo that enables viewing a camera
 */
var CameraGizmo = /** @class */ (function (_super) {
    __extends(CameraGizmo, _super);
    /**
     * Creates a CameraGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     */
    function CameraGizmo(gizmoLayer) {
        if (gizmoLayer === void 0) { gizmoLayer = UtilityLayerRenderer.DefaultUtilityLayer; }
        var _this = _super.call(this, gizmoLayer) || this;
        _this._pointerObserver = null;
        /**
         * Event that fires each time the gizmo is clicked
         */
        _this.onClickedObservable = new Observable();
        _this._camera = null;
        _this._invProjection = new Matrix();
        _this._material = new StandardMaterial("cameraGizmoMaterial", _this.gizmoLayer.utilityLayerScene);
        _this._material.diffuseColor = new Color3(0.5, 0.5, 0.5);
        _this._material.specularColor = new Color3(0.1, 0.1, 0.1);
        _this._pointerObserver = gizmoLayer.utilityLayerScene.onPointerObservable.add(function (pointerInfo) {
            if (!_this._camera) {
                return;
            }
            _this._isHovered = !!(pointerInfo.pickInfo && _this._rootMesh.getChildMeshes().indexOf(pointerInfo.pickInfo.pickedMesh) != -1);
            if (_this._isHovered && pointerInfo.event.button === 0) {
                _this.onClickedObservable.notifyObservers(_this._camera);
            }
        }, PointerEventTypes.POINTERDOWN);
        return _this;
    }
    Object.defineProperty(CameraGizmo.prototype, "displayFrustum", {
        /** Gets or sets a boolean indicating if frustum lines must be rendered (true by default)) */
        get: function () {
            return this._cameraLinesMesh.isEnabled();
        },
        set: function (value) {
            this._cameraLinesMesh.setEnabled(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CameraGizmo.prototype, "camera", {
        get: function () {
            return this._camera;
        },
        /**
         * The camera that the gizmo is attached to
         */
        set: function (camera) {
            var _this = this;
            this._camera = camera;
            this.attachedNode = camera;
            if (camera) {
                // Create the mesh for the given camera
                if (this._cameraMesh) {
                    this._cameraMesh.dispose();
                }
                if (this._cameraLinesMesh) {
                    this._cameraLinesMesh.dispose();
                }
                this._cameraMesh = CameraGizmo._CreateCameraMesh(this.gizmoLayer.utilityLayerScene);
                this._cameraLinesMesh = CameraGizmo._CreateCameraFrustum(this.gizmoLayer.utilityLayerScene);
                this._cameraMesh.getChildMeshes(false).forEach(function (m) {
                    m.material = _this._material;
                });
                this._cameraMesh.parent = this._rootMesh;
                this._cameraLinesMesh.parent = this._rootMesh;
                if (this.gizmoLayer.utilityLayerScene.activeCamera && this.gizmoLayer.utilityLayerScene.activeCamera.maxZ < camera.maxZ * 1.5) {
                    this.gizmoLayer.utilityLayerScene.activeCamera.maxZ = camera.maxZ * 1.5;
                }
                if (!this.attachedNode.reservedDataStore) {
                    this.attachedNode.reservedDataStore = {};
                }
                this.attachedNode.reservedDataStore.cameraGizmo = this;
                // Add lighting to the camera gizmo
                var gizmoLight = this.gizmoLayer._getSharedGizmoLight();
                gizmoLight.includedOnlyMeshes = gizmoLight.includedOnlyMeshes.concat(this._cameraMesh.getChildMeshes(false));
                this._update();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CameraGizmo.prototype, "material", {
        /**
         * Gets the material used to render the camera gizmo
         */
        get: function () {
            return this._material;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @hidden
     * Updates the gizmo to match the attached mesh's position/rotation
     */
    CameraGizmo.prototype._update = function () {
        _super.prototype._update.call(this);
        if (!this._camera) {
            return;
        }
        // frustum matrix
        this._camera.getProjectionMatrix().invertToRef(this._invProjection);
        this._cameraLinesMesh.setPivotMatrix(this._invProjection, false);
        this._cameraLinesMesh.scaling.x = 1 / this._rootMesh.scaling.x;
        this._cameraLinesMesh.scaling.y = 1 / this._rootMesh.scaling.y;
        this._cameraLinesMesh.scaling.z = 1 / this._rootMesh.scaling.z;
        // take care of coordinate system in camera scene to properly display the mesh with the good Y axis orientation in this scene
        this._cameraMesh.parent = null;
        this._cameraMesh.rotation.y = Math.PI * 0.5 * (this._camera.getScene().useRightHandedSystem ? 1 : -1);
        this._cameraMesh.parent = this._rootMesh;
    };
    /**
     * Disposes of the camera gizmo
     */
    CameraGizmo.prototype.dispose = function () {
        this.onClickedObservable.clear();
        this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(this._pointerObserver);
        if (this._cameraMesh) {
            this._cameraMesh.dispose();
        }
        if (this._cameraLinesMesh) {
            this._cameraLinesMesh.dispose();
        }
        this._material.dispose();
        _super.prototype.dispose.call(this);
    };
    CameraGizmo._CreateCameraMesh = function (scene) {
        var root = new Mesh("rootCameraGizmo", scene);
        var mesh = new Mesh(root.name, scene);
        mesh.parent = root;
        var box = CreateBox(root.name, { width: 1.0, height: 0.8, depth: 0.5 }, scene);
        box.parent = mesh;
        var cyl1 = CreateCylinder(root.name, { height: 0.5, diameterTop: 0.8, diameterBottom: 0.8 }, scene);
        cyl1.parent = mesh;
        cyl1.position.y = 0.3;
        cyl1.position.x = -0.6;
        cyl1.rotation.x = Math.PI * 0.5;
        var cyl2 = CreateCylinder(root.name, { height: 0.5, diameterTop: 0.6, diameterBottom: 0.6 }, scene);
        cyl2.parent = mesh;
        cyl2.position.y = 0.5;
        cyl2.position.x = 0.4;
        cyl2.rotation.x = Math.PI * 0.5;
        var cyl3 = CreateCylinder(root.name, { height: 0.5, diameterTop: 0.5, diameterBottom: 0.5 }, scene);
        cyl3.parent = mesh;
        cyl3.position.y = 0.0;
        cyl3.position.x = 0.6;
        cyl3.rotation.z = Math.PI * 0.5;
        root.scaling.scaleInPlace(CameraGizmo._Scale);
        mesh.position.x = -0.9;
        return root;
    };
    CameraGizmo._CreateCameraFrustum = function (scene) {
        var root = new Mesh("rootCameraGizmo", scene);
        var mesh = new Mesh(root.name, scene);
        mesh.parent = root;
        for (var y = 0; y < 4; y += 2) {
            for (var x = 0; x < 4; x += 2) {
                var line = CreateLines("lines", { points: [new Vector3(-1 + x, -1 + y, -1), new Vector3(-1 + x, -1 + y, 1)] }, scene);
                line.parent = mesh;
                line.alwaysSelectAsActiveMesh = true;
                line.isPickable = false;
                line = CreateLines("lines", { points: [new Vector3(-1, -1 + x, -1 + y), new Vector3(1, -1 + x, -1 + y)] }, scene);
                line.parent = mesh;
                line.alwaysSelectAsActiveMesh = true;
                line.isPickable = false;
                line = CreateLines("lines", { points: [new Vector3(-1 + x, -1, -1 + y), new Vector3(-1 + x, 1, -1 + y)] }, scene);
                line.parent = mesh;
                line.alwaysSelectAsActiveMesh = true;
                line.isPickable = false;
            }
        }
        return root;
    };
    // Static helper methods
    CameraGizmo._Scale = 0.05;
    return CameraGizmo;
}(Gizmo));
export { CameraGizmo };
//# sourceMappingURL=cameraGizmo.js.map