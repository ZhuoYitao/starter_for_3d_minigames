import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to get the length of a vector
 */
var LengthBlock = /** @class */ (function (_super) {
    __extends(LengthBlock, _super);
    /**
     * Creates a new LengthBlock
     * @param name defines the block name
     */
    function LengthBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("value", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Float);
        _this._inputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Float);
        _this._inputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Matrix);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    LengthBlock.prototype.getClassName = function () {
        return "LengthBlock";
    };
    Object.defineProperty(LengthBlock.prototype, "value", {
        /**
         * Gets the value input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LengthBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    LengthBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = length(".concat(this.value.associatedVariableName, ");\r\n");
        return this;
    };
    return LengthBlock;
}(NodeMaterialBlock));
export { LengthBlock };
RegisterClass("BABYLON.LengthBlock", LengthBlock);
//# sourceMappingURL=lengthBlock.js.map