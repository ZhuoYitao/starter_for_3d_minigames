import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
/**
 * Block used to get the derivative value on x and y of a given input
 */
var DerivativeBlock = /** @class */ (function (_super) {
    __extends(DerivativeBlock, _super);
    /**
     * Create a new DerivativeBlock
     * @param name defines the block name
     */
    function DerivativeBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this.registerInput("input", NodeMaterialBlockConnectionPointTypes.AutoDetect, false);
        _this.registerOutput("dx", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this.registerOutput("dy", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        _this._outputs[1]._typeConnectionSource = _this._inputs[0];
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    DerivativeBlock.prototype.getClassName = function () {
        return "DerivativeBlock";
    };
    Object.defineProperty(DerivativeBlock.prototype, "input", {
        /**
         * Gets the input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DerivativeBlock.prototype, "dx", {
        /**
         * Gets the derivative output on x
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DerivativeBlock.prototype, "dy", {
        /**
         * Gets the derivative output on y
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    DerivativeBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var dx = this._outputs[0];
        var dy = this._outputs[1];
        state._emitExtension("derivatives", "#extension GL_OES_standard_derivatives : enable");
        if (dx.hasEndpoints) {
            state.compilationString += this._declareOutput(dx, state) + " = dFdx(".concat(this.input.associatedVariableName, ");\r\n");
        }
        if (dy.hasEndpoints) {
            state.compilationString += this._declareOutput(dy, state) + " = dFdy(".concat(this.input.associatedVariableName, ");\r\n");
        }
        return this;
    };
    return DerivativeBlock;
}(NodeMaterialBlock));
export { DerivativeBlock };
RegisterClass("BABYLON.DerivativeBlock", DerivativeBlock);
//# sourceMappingURL=derivativeBlock.js.map