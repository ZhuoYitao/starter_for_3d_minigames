import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to step a value
 */
var StepBlock = /** @class */ (function (_super) {
    __extends(StepBlock, _super);
    /**
     * Creates a new StepBlock
     * @param name defines the block name
     */
    function StepBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("value", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerInput("edge", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Float);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    StepBlock.prototype.getClassName = function () {
        return "StepBlock";
    };
    Object.defineProperty(StepBlock.prototype, "value", {
        /**
         * Gets the value operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StepBlock.prototype, "edge", {
        /**
         * Gets the edge operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StepBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    StepBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = step(".concat(this.edge.associatedVariableName, ", ").concat(this.value.associatedVariableName, ");\r\n");
        return this;
    };
    return StepBlock;
}(NodeMaterialBlock));
export { StepBlock };
RegisterClass("BABYLON.StepBlock", StepBlock);
//# sourceMappingURL=stepBlock.js.map