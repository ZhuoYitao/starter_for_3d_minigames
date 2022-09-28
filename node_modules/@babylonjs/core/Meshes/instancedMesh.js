import { __extends } from "tslib";
import { Matrix, TmpVectors } from "../Maths/math.vector.js";
import { Logger } from "../Misc/logger.js";
import { AbstractMesh } from "../Meshes/abstractMesh.js";
import { Mesh } from "../Meshes/mesh.js";
import { DeepCopier } from "../Misc/deepCopier.js";
import { TransformNode } from "./transformNode.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Tools } from "../Misc/tools.js";
Mesh._instancedMeshFactory = function (name, mesh) {
    var instance = new InstancedMesh(name, mesh);
    if (mesh.instancedBuffers) {
        instance.instancedBuffers = {};
        for (var key in mesh.instancedBuffers) {
            instance.instancedBuffers[key] = mesh.instancedBuffers[key];
        }
    }
    return instance;
};
/**
 * Creates an instance based on a source mesh.
 */
var InstancedMesh = /** @class */ (function (_super) {
    __extends(InstancedMesh, _super);
    function InstancedMesh(name, source) {
        var _this = _super.call(this, name, source.getScene()) || this;
        /** @hidden */
        _this._indexInSourceMeshInstanceArray = -1;
        /** @hidden */
        _this._distanceToCamera = 0;
        source.addInstance(_this);
        _this._sourceMesh = source;
        _this._unIndexed = source._unIndexed;
        _this.position.copyFrom(source.position);
        _this.rotation.copyFrom(source.rotation);
        _this.scaling.copyFrom(source.scaling);
        if (source.rotationQuaternion) {
            _this.rotationQuaternion = source.rotationQuaternion.clone();
        }
        _this.animations = Tools.Slice(source.animations);
        for (var _i = 0, _a = source.getAnimationRanges(); _i < _a.length; _i++) {
            var range = _a[_i];
            if (range != null) {
                _this.createAnimationRange(range.name, range.from, range.to);
            }
        }
        _this.infiniteDistance = source.infiniteDistance;
        _this.setPivotMatrix(source.getPivotMatrix());
        _this.refreshBoundingInfo(true, true);
        _this._syncSubMeshes();
        return _this;
    }
    /**
     * Returns the string "InstancedMesh".
     */
    InstancedMesh.prototype.getClassName = function () {
        return "InstancedMesh";
    };
    Object.defineProperty(InstancedMesh.prototype, "lightSources", {
        /** Gets the list of lights affecting that mesh */
        get: function () {
            return this._sourceMesh._lightSources;
        },
        enumerable: false,
        configurable: true
    });
    InstancedMesh.prototype._resyncLightSources = function () {
        // Do nothing as all the work will be done by source mesh
    };
    InstancedMesh.prototype._resyncLightSource = function () {
        // Do nothing as all the work will be done by source mesh
    };
    InstancedMesh.prototype._removeLightSource = function () {
        // Do nothing as all the work will be done by source mesh
    };
    Object.defineProperty(InstancedMesh.prototype, "receiveShadows", {
        // Methods
        /**
         * If the source mesh receives shadows
         */
        get: function () {
            return this._sourceMesh.receiveShadows;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstancedMesh.prototype, "material", {
        /**
         * The material of the source mesh
         */
        get: function () {
            return this._sourceMesh.material;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstancedMesh.prototype, "visibility", {
        /**
         * Visibility of the source mesh
         */
        get: function () {
            return this._sourceMesh.visibility;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstancedMesh.prototype, "skeleton", {
        /**
         * Skeleton of the source mesh
         */
        get: function () {
            return this._sourceMesh.skeleton;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstancedMesh.prototype, "renderingGroupId", {
        /**
         * Rendering ground id of the source mesh
         */
        get: function () {
            return this._sourceMesh.renderingGroupId;
        },
        set: function (value) {
            if (!this._sourceMesh || value === this._sourceMesh.renderingGroupId) {
                return;
            }
            //no-op with warning
            Logger.Warn("Note - setting renderingGroupId of an instanced mesh has no effect on the scene");
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the total number of vertices (integer).
     */
    InstancedMesh.prototype.getTotalVertices = function () {
        return this._sourceMesh ? this._sourceMesh.getTotalVertices() : 0;
    };
    /**
     * Returns a positive integer : the total number of indices in this mesh geometry.
     * @returns the number of indices or zero if the mesh has no geometry.
     */
    InstancedMesh.prototype.getTotalIndices = function () {
        return this._sourceMesh.getTotalIndices();
    };
    Object.defineProperty(InstancedMesh.prototype, "sourceMesh", {
        /**
         * The source mesh of the instance
         */
        get: function () {
            return this._sourceMesh;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates a new InstancedMesh object from the mesh model.
     * @see https://doc.babylonjs.com/how_to/how_to_use_instances
     * @param name defines the name of the new instance
     * @returns a new InstancedMesh
     */
    InstancedMesh.prototype.createInstance = function (name) {
        return this._sourceMesh.createInstance(name);
    };
    /**
     * Is this node ready to be used/rendered
     * @param completeCheck defines if a complete check (including materials and lights) has to be done (false by default)
     * @return {boolean} is it ready
     */
    InstancedMesh.prototype.isReady = function (completeCheck) {
        if (completeCheck === void 0) { completeCheck = false; }
        return this._sourceMesh.isReady(completeCheck, true);
    };
    /**
     * Returns an array of integers or a typed array (Int32Array, Uint32Array, Uint16Array) populated with the mesh indices.
     * @param kind kind of verticies to retrieve (eg. positions, normals, uvs, etc.)
     * @param copyWhenShared If true (default false) and and if the mesh geometry is shared among some other meshes, the returned array is a copy of the internal one.
     * @returns a float array or a Float32Array of the requested kind of data : positions, normals, uvs, etc.
     */
    InstancedMesh.prototype.getVerticesData = function (kind, copyWhenShared) {
        return this._sourceMesh.getVerticesData(kind, copyWhenShared);
    };
    /**
     * Sets the vertex data of the mesh geometry for the requested `kind`.
     * If the mesh has no geometry, a new Geometry object is set to the mesh and then passed this vertex data.
     * The `data` are either a numeric array either a Float32Array.
     * The parameter `updatable` is passed as is to the underlying Geometry object constructor (if initially none) or updater.
     * The parameter `stride` is an optional positive integer, it is usually automatically deducted from the `kind` (3 for positions or normals, 2 for UV, etc).
     * Note that a new underlying VertexBuffer object is created each call.
     * If the `kind` is the `PositionKind`, the mesh BoundingInfo is renewed, so the bounding box and sphere, and the mesh World Matrix is recomputed.
     *
     * Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     *
     * Returns the Mesh.
     * @param kind
     * @param data
     * @param updatable
     * @param stride
     */
    InstancedMesh.prototype.setVerticesData = function (kind, data, updatable, stride) {
        if (this.sourceMesh) {
            this.sourceMesh.setVerticesData(kind, data, updatable, stride);
        }
        return this.sourceMesh;
    };
    /**
     * Updates the existing vertex data of the mesh geometry for the requested `kind`.
     * If the mesh has no geometry, it is simply returned as it is.
     * The `data` are either a numeric array either a Float32Array.
     * No new underlying VertexBuffer object is created.
     * If the `kind` is the `PositionKind` and if `updateExtends` is true, the mesh BoundingInfo is renewed, so the bounding box and sphere, and the mesh World Matrix is recomputed.
     * If the parameter `makeItUnique` is true, a new global geometry is created from this positions and is set to the mesh.
     *
     * Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     *
     * Returns the Mesh.
     * @param kind
     * @param data
     * @param updateExtends
     * @param makeItUnique
     */
    InstancedMesh.prototype.updateVerticesData = function (kind, data, updateExtends, makeItUnique) {
        if (this.sourceMesh) {
            this.sourceMesh.updateVerticesData(kind, data, updateExtends, makeItUnique);
        }
        return this.sourceMesh;
    };
    /**
     * Sets the mesh indices.
     * Expects an array populated with integers or a typed array (Int32Array, Uint32Array, Uint16Array).
     * If the mesh has no geometry, a new Geometry object is created and set to the mesh.
     * This method creates a new index buffer each call.
     * Returns the Mesh.
     * @param indices
     * @param totalVertices
     */
    InstancedMesh.prototype.setIndices = function (indices, totalVertices) {
        if (totalVertices === void 0) { totalVertices = null; }
        if (this.sourceMesh) {
            this.sourceMesh.setIndices(indices, totalVertices);
        }
        return this.sourceMesh;
    };
    /**
     * Boolean : True if the mesh owns the requested kind of data.
     * @param kind
     */
    InstancedMesh.prototype.isVerticesDataPresent = function (kind) {
        return this._sourceMesh.isVerticesDataPresent(kind);
    };
    /**
     * Returns an array of indices (IndicesArray).
     */
    InstancedMesh.prototype.getIndices = function () {
        return this._sourceMesh.getIndices();
    };
    Object.defineProperty(InstancedMesh.prototype, "_positions", {
        get: function () {
            return this._sourceMesh._positions;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * This method recomputes and sets a new BoundingInfo to the mesh unless it is locked.
     * This means the mesh underlying bounding box and sphere are recomputed.
     * @param applySkeleton defines whether to apply the skeleton before computing the bounding info
     * @param applyMorph  defines whether to apply the morph target before computing the bounding info
     * @returns the current mesh
     */
    InstancedMesh.prototype.refreshBoundingInfo = function (applySkeleton, applyMorph) {
        if (applySkeleton === void 0) { applySkeleton = false; }
        if (applyMorph === void 0) { applyMorph = false; }
        if (this.hasBoundingInfo && this.getBoundingInfo().isLocked) {
            return this;
        }
        var bias = this._sourceMesh.geometry ? this._sourceMesh.geometry.boundingBias : null;
        this._refreshBoundingInfo(this._sourceMesh._getPositionData(applySkeleton, applyMorph), bias);
        return this;
    };
    /** @hidden */
    InstancedMesh.prototype._preActivate = function () {
        if (this._currentLOD) {
            this._currentLOD._preActivate();
        }
        return this;
    };
    /**
     * @param renderId
     * @param intermediateRendering
     * @hidden
     */
    InstancedMesh.prototype._activate = function (renderId, intermediateRendering) {
        if (!this._sourceMesh.subMeshes) {
            Logger.Warn("Instances should only be created for meshes with geometry.");
        }
        if (this._currentLOD) {
            var differentSign = this._currentLOD._getWorldMatrixDeterminant() >= 0 !== this._getWorldMatrixDeterminant() >= 0;
            if (differentSign) {
                this._internalAbstractMeshDataInfo._actAsRegularMesh = true;
                return true;
            }
            this._internalAbstractMeshDataInfo._actAsRegularMesh = false;
            this._currentLOD._registerInstanceForRenderId(this, renderId);
            if (intermediateRendering) {
                if (!this._currentLOD._internalAbstractMeshDataInfo._isActiveIntermediate) {
                    this._currentLOD._internalAbstractMeshDataInfo._onlyForInstancesIntermediate = true;
                    return true;
                }
            }
            else {
                if (!this._currentLOD._internalAbstractMeshDataInfo._isActive) {
                    this._currentLOD._internalAbstractMeshDataInfo._onlyForInstances = true;
                    return true;
                }
            }
        }
        return false;
    };
    /** @hidden */
    InstancedMesh.prototype._postActivate = function () {
        if (this._sourceMesh.edgesShareWithInstances && this._sourceMesh._edgesRenderer && this._sourceMesh._edgesRenderer.isEnabled && this._sourceMesh._renderingGroup) {
            // we are using the edge renderer of the source mesh
            this._sourceMesh._renderingGroup._edgesRenderers.pushNoDuplicate(this._sourceMesh._edgesRenderer);
            this._sourceMesh._edgesRenderer.customInstances.push(this.getWorldMatrix());
        }
        else if (this._edgesRenderer && this._edgesRenderer.isEnabled && this._sourceMesh._renderingGroup) {
            // we are using the edge renderer defined for this instance
            this._sourceMesh._renderingGroup._edgesRenderers.push(this._edgesRenderer);
        }
    };
    InstancedMesh.prototype.getWorldMatrix = function () {
        if (this._currentLOD && this._currentLOD.billboardMode !== TransformNode.BILLBOARDMODE_NONE && this._currentLOD._masterMesh !== this) {
            if (!this._billboardWorldMatrix) {
                this._billboardWorldMatrix = new Matrix();
            }
            var tempMaster = this._currentLOD._masterMesh;
            this._currentLOD._masterMesh = this;
            TmpVectors.Vector3[7].copyFrom(this._currentLOD.position);
            this._currentLOD.position.set(0, 0, 0);
            this._billboardWorldMatrix.copyFrom(this._currentLOD.computeWorldMatrix(true));
            this._currentLOD.position.copyFrom(TmpVectors.Vector3[7]);
            this._currentLOD._masterMesh = tempMaster;
            return this._billboardWorldMatrix;
        }
        return _super.prototype.getWorldMatrix.call(this);
    };
    Object.defineProperty(InstancedMesh.prototype, "isAnInstance", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the current associated LOD AbstractMesh.
     * @param camera
     */
    InstancedMesh.prototype.getLOD = function (camera) {
        if (!camera) {
            return this;
        }
        var sourceMeshLODLevels = this.sourceMesh.getLODLevels();
        if (!sourceMeshLODLevels || sourceMeshLODLevels.length === 0) {
            this._currentLOD = this.sourceMesh;
        }
        else {
            var boundingInfo = this.getBoundingInfo();
            this._currentLOD = this.sourceMesh.getLOD(camera, boundingInfo.boundingSphere);
        }
        return this._currentLOD;
    };
    /**
     * @param renderId
     * @hidden
     */
    InstancedMesh.prototype._preActivateForIntermediateRendering = function (renderId) {
        return this.sourceMesh._preActivateForIntermediateRendering(renderId);
    };
    /** @hidden */
    InstancedMesh.prototype._syncSubMeshes = function () {
        this.releaseSubMeshes();
        if (this._sourceMesh.subMeshes) {
            for (var index = 0; index < this._sourceMesh.subMeshes.length; index++) {
                this._sourceMesh.subMeshes[index].clone(this, this._sourceMesh);
            }
        }
        return this;
    };
    /** @hidden */
    InstancedMesh.prototype._generatePointsArray = function () {
        return this._sourceMesh._generatePointsArray();
    };
    /** @hidden */
    InstancedMesh.prototype._updateBoundingInfo = function () {
        if (this.hasBoundingInfo) {
            this.getBoundingInfo().update(this.worldMatrixFromCache);
        }
        else {
            this.buildBoundingInfo(this.absolutePosition, this.absolutePosition, this.worldMatrixFromCache);
        }
        this._updateSubMeshesBoundingInfo(this.worldMatrixFromCache);
        return this;
    };
    /**
     * Creates a new InstancedMesh from the current mesh.
     * - name (string) : the cloned mesh name
     * - newParent (optional Node) : the optional Node to parent the clone to.
     * - doNotCloneChildren (optional boolean, default `false`) : if `true` the model children aren't cloned.
     *
     * Returns the clone.
     * @param name
     * @param newParent
     * @param doNotCloneChildren
     */
    InstancedMesh.prototype.clone = function (name, newParent, doNotCloneChildren) {
        if (newParent === void 0) { newParent = null; }
        var result = this._sourceMesh.createInstance(name);
        // Deep copy
        DeepCopier.DeepCopy(this, result, [
            "name",
            "subMeshes",
            "uniqueId",
            "parent",
            "lightSources",
            "receiveShadows",
            "material",
            "visibility",
            "skeleton",
            "sourceMesh",
            "isAnInstance",
            "facetNb",
            "isFacetDataEnabled",
            "isBlocked",
            "useBones",
            "hasInstances",
            "collider",
            "edgesRenderer",
            "forward",
            "up",
            "right",
            "absolutePosition",
            "absoluteScaling",
            "absoluteRotationQuaternion",
            "isWorldMatrixFrozen",
            "nonUniformScaling",
            "behaviors",
            "worldMatrixFromCache",
            "hasThinInstances",
        ], []);
        // Bounding info
        this.refreshBoundingInfo();
        // Parent
        if (newParent) {
            result.parent = newParent;
        }
        if (!doNotCloneChildren) {
            // Children
            for (var index = 0; index < this.getScene().meshes.length; index++) {
                var mesh = this.getScene().meshes[index];
                if (mesh.parent === this) {
                    mesh.clone(mesh.name, result);
                }
            }
        }
        result.computeWorldMatrix(true);
        this.onClonedObservable.notifyObservers(result);
        return result;
    };
    /**
     * Disposes the InstancedMesh.
     * Returns nothing.
     * @param doNotRecurse
     * @param disposeMaterialAndTextures
     */
    InstancedMesh.prototype.dispose = function (doNotRecurse, disposeMaterialAndTextures) {
        if (disposeMaterialAndTextures === void 0) { disposeMaterialAndTextures = false; }
        // Remove from mesh
        this._sourceMesh.removeInstance(this);
        _super.prototype.dispose.call(this, doNotRecurse, disposeMaterialAndTextures);
    };
    return InstancedMesh;
}(AbstractMesh));
export { InstancedMesh };
Mesh.prototype.registerInstancedBuffer = function (kind, stride) {
    var _a, _b;
    // Remove existing one
    (_b = (_a = this._userInstancedBuffersStorage) === null || _a === void 0 ? void 0 : _a.vertexBuffers[kind]) === null || _b === void 0 ? void 0 : _b.dispose();
    // Creates the instancedBuffer field if not present
    if (!this.instancedBuffers) {
        this.instancedBuffers = {};
        for (var _i = 0, _c = this.instances; _i < _c.length; _i++) {
            var instance = _c[_i];
            instance.instancedBuffers = {};
        }
        this._userInstancedBuffersStorage = {
            data: {},
            vertexBuffers: {},
            strides: {},
            sizes: {},
            vertexArrayObjects: this.getEngine().getCaps().vertexArrayObject ? {} : undefined,
        };
    }
    // Creates an empty property for this kind
    this.instancedBuffers[kind] = null;
    this._userInstancedBuffersStorage.strides[kind] = stride;
    this._userInstancedBuffersStorage.sizes[kind] = stride * 32; // Initial size
    this._userInstancedBuffersStorage.data[kind] = new Float32Array(this._userInstancedBuffersStorage.sizes[kind]);
    this._userInstancedBuffersStorage.vertexBuffers[kind] = new VertexBuffer(this.getEngine(), this._userInstancedBuffersStorage.data[kind], kind, true, false, stride, true);
    for (var _d = 0, _e = this.instances; _d < _e.length; _d++) {
        var instance = _e[_d];
        instance.instancedBuffers[kind] = null;
    }
    this._invalidateInstanceVertexArrayObject();
};
Mesh.prototype._processInstancedBuffers = function (visibleInstances, renderSelf) {
    var instanceCount = visibleInstances.length;
    for (var kind in this.instancedBuffers) {
        var size = this._userInstancedBuffersStorage.sizes[kind];
        var stride = this._userInstancedBuffersStorage.strides[kind];
        // Resize if required
        var expectedSize = (instanceCount + 1) * stride;
        while (size < expectedSize) {
            size *= 2;
        }
        if (this._userInstancedBuffersStorage.data[kind].length != size) {
            this._userInstancedBuffersStorage.data[kind] = new Float32Array(size);
            this._userInstancedBuffersStorage.sizes[kind] = size;
            if (this._userInstancedBuffersStorage.vertexBuffers[kind]) {
                this._userInstancedBuffersStorage.vertexBuffers[kind].dispose();
                this._userInstancedBuffersStorage.vertexBuffers[kind] = null;
            }
        }
        var data = this._userInstancedBuffersStorage.data[kind];
        // Update data buffer
        var offset = 0;
        if (renderSelf) {
            var value = this.instancedBuffers[kind];
            if (value.toArray) {
                value.toArray(data, offset);
            }
            else if (value.copyToArray) {
                value.copyToArray(data, offset);
            }
            else {
                data[offset] = value;
            }
            offset += stride;
        }
        for (var instanceIndex = 0; instanceIndex < instanceCount; instanceIndex++) {
            var instance = visibleInstances[instanceIndex];
            var value = instance.instancedBuffers[kind];
            if (value.toArray) {
                value.toArray(data, offset);
            }
            else if (value.copyToArray) {
                value.copyToArray(data, offset);
            }
            else {
                data[offset] = value;
            }
            offset += stride;
        }
        // Update vertex buffer
        if (!this._userInstancedBuffersStorage.vertexBuffers[kind]) {
            this._userInstancedBuffersStorage.vertexBuffers[kind] = new VertexBuffer(this.getEngine(), this._userInstancedBuffersStorage.data[kind], kind, true, false, stride, true);
            this._invalidateInstanceVertexArrayObject();
        }
        else {
            this._userInstancedBuffersStorage.vertexBuffers[kind].updateDirectly(data, 0);
        }
    }
};
Mesh.prototype._invalidateInstanceVertexArrayObject = function () {
    if (!this._userInstancedBuffersStorage || this._userInstancedBuffersStorage.vertexArrayObjects === undefined) {
        return;
    }
    for (var kind in this._userInstancedBuffersStorage.vertexArrayObjects) {
        this.getEngine().releaseVertexArrayObject(this._userInstancedBuffersStorage.vertexArrayObjects[kind]);
    }
    this._userInstancedBuffersStorage.vertexArrayObjects = {};
};
Mesh.prototype._disposeInstanceSpecificData = function () {
    if (this._instanceDataStorage.instancesBuffer) {
        this._instanceDataStorage.instancesBuffer.dispose();
        this._instanceDataStorage.instancesBuffer = null;
    }
    while (this.instances.length) {
        this.instances[0].dispose();
    }
    for (var kind in this.instancedBuffers) {
        if (this._userInstancedBuffersStorage.vertexBuffers[kind]) {
            this._userInstancedBuffersStorage.vertexBuffers[kind].dispose();
        }
    }
    this._invalidateInstanceVertexArrayObject();
    this.instancedBuffers = {};
};
//# sourceMappingURL=instancedMesh.js.map