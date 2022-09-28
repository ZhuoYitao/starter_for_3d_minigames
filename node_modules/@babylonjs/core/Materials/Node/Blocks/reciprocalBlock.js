import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to get the reciprocal (1 / x) of a value
 */
var ReciprocalBlock = /** @class */ (function (_super) {
    __extends(ReciprocalBlock, _super);
    /**
     * Creates a new ReciprocalBlock
     * @param name defines the block name
     */
    function ReciprocalBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("input", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        _this._outputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Matrix);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ReciprocalBlock.prototype.getClassName = function () {
        return "ReciprocalBlock";
    };
    Object.defineProperty(ReciprocalBlock.prototype, "input", {
        /**
         * Gets the input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReciprocalBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    ReciprocalBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = 1. / ".concat(this.input.associatedVariableName, ";\r\n");
        return this;
    };
    return ReciprocalBlock;
}(NodeMaterialBlock));
export { ReciprocalBlock };
RegisterClass("BABYLON.ReciprocalBlock", ReciprocalBlock);
//# sourceMappingURL=reciprocalBlock.js.map