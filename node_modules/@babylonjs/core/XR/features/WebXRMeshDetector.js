import { __extends } from "tslib";
import { WebXRFeaturesManager, WebXRFeatureName } from "../webXRFeaturesManager.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { Matrix } from "../../Maths/math.js";
import { Observable } from "../../Misc/observable.js";
var meshIdProvider = 0;
/**
 * The mesh detector is used to detect meshes in the real world when in AR
 */
var WebXRMeshDetector = /** @class */ (function (_super) {
    __extends(WebXRMeshDetector, _super);
    function WebXRMeshDetector(_xrSessionManager, _options) {
        if (_options === void 0) { _options = {}; }
        var _this = _super.call(this, _xrSessionManager) || this;
        _this._options = _options;
        _this._detectedMeshes = new Map();
        /**
         * Observers registered here will be executed when a new mesh was added to the session
         */
        _this.onMeshAddedObservable = new Observable();
        /**
         * Observers registered here will be executed when a mesh is no longer detected in the session
         */
        _this.onMeshRemovedObservable = new Observable();
        /**
         * Observers registered here will be executed when an existing mesh updates
         */
        _this.onMeshUpdatedObservable = new Observable();
        _this.xrNativeFeatureName = "mesh-detection";
        if (_this._xrSessionManager.session) {
            _this._init();
        }
        else {
            _this._xrSessionManager.onXRSessionInit.addOnce(function () {
                _this._init();
            });
        }
        return _this;
    }
    WebXRMeshDetector.prototype.detach = function () {
        var _this = this;
        if (!_super.prototype.detach.call(this)) {
            return false;
        }
        // Only supported by BabylonNative
        if (!!this._xrSessionManager.isNative && !!this._xrSessionManager.session.trySetMeshDetectorEnabled) {
            this._xrSessionManager.session.trySetMeshDetectorEnabled(false);
        }
        if (!this._options.doNotRemoveMeshesOnSessionEnded) {
            this._detectedMeshes.forEach(function (mesh) {
                _this.onMeshRemovedObservable.notifyObservers(mesh);
            });
            this._detectedMeshes.clear();
        }
        return true;
    };
    WebXRMeshDetector.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.onMeshAddedObservable.clear();
        this.onMeshRemovedObservable.clear();
        this.onMeshUpdatedObservable.clear();
    };
    WebXRMeshDetector.prototype._onXRFrame = function (frame) {
        var _this = this;
        var _a;
        // TODO remove try catch
        try {
            if (!this.attached || !frame) {
                return;
            }
            var detectedMeshes_1 = (_a = frame.worldInformation) === null || _a === void 0 ? void 0 : _a.detectedMeshes;
            if (detectedMeshes_1) {
                var toRemove_1 = new Set();
                this._detectedMeshes.forEach(function (vertexData, xrMesh) {
                    if (!detectedMeshes_1.has(xrMesh)) {
                        toRemove_1.add(xrMesh);
                    }
                });
                toRemove_1.forEach(function (xrMesh) {
                    var vertexData = _this._detectedMeshes.get(xrMesh);
                    if (vertexData) {
                        _this.onMeshRemovedObservable.notifyObservers(vertexData);
                        _this._detectedMeshes.delete(xrMesh);
                    }
                });
                // now check for new ones
                detectedMeshes_1.forEach(function (xrMesh) {
                    if (!_this._detectedMeshes.has(xrMesh)) {
                        var partialVertexData = {
                            id: meshIdProvider++,
                            xrMesh: xrMesh,
                        };
                        var vertexData = _this._updateVertexDataWithXRMesh(xrMesh, partialVertexData, frame);
                        _this._detectedMeshes.set(xrMesh, vertexData);
                        _this.onMeshAddedObservable.notifyObservers(vertexData);
                    }
                    else {
                        // updated?
                        if (xrMesh.lastChangedTime === _this._xrSessionManager.currentTimestamp) {
                            var vertexData = _this._detectedMeshes.get(xrMesh);
                            if (vertexData) {
                                _this._updateVertexDataWithXRMesh(xrMesh, vertexData, frame);
                                _this.onMeshUpdatedObservable.notifyObservers(vertexData);
                            }
                        }
                    }
                });
            }
        }
        catch (error) {
            console.log(error.stack);
        }
    };
    WebXRMeshDetector.prototype._init = function () {
        // Only supported by BabylonNative
        if (this._xrSessionManager.isNative) {
            if (this._xrSessionManager.session.trySetMeshDetectorEnabled) {
                this._xrSessionManager.session.trySetMeshDetectorEnabled(true);
            }
            if (!!this._options.preferredDetectorOptions && !!this._xrSessionManager.session.trySetPreferredMeshDetectorOptions) {
                this._xrSessionManager.session.trySetPreferredMeshDetectorOptions(this._options.preferredDetectorOptions);
            }
        }
    };
    WebXRMeshDetector.prototype._updateVertexDataWithXRMesh = function (xrMesh, mesh, xrFrame) {
        mesh.xrMesh = xrMesh;
        mesh.worldParentNode = this._options.worldParentNode;
        if (this._options.convertCoordinateSystems) {
            if (!this._xrSessionManager.scene.useRightHandedSystem) {
                mesh.positions = new Float32Array(xrMesh.positions.length);
                for (var i = 0; i < xrMesh.positions.length; i += 3) {
                    mesh.positions[i] = xrMesh.positions[i];
                    mesh.positions[i + 1] = xrMesh.positions[i + 1];
                    mesh.positions[i + 2] = -1 * xrMesh.positions[i + 2];
                }
                if (xrMesh.normals) {
                    mesh.normals = new Float32Array(xrMesh.normals.length);
                    for (var i = 0; i < xrMesh.normals.length; i += 3) {
                        mesh.normals[i] = xrMesh.normals[i];
                        mesh.normals[i + 1] = xrMesh.normals[i + 1];
                        mesh.normals[i + 2] = -1 * xrMesh.normals[i + 2];
                    }
                }
            }
            else {
                mesh.positions = xrMesh.positions;
                mesh.normals = xrMesh.normals;
            }
            // WebXR should provide indices in a counterclockwise winding order regardless of coordinate system handedness
            mesh.indices = xrMesh.indices;
            // matrix
            var pose = xrFrame.getPose(xrMesh.meshSpace, this._xrSessionManager.referenceSpace);
            if (pose) {
                var mat = mesh.transformationMatrix || new Matrix();
                Matrix.FromArrayToRef(pose.transform.matrix, 0, mat);
                if (!this._xrSessionManager.scene.useRightHandedSystem) {
                    mat.toggleModelMatrixHandInPlace();
                }
                mesh.transformationMatrix = mat;
                if (this._options.worldParentNode) {
                    mat.multiplyToRef(this._options.worldParentNode.getWorldMatrix(), mat);
                }
            }
        }
        return mesh;
    };
    /**
     * The module's name
     */
    WebXRMeshDetector.Name = WebXRFeatureName.MESH_DETECTION;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRMeshDetector.Version = 1;
    return WebXRMeshDetector;
}(WebXRAbstractFeature));
export { WebXRMeshDetector };
WebXRFeaturesManager.AddWebXRFeature(WebXRMeshDetector.Name, function (xrSessionManager, options) {
    return function () { return new WebXRMeshDetector(xrSessionManager, options); };
}, WebXRMeshDetector.Version, false);
//# sourceMappingURL=WebXRMeshDetector.js.map