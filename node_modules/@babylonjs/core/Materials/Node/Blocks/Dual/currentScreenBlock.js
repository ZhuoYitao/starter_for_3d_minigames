import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { Texture } from "../../../Textures/texture.js";
/**
 * Base block used as input for post process
 */
var CurrentScreenBlock = /** @class */ (function (_super) {
    __extends(CurrentScreenBlock, _super);
    /**
     * Create a new CurrentScreenBlock
     * @param name defines the block name
     */
    function CurrentScreenBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.VertexAndFragment) || this;
        _this._samplerName = "textureSampler";
        /**
         * Gets or sets a boolean indicating if content needs to be converted to gamma space
         */
        _this.convertToGammaSpace = false;
        /**
         * Gets or sets a boolean indicating if content needs to be converted to linear space
         */
        _this.convertToLinearSpace = false;
        _this._isUnique = false;
        _this.registerInput("uv", NodeMaterialBlockConnectionPointTypes.Vector2, false, NodeMaterialBlockTargets.VertexAndFragment);
        _this.registerOutput("rgba", NodeMaterialBlockConnectionPointTypes.Color4, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("rgb", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("r", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("g", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("b", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("a", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Neutral);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        _this._inputs[0]._prioritizeVertex = false;
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    CurrentScreenBlock.prototype.getClassName = function () {
        return "CurrentScreenBlock";
    };
    Object.defineProperty(CurrentScreenBlock.prototype, "uv", {
        /**
         * Gets the uv input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CurrentScreenBlock.prototype, "rgba", {
        /**
         * Gets the rgba output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CurrentScreenBlock.prototype, "rgb", {
        /**
         * Gets the rgb output component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CurrentScreenBlock.prototype, "r", {
        /**
         * Gets the r output component
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CurrentScreenBlock.prototype, "g", {
        /**
         * Gets the g output component
         */
        get: function () {
            return this._outputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CurrentScreenBlock.prototype, "b", {
        /**
         * Gets the b output component
         */
        get: function () {
            return this._outputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CurrentScreenBlock.prototype, "a", {
        /**
         * Gets the a output component
         */
        get: function () {
            return this._outputs[5];
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    CurrentScreenBlock.prototype.initialize = function (state) {
        state._excludeVariableName("textureSampler");
    };
    Object.defineProperty(CurrentScreenBlock.prototype, "target", {
        get: function () {
            if (!this.uv.isConnected) {
                return NodeMaterialBlockTargets.VertexAndFragment;
            }
            if (this.uv.sourceBlock.isInput) {
                return NodeMaterialBlockTargets.VertexAndFragment;
            }
            return NodeMaterialBlockTargets.Fragment;
        },
        enumerable: false,
        configurable: true
    });
    CurrentScreenBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        defines.setValue(this._linearDefineName, this.convertToGammaSpace, true);
        defines.setValue(this._gammaDefineName, this.convertToLinearSpace, true);
    };
    CurrentScreenBlock.prototype.isReady = function () {
        if (this.texture && !this.texture.isReadyOrNotBlocking()) {
            return false;
        }
        return true;
    };
    CurrentScreenBlock.prototype._injectVertexCode = function (state) {
        var uvInput = this.uv;
        if (uvInput.connectedPoint.ownerBlock.isInput) {
            var uvInputOwnerBlock = uvInput.connectedPoint.ownerBlock;
            if (!uvInputOwnerBlock.isAttribute) {
                state._emitUniformFromString(uvInput.associatedVariableName, "vec2");
            }
        }
        this._mainUVName = "vMain" + uvInput.associatedVariableName;
        state._emitVaryingFromString(this._mainUVName, "vec2");
        state.compilationString += "".concat(this._mainUVName, " = ").concat(uvInput.associatedVariableName, ".xy;\r\n");
        if (!this._outputs.some(function (o) { return o.isConnectedInVertexShader; })) {
            return;
        }
        this._writeTextureRead(state, true);
        for (var _i = 0, _a = this._outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.hasEndpoints) {
                this._writeOutput(state, output, output.name, true);
            }
        }
    };
    CurrentScreenBlock.prototype._writeTextureRead = function (state, vertexMode) {
        if (vertexMode === void 0) { vertexMode = false; }
        var uvInput = this.uv;
        if (vertexMode) {
            if (state.target === NodeMaterialBlockTargets.Fragment) {
                return;
            }
            state.compilationString += "vec4 ".concat(this._tempTextureRead, " = texture2D(").concat(this._samplerName, ", ").concat(uvInput.associatedVariableName, ");\r\n");
            return;
        }
        if (this.uv.ownerBlock.target === NodeMaterialBlockTargets.Fragment) {
            state.compilationString += "vec4 ".concat(this._tempTextureRead, " = texture2D(").concat(this._samplerName, ", ").concat(uvInput.associatedVariableName, ");\r\n");
            return;
        }
        state.compilationString += "vec4 ".concat(this._tempTextureRead, " = texture2D(").concat(this._samplerName, ", ").concat(this._mainUVName, ");\r\n");
    };
    CurrentScreenBlock.prototype._writeOutput = function (state, output, swizzle, vertexMode) {
        if (vertexMode === void 0) { vertexMode = false; }
        if (vertexMode) {
            if (state.target === NodeMaterialBlockTargets.Fragment) {
                return;
            }
            state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(this._tempTextureRead, ".").concat(swizzle, ";\r\n");
            return;
        }
        if (this.uv.ownerBlock.target === NodeMaterialBlockTargets.Fragment) {
            state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(this._tempTextureRead, ".").concat(swizzle, ";\r\n");
            return;
        }
        state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(this._tempTextureRead, ".").concat(swizzle, ";\r\n");
        state.compilationString += "#ifdef ".concat(this._linearDefineName, "\r\n");
        state.compilationString += "".concat(output.associatedVariableName, " = toGammaSpace(").concat(output.associatedVariableName, ");\r\n");
        state.compilationString += "#endif\r\n";
        state.compilationString += "#ifdef ".concat(this._gammaDefineName, "\r\n");
        state.compilationString += "".concat(output.associatedVariableName, " = toLinearSpace(").concat(output.associatedVariableName, ");\r\n");
        state.compilationString += "#endif\r\n";
    };
    CurrentScreenBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        this._tempTextureRead = state._getFreeVariableName("tempTextureRead");
        if (state.sharedData.blockingBlocks.indexOf(this) < 0) {
            state.sharedData.blockingBlocks.push(this);
        }
        if (state.sharedData.textureBlocks.indexOf(this) < 0) {
            state.sharedData.textureBlocks.push(this);
        }
        if (state.sharedData.blocksWithDefines.indexOf(this) < 0) {
            state.sharedData.blocksWithDefines.push(this);
        }
        if (state.target !== NodeMaterialBlockTargets.Fragment) {
            // Vertex
            state._emit2DSampler(this._samplerName);
            this._injectVertexCode(state);
            return;
        }
        // Fragment
        if (!this._outputs.some(function (o) { return o.isConnectedInFragmentShader; })) {
            return;
        }
        state._emit2DSampler(this._samplerName);
        this._linearDefineName = state._getFreeDefineName("ISLINEAR");
        this._gammaDefineName = state._getFreeDefineName("ISGAMMA");
        var comments = "//".concat(this.name);
        state._emitFunctionFromInclude("helperFunctions", comments);
        this._writeTextureRead(state);
        for (var _i = 0, _a = this._outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.hasEndpoints) {
                this._writeOutput(state, output, output.name);
            }
        }
        return this;
    };
    CurrentScreenBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.convertToGammaSpace = this.convertToGammaSpace;
        serializationObject.convertToLinearSpace = this.convertToLinearSpace;
        if (this.texture && !this.texture.isRenderTarget) {
            serializationObject.texture = this.texture.serialize();
        }
        return serializationObject;
    };
    CurrentScreenBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.convertToGammaSpace = serializationObject.convertToGammaSpace;
        this.convertToLinearSpace = !!serializationObject.convertToLinearSpace;
        if (serializationObject.texture) {
            rootUrl = serializationObject.texture.url.indexOf("data:") === 0 ? "" : rootUrl;
            this.texture = Texture.Parse(serializationObject.texture, scene, rootUrl);
        }
    };
    return CurrentScreenBlock;
}(NodeMaterialBlock));
export { CurrentScreenBlock };
RegisterClass("BABYLON.CurrentScreenBlock", CurrentScreenBlock);
//# sourceMappingURL=currentScreenBlock.js.map