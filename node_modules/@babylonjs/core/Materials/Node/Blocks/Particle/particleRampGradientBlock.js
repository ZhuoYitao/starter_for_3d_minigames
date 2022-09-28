import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
/**
 * Block used for the particle ramp gradient section
 */
var ParticleRampGradientBlock = /** @class */ (function (_super) {
    __extends(ParticleRampGradientBlock, _super);
    /**
     * Create a new ParticleRampGradientBlock
     * @param name defines the block name
     */
    function ParticleRampGradientBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this._isUnique = true;
        _this.registerInput("color", NodeMaterialBlockConnectionPointTypes.Color4, false, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("rampColor", NodeMaterialBlockConnectionPointTypes.Color4, NodeMaterialBlockTargets.Fragment);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ParticleRampGradientBlock.prototype.getClassName = function () {
        return "ParticleRampGradientBlock";
    };
    Object.defineProperty(ParticleRampGradientBlock.prototype, "color", {
        /**
         * Gets the color input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleRampGradientBlock.prototype, "rampColor", {
        /**
         * Gets the rampColor output component
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
    ParticleRampGradientBlock.prototype.initialize = function (state) {
        state._excludeVariableName("remapRanges");
        state._excludeVariableName("rampSampler");
        state._excludeVariableName("baseColor");
        state._excludeVariableName("alpha");
        state._excludeVariableName("remappedColorIndex");
        state._excludeVariableName("rampColor");
        state._excludeVariableName("finalAlpha");
    };
    ParticleRampGradientBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        if (state.target === NodeMaterialBlockTargets.Vertex) {
            return;
        }
        state._emit2DSampler("rampSampler");
        state._emitVaryingFromString("remapRanges", "vec4", "RAMPGRADIENT");
        state.compilationString += "\n            #ifdef RAMPGRADIENT\n                vec4 baseColor = ".concat(this.color.associatedVariableName, ";\n                float alpha = ").concat(this.color.associatedVariableName, ".a;\n\n                float remappedColorIndex = clamp((alpha - remapRanges.x) / remapRanges.y, 0.0, 1.0);\n\n                vec4 rampColor = texture2D(rampSampler, vec2(1.0 - remappedColorIndex, 0.));\n                baseColor.rgb *= rampColor.rgb;\n\n                // Remapped alpha\n                float finalAlpha = baseColor.a;\n                baseColor.a = clamp((alpha * rampColor.a - remapRanges.z) / remapRanges.w, 0.0, 1.0);\n\n                ").concat(this._declareOutput(this.rampColor, state), " = baseColor;\n            #else\n                ").concat(this._declareOutput(this.rampColor, state), " = ").concat(this.color.associatedVariableName, ";\n            #endif\n        ");
        return this;
    };
    return ParticleRampGradientBlock;
}(NodeMaterialBlock));
export { ParticleRampGradientBlock };
RegisterClass("BABYLON.ParticleRampGradientBlock", ParticleRampGradientBlock);
//# sourceMappingURL=particleRampGradientBlock.js.map