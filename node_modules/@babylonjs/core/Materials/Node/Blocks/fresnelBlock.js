import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import { InputBlock } from "./Input/inputBlock.js";
import "../../../Shaders/ShadersInclude/fresnelFunction.js";
import { ViewDirectionBlock } from "./viewDirectionBlock.js";
/**
 * Block used to compute fresnel value
 */
var FresnelBlock = /** @class */ (function (_super) {
    __extends(FresnelBlock, _super);
    /**
     * Create a new FresnelBlock
     * @param name defines the block name
     */
    function FresnelBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("worldNormal", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerInput("viewDirection", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("bias", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerInput("power", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("fresnel", NodeMaterialBlockConnectionPointTypes.Float);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    FresnelBlock.prototype.getClassName = function () {
        return "FresnelBlock";
    };
    Object.defineProperty(FresnelBlock.prototype, "worldNormal", {
        /**
         * Gets the world normal input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FresnelBlock.prototype, "viewDirection", {
        /**
         * Gets the view direction input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FresnelBlock.prototype, "bias", {
        /**
         * Gets the bias input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FresnelBlock.prototype, "power", {
        /**
         * Gets the camera (or eye) position component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FresnelBlock.prototype, "fresnel", {
        /**
         * Gets the fresnel output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    FresnelBlock.prototype.autoConfigure = function (material) {
        if (!this.viewDirection.isConnected) {
            var viewDirectionInput = new ViewDirectionBlock("View direction");
            viewDirectionInput.output.connectTo(this.viewDirection);
            viewDirectionInput.autoConfigure(material);
        }
        if (!this.bias.isConnected) {
            var biasInput = new InputBlock("bias");
            biasInput.value = 0;
            biasInput.output.connectTo(this.bias);
        }
        if (!this.power.isConnected) {
            var powerInput = new InputBlock("power");
            powerInput.value = 1;
            powerInput.output.connectTo(this.power);
        }
    };
    FresnelBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var comments = "//".concat(this.name);
        state._emitFunctionFromInclude("fresnelFunction", comments, { removeIfDef: true });
        state.compilationString +=
            this._declareOutput(this.fresnel, state) +
                " = computeFresnelTerm(".concat(this.viewDirection.associatedVariableName, ".xyz, ").concat(this.worldNormal.associatedVariableName, ".xyz, ").concat(this.bias.associatedVariableName, ", ").concat(this.power.associatedVariableName, ");\r\n");
        return this;
    };
    return FresnelBlock;
}(NodeMaterialBlock));
export { FresnelBlock };
RegisterClass("BABYLON.FresnelBlock", FresnelBlock);
//# sourceMappingURL=fresnelBlock.js.map