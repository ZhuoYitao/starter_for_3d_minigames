import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to get the value of the first parameter raised to the power of the second
 */
var PowBlock = /** @class */ (function (_super) {
    __extends(PowBlock, _super);
    /**
     * Creates a new PowBlock
     * @param name defines the block name
     */
    function PowBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("value", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("power", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        _this._linkConnectionTypes(0, 1);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    PowBlock.prototype.getClassName = function () {
        return "PowBlock";
    };
    Object.defineProperty(PowBlock.prototype, "value", {
        /**
         * Gets the value operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PowBlock.prototype, "power", {
        /**
         * Gets the power operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PowBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    PowBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = pow(".concat(this.value.associatedVariableName, ", ").concat(this.power.associatedVariableName, ");\r\n");
        return this;
    };
    return PowBlock;
}(NodeMaterialBlock));
export { PowBlock };
RegisterClass("BABYLON.PowBlock", PowBlock);
//# sourceMappingURL=powBlock.js.map