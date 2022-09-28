import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to transform a vector (2, 3 or 4) with a matrix. It will generate a Vector4
 */
var TransformBlock = /** @class */ (function (_super) {
    __extends(TransformBlock, _super);
    /**
     * Creates a new TransformBlock
     * @param name defines the block name
     */
    function TransformBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        /**
         * Defines the value to use to complement W value to transform it to a Vector4
         */
        _this.complementW = 1;
        /**
         * Defines the value to use to complement z value to transform it to a Vector4
         */
        _this.complementZ = 0;
        _this.target = NodeMaterialBlockTargets.Vertex;
        _this.registerInput("vector", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("transform", NodeMaterialBlockConnectionPointTypes.Matrix);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerOutput("xyz", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this._inputs[0].onConnectionObservable.add(function (other) {
            if (other.ownerBlock.isInput) {
                var otherAsInput = other.ownerBlock;
                if (otherAsInput.name === "normal" || otherAsInput.name === "tangent") {
                    _this.complementW = 0;
                }
            }
        });
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    TransformBlock.prototype.getClassName = function () {
        return "TransformBlock";
    };
    Object.defineProperty(TransformBlock.prototype, "vector", {
        /**
         * Gets the vector input
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TransformBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TransformBlock.prototype, "xyz", {
        /**
         * Gets the xyz output component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TransformBlock.prototype, "transform", {
        /**
         * Gets the matrix transform input
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    TransformBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var vector = this.vector;
        var transform = this.transform;
        if (vector.connectedPoint) {
            // None uniform scaling case.
            if (this.complementW === 0) {
                var comments = "//".concat(this.name);
                state._emitFunctionFromInclude("helperFunctions", comments);
                state.sharedData.blocksWithDefines.push(this);
                var transformName = state._getFreeVariableName("".concat(transform.associatedVariableName, "_NUS"));
                state.compilationString += "mat3 ".concat(transformName, " = mat3(").concat(transform.associatedVariableName, ");\r\n");
                state.compilationString += "#ifdef NONUNIFORMSCALING\r\n";
                state.compilationString += "".concat(transformName, " = transposeMat3(inverseMat3(").concat(transformName, "));\r\n");
                state.compilationString += "#endif\r\n";
                switch (vector.connectedPoint.type) {
                    case NodeMaterialBlockConnectionPointTypes.Vector2:
                        state.compilationString +=
                            this._declareOutput(this.output, state) +
                                " = vec4(".concat(transformName, " * vec3(").concat(vector.associatedVariableName, ", ").concat(this._writeFloat(this.complementZ), "), ").concat(this._writeFloat(this.complementW), ");\r\n");
                        break;
                    case NodeMaterialBlockConnectionPointTypes.Vector3:
                    case NodeMaterialBlockConnectionPointTypes.Color3:
                        state.compilationString +=
                            this._declareOutput(this.output, state) + " = vec4(".concat(transformName, " * ").concat(vector.associatedVariableName, ", ").concat(this._writeFloat(this.complementW), ");\r\n");
                        break;
                    default:
                        state.compilationString +=
                            this._declareOutput(this.output, state) +
                                " = vec4(".concat(transformName, " * ").concat(vector.associatedVariableName, ".xyz, ").concat(this._writeFloat(this.complementW), ");\r\n");
                        break;
                }
            }
            else {
                var transformName = transform.associatedVariableName;
                switch (vector.connectedPoint.type) {
                    case NodeMaterialBlockConnectionPointTypes.Vector2:
                        state.compilationString +=
                            this._declareOutput(this.output, state) +
                                " = ".concat(transformName, " * vec4(").concat(vector.associatedVariableName, ", ").concat(this._writeFloat(this.complementZ), ", ").concat(this._writeFloat(this.complementW), ");\r\n");
                        break;
                    case NodeMaterialBlockConnectionPointTypes.Vector3:
                    case NodeMaterialBlockConnectionPointTypes.Color3:
                        state.compilationString +=
                            this._declareOutput(this.output, state) + " = ".concat(transformName, " * vec4(").concat(vector.associatedVariableName, ", ").concat(this._writeFloat(this.complementW), ");\r\n");
                        break;
                    default:
                        state.compilationString += this._declareOutput(this.output, state) + " = ".concat(transformName, " * ").concat(vector.associatedVariableName, ";\r\n");
                        break;
                }
            }
            if (this.xyz.hasEndpoints) {
                state.compilationString += this._declareOutput(this.xyz, state) + " = ".concat(this.output.associatedVariableName, ".xyz;\r\n");
            }
        }
        return this;
    };
    /**
     * Update defines for shader compilation
     * @param mesh defines the mesh to be rendered
     * @param nodeMaterial defines the node material requesting the update
     * @param defines defines the material defines to update
     */
    TransformBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        // Do nothing
        if (mesh.nonUniformScaling) {
            defines.setValue("NONUNIFORMSCALING", true);
        }
    };
    TransformBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.complementZ = this.complementZ;
        serializationObject.complementW = this.complementW;
        return serializationObject;
    };
    TransformBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.complementZ = serializationObject.complementZ !== undefined ? serializationObject.complementZ : 0.0;
        this.complementW = serializationObject.complementW !== undefined ? serializationObject.complementW : 1.0;
    };
    TransformBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this) + "".concat(this._codeVariableName, ".complementZ = ").concat(this.complementZ, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".complementW = ").concat(this.complementW, ";\r\n");
        return codeString;
    };
    return TransformBlock;
}(NodeMaterialBlock));
export { TransformBlock };
RegisterClass("BABYLON.TransformBlock", TransformBlock);
//# sourceMappingURL=transformBlock.js.map