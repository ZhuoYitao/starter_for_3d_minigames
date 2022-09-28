import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to normalize a vector
 */
var NormalizeBlock = /** @class */ (function (_super) {
    __extends(NormalizeBlock, _super);
    /**
     * Creates a new NormalizeBlock
     * @param name defines the block name
     */
    function NormalizeBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("input", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        _this._inputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Float);
        _this._inputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Matrix);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    NormalizeBlock.prototype.getClassName = function () {
        return "NormalizeBlock";
    };
    Object.defineProperty(NormalizeBlock.prototype, "input", {
        /**
         * Gets the input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NormalizeBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    NormalizeBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        var input = this._inputs[0];
        state.compilationString += this._declareOutput(output, state) + " = normalize(".concat(input.associatedVariableName, ");\r\n");
        return this;
    };
    return NormalizeBlock;
}(NodeMaterialBlock));
export { NormalizeBlock };
RegisterClass("BABYLON.NormalizeBlock", NormalizeBlock);
//# sourceMappingURL=normalizeBlock.js.map