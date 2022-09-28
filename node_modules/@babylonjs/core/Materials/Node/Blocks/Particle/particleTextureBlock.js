import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { InputBlock } from "../Input/inputBlock.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { Texture } from "../../../Textures/texture.js";
/**
 * Base block used for the particle texture
 */
var ParticleTextureBlock = /** @class */ (function (_super) {
    __extends(ParticleTextureBlock, _super);
    /**
     * Create a new ParticleTextureBlock
     * @param name defines the block name
     */
    function ParticleTextureBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this._samplerName = "diffuseSampler";
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
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ParticleTextureBlock.prototype.getClassName = function () {
        return "ParticleTextureBlock";
    };
    Object.defineProperty(ParticleTextureBlock.prototype, "uv", {
        /**
         * Gets the uv input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleTextureBlock.prototype, "rgba", {
        /**
         * Gets the rgba output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleTextureBlock.prototype, "rgb", {
        /**
         * Gets the rgb output component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleTextureBlock.prototype, "r", {
        /**
         * Gets the r output component
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleTextureBlock.prototype, "g", {
        /**
         * Gets the g output component
         */
        get: function () {
            return this._outputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleTextureBlock.prototype, "b", {
        /**
         * Gets the b output component
         */
        get: function () {
            return this._outputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleTextureBlock.prototype, "a", {
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
    ParticleTextureBlock.prototype.initialize = function (state) {
        state._excludeVariableName("diffuseSampler");
    };
    ParticleTextureBlock.prototype.autoConfigure = function (material) {
        if (!this.uv.isConnected) {
            var uvInput = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "particle_uv"; });
            if (!uvInput) {
                uvInput = new InputBlock("uv");
                uvInput.setAsAttribute("particle_uv");
            }
            uvInput.output.connectTo(this.uv);
        }
    };
    ParticleTextureBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        defines.setValue(this._linearDefineName, this.convertToGammaSpace, true);
        defines.setValue(this._gammaDefineName, this.convertToLinearSpace, true);
    };
    ParticleTextureBlock.prototype.isReady = function () {
        if (this.texture && !this.texture.isReadyOrNotBlocking()) {
            return false;
        }
        return true;
    };
    ParticleTextureBlock.prototype._writeOutput = function (state, output, swizzle) {
        state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(this._tempTextureRead, ".").concat(swizzle, ";\r\n");
        state.compilationString += "#ifdef ".concat(this._linearDefineName, "\r\n");
        state.compilationString += "".concat(output.associatedVariableName, " = toGammaSpace(").concat(output.associatedVariableName, ");\r\n");
        state.compilationString += "#endif\r\n";
        state.compilationString += "#ifdef ".concat(this._gammaDefineName, "\r\n");
        state.compilationString += "".concat(output.associatedVariableName, " = toLinearSpace(").concat(output.associatedVariableName, ");\r\n");
        state.compilationString += "#endif\r\n";
    };
    ParticleTextureBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        if (state.target === NodeMaterialBlockTargets.Vertex) {
            return;
        }
        this._tempTextureRead = state._getFreeVariableName("tempTextureRead");
        state._emit2DSampler(this._samplerName);
        state.sharedData.blockingBlocks.push(this);
        state.sharedData.textureBlocks.push(this);
        state.sharedData.blocksWithDefines.push(this);
        this._linearDefineName = state._getFreeDefineName("ISLINEAR");
        this._gammaDefineName = state._getFreeDefineName("ISGAMMA");
        var comments = "//".concat(this.name);
        state._emitFunctionFromInclude("helperFunctions", comments);
        state.compilationString += "vec4 ".concat(this._tempTextureRead, " = texture2D(").concat(this._samplerName, ", ").concat(this.uv.associatedVariableName, ");\r\n");
        for (var _i = 0, _a = this._outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.hasEndpoints) {
                this._writeOutput(state, output, output.name);
            }
        }
        return this;
    };
    ParticleTextureBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.convertToGammaSpace = this.convertToGammaSpace;
        serializationObject.convertToLinearSpace = this.convertToLinearSpace;
        if (this.texture && !this.texture.isRenderTarget) {
            serializationObject.texture = this.texture.serialize();
        }
        return serializationObject;
    };
    ParticleTextureBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.convertToGammaSpace = serializationObject.convertToGammaSpace;
        this.convertToLinearSpace = !!serializationObject.convertToLinearSpace;
        if (serializationObject.texture) {
            rootUrl = serializationObject.texture.url.indexOf("data:") === 0 ? "" : rootUrl;
            this.texture = Texture.Parse(serializationObject.texture, scene, rootUrl);
        }
    };
    return ParticleTextureBlock;
}(NodeMaterialBlock));
export { ParticleTextureBlock };
RegisterClass("BABYLON.ParticleTextureBlock", ParticleTextureBlock);
//# sourceMappingURL=particleTextureBlock.js.map