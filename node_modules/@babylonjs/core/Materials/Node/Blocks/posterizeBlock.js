import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to posterize a value
 * @see https://en.wikipedia.org/wiki/Posterization
 */
var PosterizeBlock = /** @class */ (function (_super) {
    __extends(PosterizeBlock, _super);
    /**
     * Creates a new PosterizeBlock
     * @param name defines the block name
     */
    function PosterizeBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("value", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("steps", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        _this._linkConnectionTypes(0, 1);
        _this._inputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Matrix);
        _this._inputs[1].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Matrix);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    PosterizeBlock.prototype.getClassName = function () {
        return "PosterizeBlock";
    };
    Object.defineProperty(PosterizeBlock.prototype, "value", {
        /**
         * Gets the value input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PosterizeBlock.prototype, "steps", {
        /**
         * Gets the steps input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PosterizeBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    PosterizeBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString +=
            this._declareOutput(output, state) +
                " = floor(".concat(this.value.associatedVariableName, " / (1.0 / ").concat(this.steps.associatedVariableName, ")) * (1.0 / ").concat(this.steps.associatedVariableName, ");\r\n");
        return this;
    };
    return PosterizeBlock;
}(NodeMaterialBlock));
export { PosterizeBlock };
RegisterClass("BABYLON.PosterizeBlock", PosterizeBlock);
//# sourceMappingURL=posterizeBlock.js.map