import { __extends } from "tslib";
import { Color3, Color4 } from "../Maths/math.color.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Mesh } from "../Meshes/mesh.js";
import { InstancedMesh } from "../Meshes/instancedMesh.js";
import { Material } from "../Materials/material.js";
import { ShaderMaterial } from "../Materials/shaderMaterial.js";
import "../Shaders/color.fragment.js";
import "../Shaders/color.vertex.js";
Mesh._LinesMeshParser = function (parsedMesh, scene) {
    return LinesMesh.Parse(parsedMesh, scene);
};
/**
 * Line mesh
 * @see https://doc.babylonjs.com/babylon101/parametric_shapes
 */
var LinesMesh = /** @class */ (function (_super) {
    __extends(LinesMesh, _super);
    /**
     * Creates a new LinesMesh
     * @param name defines the name
     * @param scene defines the hosting scene
     * @param parent defines the parent mesh if any
     * @param source defines the optional source LinesMesh used to clone data from
     * @param doNotCloneChildren When cloning, skip cloning child meshes of source, default False.
     * When false, achieved by calling a clone(), also passing False.
     * This will make creation of children, recursive.
     * @param useVertexColor defines if this LinesMesh supports vertex color
     * @param useVertexAlpha defines if this LinesMesh supports vertex alpha
     * @param material material to use to draw the line. If not provided, will create a new one
     */
    function LinesMesh(name, scene, parent, source, doNotCloneChildren, 
    /**
     * If vertex color should be applied to the mesh
     */
    useVertexColor, 
    /**
     * If vertex alpha should be applied to the mesh
     */
    useVertexAlpha, material) {
        if (scene === void 0) { scene = null; }
        if (parent === void 0) { parent = null; }
        if (source === void 0) { source = null; }
        var _this = _super.call(this, name, scene, parent, source, doNotCloneChildren) || this;
        _this.useVertexColor = useVertexColor;
        _this.useVertexAlpha = useVertexAlpha;
        /**
         * Color of the line (Default: White)
         */
        _this.color = new Color3(1, 1, 1);
        /**
         * Alpha of the line (Default: 1)
         */
        _this.alpha = 1;
        if (source) {
            _this.color = source.color.clone();
            _this.alpha = source.alpha;
            _this.useVertexColor = source.useVertexColor;
            _this.useVertexAlpha = source.useVertexAlpha;
        }
        _this.intersectionThreshold = 0.1;
        var defines = [];
        var options = {
            attributes: [VertexBuffer.PositionKind],
            uniforms: ["vClipPlane", "vClipPlane2", "vClipPlane3", "vClipPlane4", "vClipPlane5", "vClipPlane6", "world", "viewProjection"],
            needAlphaBlending: true,
            defines: defines,
            useClipPlane: null,
        };
        if (useVertexAlpha === false) {
            options.needAlphaBlending = false;
        }
        if (!useVertexColor) {
            options.uniforms.push("color");
            _this._color4 = new Color4();
        }
        else {
            options.defines.push("#define VERTEXCOLOR");
            options.attributes.push(VertexBuffer.ColorKind);
        }
        if (material) {
            _this.material = material;
        }
        else {
            _this.material = new ShaderMaterial("colorShader", _this.getScene(), "color", options, false);
        }
        return _this;
    }
    LinesMesh.prototype._isShaderMaterial = function (shader) {
        return shader.getClassName() === "ShaderMaterial";
    };
    LinesMesh.prototype.isReady = function () {
        if (!this._lineMaterial.isReady(this, !!this._userInstancedBuffersStorage)) {
            return false;
        }
        return _super.prototype.isReady.call(this);
    };
    /**
     * Returns the string "LineMesh"
     */
    LinesMesh.prototype.getClassName = function () {
        return "LinesMesh";
    };
    Object.defineProperty(LinesMesh.prototype, "material", {
        /**
         * @hidden
         */
        get: function () {
            return this._lineMaterial;
        },
        /**
         * @hidden
         */
        set: function (value) {
            this._lineMaterial = value;
            this._lineMaterial.fillMode = Material.LineListDrawMode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LinesMesh.prototype, "checkCollisions", {
        /**
         * @hidden
         */
        get: function () {
            return false;
        },
        set: function (value) {
            // Just ignore it
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @hidden
     */
    LinesMesh.prototype._bind = function () {
        if (!this._geometry) {
            return this;
        }
        var colorEffect = this._lineMaterial.getEffect();
        // VBOs
        var indexToBind = this.isUnIndexed ? null : this._geometry.getIndexBuffer();
        if (!this._userInstancedBuffersStorage) {
            this._geometry._bind(colorEffect, indexToBind);
        }
        else {
            this._geometry._bind(colorEffect, indexToBind, this._userInstancedBuffersStorage.vertexBuffers, this._userInstancedBuffersStorage.vertexArrayObjects);
        }
        // Color
        if (!this.useVertexColor && this._isShaderMaterial(this._lineMaterial)) {
            var _a = this.color, r = _a.r, g = _a.g, b = _a.b;
            this._color4.set(r, g, b, this.alpha);
            this._lineMaterial.setColor4("color", this._color4);
        }
        return this;
    };
    /**
     * @param subMesh
     * @param fillMode
     * @param instancesCount
     * @hidden
     */
    LinesMesh.prototype._draw = function (subMesh, fillMode, instancesCount) {
        if (!this._geometry || !this._geometry.getVertexBuffers() || (!this._unIndexed && !this._geometry.getIndexBuffer())) {
            return this;
        }
        var engine = this.getScene().getEngine();
        // Draw order
        if (this._unIndexed) {
            engine.drawArraysType(Material.LineListDrawMode, subMesh.verticesStart, subMesh.verticesCount, instancesCount);
        }
        else {
            engine.drawElementsType(Material.LineListDrawMode, subMesh.indexStart, subMesh.indexCount, instancesCount);
        }
        return this;
    };
    /**
     * Disposes of the line mesh
     * @param doNotRecurse If children should be disposed
     */
    LinesMesh.prototype.dispose = function (doNotRecurse) {
        this._lineMaterial.dispose(false, false, true);
        _super.prototype.dispose.call(this, doNotRecurse);
    };
    /**
     * Returns a new LineMesh object cloned from the current one.
     * @param name
     * @param newParent
     * @param doNotCloneChildren
     */
    LinesMesh.prototype.clone = function (name, newParent, doNotCloneChildren) {
        if (newParent === void 0) { newParent = null; }
        return new LinesMesh(name, this.getScene(), newParent, this, doNotCloneChildren);
    };
    /**
     * Creates a new InstancedLinesMesh object from the mesh model.
     * @see https://doc.babylonjs.com/divingDeeper/mesh/copies/instances
     * @param name defines the name of the new instance
     * @returns a new InstancedLinesMesh
     */
    LinesMesh.prototype.createInstance = function (name) {
        var instance = new InstancedLinesMesh(name, this);
        if (this.instancedBuffers) {
            instance.instancedBuffers = {};
            for (var key in this.instancedBuffers) {
                instance.instancedBuffers[key] = this.instancedBuffers[key];
            }
        }
        return instance;
    };
    /**
     * Serializes this ground mesh
     * @param serializationObject object to write serialization to
     */
    LinesMesh.prototype.serialize = function (serializationObject) {
        _super.prototype.serialize.call(this, serializationObject);
        serializationObject.color = this.color.asArray();
        serializationObject.alpha = this.alpha;
    };
    /**
     * Parses a serialized ground mesh
     * @param parsedMesh the serialized mesh
     * @param scene the scene to create the ground mesh in
     * @returns the created ground mesh
     */
    LinesMesh.Parse = function (parsedMesh, scene) {
        var result = new LinesMesh(parsedMesh.name, scene);
        result.color = Color3.FromArray(parsedMesh.color);
        result.alpha = parsedMesh.alpha;
        return result;
    };
    return LinesMesh;
}(Mesh));
export { LinesMesh };
/**
 * Creates an instance based on a source LinesMesh
 */
var InstancedLinesMesh = /** @class */ (function (_super) {
    __extends(InstancedLinesMesh, _super);
    function InstancedLinesMesh(name, source) {
        var _this = _super.call(this, name, source) || this;
        _this.intersectionThreshold = source.intersectionThreshold;
        return _this;
    }
    /**
     * Returns the string "InstancedLinesMesh".
     */
    InstancedLinesMesh.prototype.getClassName = function () {
        return "InstancedLinesMesh";
    };
    return InstancedLinesMesh;
}(InstancedMesh));
export { InstancedLinesMesh };
//# sourceMappingURL=linesMesh.js.map