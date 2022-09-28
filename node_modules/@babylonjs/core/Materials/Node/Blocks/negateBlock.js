import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to get negative version of a value (i.e. x * -1)
 */
var NegateBlock = /** @class */ (function (_super) {
    __extends(NegateBlock, _super);
    /**
     * Creates a new NegateBlock
     * @param name defines the block name
     */
    function NegateBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("value", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    NegateBlock.prototype.getClassName = function () {
        return "NegateBlock";
    };
    Object.defineProperty(NegateBlock.prototype, "value", {
        /**
         * Gets the value input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NegateBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    NegateBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = -1.0 * ".concat(this.value.associatedVariableName, ";\r\n");
        return this;
    };
    return NegateBlock;
}(NodeMaterialBlock));
export { NegateBlock };
RegisterClass("BABYLON.NegateBlock", NegateBlock);
//# sourceMappingURL=negateBlock.js.map