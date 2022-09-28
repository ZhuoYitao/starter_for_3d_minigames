import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
/**
 * Block used for the particle blend multiply section
 */
var ParticleBlendMultiplyBlock = /** @class */ (function (_super) {
    __extends(ParticleBlendMultiplyBlock, _super);
    /**
     * Create a new ParticleBlendMultiplyBlock
     * @param name defines the block name
     */
    function ParticleBlendMultiplyBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this._isUnique = true;
        _this.registerInput("color", NodeMaterialBlockConnectionPointTypes.Color4, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("alphaTexture", NodeMaterialBlockConnectionPointTypes.Float, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("alphaColor", NodeMaterialBlockConnectionPointTypes.Float, false, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("blendColor", NodeMaterialBlockConnectionPointTypes.Color4, NodeMaterialBlockTargets.Fragment);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ParticleBlendMultiplyBlock.prototype.getClassName = function () {
        return "ParticleBlendMultiplyBlock";
    };
    Object.defineProperty(ParticleBlendMultiplyBlock.prototype, "color", {
        /**
         * Gets the color input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleBlendMultiplyBlock.prototype, "alphaTexture", {
        /**
         * Gets the alphaTexture input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleBlendMultiplyBlock.prototype, "alphaColor", {
        /**
         * Gets the alphaColor input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleBlendMultiplyBlock.prototype, "blendColor", {
        /**
         * Gets the blendColor output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    ParticleBlendMultiplyBlock.prototype.initialize = function (state) {
        state._excludeVariableName("sourceAlpha");
    };
    ParticleBlendMultiplyBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        if (state.target === NodeMaterialBlockTargets.Vertex) {
            return;
        }
        state.compilationString += "\n            #ifdef BLENDMULTIPLYMODE\n                ".concat(this._declareOutput(this.blendColor, state), ";\n                float sourceAlpha = ").concat(this.alphaColor.associatedVariableName, " * ").concat(this.alphaTexture.associatedVariableName, ";\n                ").concat(this.blendColor.associatedVariableName, ".rgb = ").concat(this.color.associatedVariableName, ".rgb * sourceAlpha + vec3(1.0) * (1.0 - sourceAlpha);\n                ").concat(this.blendColor.associatedVariableName, ".a = ").concat(this.color.associatedVariableName, ".a;\n            #else\n                ").concat(this._declareOutput(this.blendColor, state), " = ").concat(this.color.associatedVariableName, ";\n            #endif\n        ");
        return this;
    };
    return ParticleBlendMultiplyBlock;
}(NodeMaterialBlock));
export { ParticleBlendMultiplyBlock };
RegisterClass("BABYLON.ParticleBlendMultiplyBlock", ParticleBlendMultiplyBlock);
//# sourceMappingURL=particleBlendMultiplyBlock.js.map