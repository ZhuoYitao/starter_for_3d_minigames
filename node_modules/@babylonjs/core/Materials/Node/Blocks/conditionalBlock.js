import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Operations supported by the ConditionalBlock block
 */
export var ConditionalBlockConditions;
(function (ConditionalBlockConditions) {
    /** Equal */
    ConditionalBlockConditions[ConditionalBlockConditions["Equal"] = 0] = "Equal";
    /** NotEqual */
    ConditionalBlockConditions[ConditionalBlockConditions["NotEqual"] = 1] = "NotEqual";
    /** LessThan */
    ConditionalBlockConditions[ConditionalBlockConditions["LessThan"] = 2] = "LessThan";
    /** GreaterThan */
    ConditionalBlockConditions[ConditionalBlockConditions["GreaterThan"] = 3] = "GreaterThan";
    /** LessOrEqual */
    ConditionalBlockConditions[ConditionalBlockConditions["LessOrEqual"] = 4] = "LessOrEqual";
    /** GreaterOrEqual */
    ConditionalBlockConditions[ConditionalBlockConditions["GreaterOrEqual"] = 5] = "GreaterOrEqual";
    /** Logical Exclusive OR */
    ConditionalBlockConditions[ConditionalBlockConditions["Xor"] = 6] = "Xor";
    /** Logical Or */
    ConditionalBlockConditions[ConditionalBlockConditions["Or"] = 7] = "Or";
    /** Logical And */
    ConditionalBlockConditions[ConditionalBlockConditions["And"] = 8] = "And";
})(ConditionalBlockConditions || (ConditionalBlockConditions = {}));
/**
 * Block used to apply conditional operation between floats
 * @since 5.0.0
 */
var ConditionalBlock = /** @class */ (function (_super) {
    __extends(ConditionalBlock, _super);
    /**
     * Creates a new ConditionalBlock
     * @param name defines the block name
     */
    function ConditionalBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        /**
         * Gets or sets the condition applied by the block
         */
        _this.condition = ConditionalBlockConditions.LessThan;
        _this.registerInput("a", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerInput("b", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerInput("true", NodeMaterialBlockConnectionPointTypes.AutoDetect, true);
        _this.registerInput("false", NodeMaterialBlockConnectionPointTypes.AutoDetect, true);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._linkConnectionTypes(2, 3);
        _this._outputs[0]._typeConnectionSource = _this._inputs[2];
        _this._outputs[0]._defaultConnectionPointType = NodeMaterialBlockConnectionPointTypes.Float;
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ConditionalBlock.prototype.getClassName = function () {
        return "ConditionalBlock";
    };
    Object.defineProperty(ConditionalBlock.prototype, "a", {
        /**
         * Gets the first operand component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConditionalBlock.prototype, "b", {
        /**
         * Gets the second operand component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConditionalBlock.prototype, "true", {
        /**
         * Gets the value to return if condition is true
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConditionalBlock.prototype, "false", {
        /**
         * Gets the value to return if condition is false
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConditionalBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    ConditionalBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        var trueStatement = this.true.isConnected ? this.true.associatedVariableName : "1.0";
        var falseStatement = this.false.isConnected ? this.false.associatedVariableName : "0.0";
        switch (this.condition) {
            case ConditionalBlockConditions.Equal: {
                state.compilationString +=
                    this._declareOutput(output, state) + " = ".concat(this.a.associatedVariableName, " == ").concat(this.b.associatedVariableName, " ? ").concat(trueStatement, " : ").concat(falseStatement, ";\r\n");
                break;
            }
            case ConditionalBlockConditions.NotEqual: {
                state.compilationString +=
                    this._declareOutput(output, state) + " = ".concat(this.a.associatedVariableName, " != ").concat(this.b.associatedVariableName, " ? ").concat(trueStatement, " : ").concat(falseStatement, ";\r\n");
                break;
            }
            case ConditionalBlockConditions.LessThan: {
                state.compilationString +=
                    this._declareOutput(output, state) + " = ".concat(this.a.associatedVariableName, " < ").concat(this.b.associatedVariableName, " ? ").concat(trueStatement, " : ").concat(falseStatement, ";\r\n");
                break;
            }
            case ConditionalBlockConditions.LessOrEqual: {
                state.compilationString +=
                    this._declareOutput(output, state) + " = ".concat(this.a.associatedVariableName, " <= ").concat(this.b.associatedVariableName, " ? ").concat(trueStatement, " : ").concat(falseStatement, ";\r\n");
                break;
            }
            case ConditionalBlockConditions.GreaterThan: {
                state.compilationString +=
                    this._declareOutput(output, state) + " = ".concat(this.a.associatedVariableName, " > ").concat(this.b.associatedVariableName, " ? ").concat(trueStatement, " : ").concat(falseStatement, ";\r\n");
                break;
            }
            case ConditionalBlockConditions.GreaterOrEqual: {
                state.compilationString +=
                    this._declareOutput(output, state) + " = ".concat(this.a.associatedVariableName, " >= ").concat(this.b.associatedVariableName, " ? ").concat(trueStatement, " : ").concat(falseStatement, ";\r\n");
                break;
            }
            case ConditionalBlockConditions.Xor: {
                state.compilationString +=
                    this._declareOutput(output, state) +
                        " = (mod(".concat(this.a.associatedVariableName, " + ").concat(this.b.associatedVariableName, ", 2.0) > 0.0) ? ").concat(trueStatement, " : ").concat(falseStatement, ";\r\n");
                break;
            }
            case ConditionalBlockConditions.Or: {
                state.compilationString +=
                    this._declareOutput(output, state) +
                        " = (min(".concat(this.a.associatedVariableName, " + ").concat(this.b.associatedVariableName, ", 1.0) > 0.0) ? ").concat(trueStatement, " : ").concat(falseStatement, ";\r\n");
                break;
            }
            case ConditionalBlockConditions.And: {
                state.compilationString +=
                    this._declareOutput(output, state) +
                        " = (".concat(this.a.associatedVariableName, " * ").concat(this.b.associatedVariableName, " > 0.0)  ? ").concat(trueStatement, " : ").concat(falseStatement, ";\r\n");
                break;
            }
        }
        return this;
    };
    ConditionalBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.condition = this.condition;
        return serializationObject;
    };
    ConditionalBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.condition = serializationObject.condition;
    };
    ConditionalBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this) + "".concat(this._codeVariableName, ".condition = BABYLON.ConditionalBlockConditions.").concat(ConditionalBlockConditions[this.condition], ";\r\n");
        return codeString;
    };
    return ConditionalBlock;
}(NodeMaterialBlock));
export { ConditionalBlock };
RegisterClass("BABYLON.ConditionalBlock", ConditionalBlock);
//# sourceMappingURL=conditionalBlock.js.map