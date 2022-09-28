import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to smooth step a value
 */
var SmoothStepBlock = /** @class */ (function (_super) {
    __extends(SmoothStepBlock, _super);
    /**
     * Creates a new SmoothStepBlock
     * @param name defines the block name
     */
    function SmoothStepBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("value", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("edge0", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerInput("edge1", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    SmoothStepBlock.prototype.getClassName = function () {
        return "SmoothStepBlock";
    };
    Object.defineProperty(SmoothStepBlock.prototype, "value", {
        /**
         * Gets the value operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SmoothStepBlock.prototype, "edge0", {
        /**
         * Gets the first edge operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SmoothStepBlock.prototype, "edge1", {
        /**
         * Gets the second edge operand input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SmoothStepBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    SmoothStepBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString +=
            this._declareOutput(output, state) +
                " = smoothstep(".concat(this.edge0.associatedVariableName, ", ").concat(this.edge1.associatedVariableName, ", ").concat(this.value.associatedVariableName, ");\r\n");
        return this;
    };
    return SmoothStepBlock;
}(NodeMaterialBlock));
export { SmoothStepBlock };
RegisterClass("BABYLON.SmoothStepBlock", SmoothStepBlock);
//# sourceMappingURL=smoothStepBlock.js.map