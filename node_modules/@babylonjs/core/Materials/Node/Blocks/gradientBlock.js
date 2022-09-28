import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import { Color3 } from "../../../Maths/math.color.js";
import { Observable } from "../../../Misc/observable.js";
/**
 * Class used to store a color step for the GradientBlock
 */
var GradientBlockColorStep = /** @class */ (function () {
    /**
     * Creates a new GradientBlockColorStep
     * @param step defines a value indicating which step this color is associated with (between 0 and 1)
     * @param color defines the color associated with this step
     */
    function GradientBlockColorStep(step, color) {
        this.step = step;
        this.color = color;
    }
    Object.defineProperty(GradientBlockColorStep.prototype, "step", {
        /**
         * Gets value indicating which step this color is associated with (between 0 and 1)
         */
        get: function () {
            return this._step;
        },
        /**
         * Sets a value indicating which step this color is associated with (between 0 and 1)
         */
        set: function (val) {
            this._step = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GradientBlockColorStep.prototype, "color", {
        /**
         * Gets the color associated with this step
         */
        get: function () {
            return this._color;
        },
        /**
         * Sets the color associated with this step
         */
        set: function (val) {
            this._color = val;
        },
        enumerable: false,
        configurable: true
    });
    return GradientBlockColorStep;
}());
export { GradientBlockColorStep };
/**
 * Block used to return a color from a gradient based on an input value between 0 and 1
 */
var GradientBlock = /** @class */ (function (_super) {
    __extends(GradientBlock, _super);
    /**
     * Creates a new GradientBlock
     * @param name defines the block name
     */
    function GradientBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        /**
         * Gets or sets the list of color steps
         */
        _this.colorSteps = [new GradientBlockColorStep(0, Color3.Black()), new GradientBlockColorStep(1.0, Color3.White())];
        /** Gets an observable raised when the value is changed */
        _this.onValueChangedObservable = new Observable();
        _this.registerInput("gradient", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Color3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector2);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color4);
        return _this;
    }
    /** calls observable when the value is changed*/
    GradientBlock.prototype.colorStepsUpdated = function () {
        this.onValueChangedObservable.notifyObservers(this);
    };
    /**
     * Gets the current class name
     * @returns the class name
     */
    GradientBlock.prototype.getClassName = function () {
        return "GradientBlock";
    };
    Object.defineProperty(GradientBlock.prototype, "gradient", {
        /**
         * Gets the gradient input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GradientBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    GradientBlock.prototype._writeColorConstant = function (index) {
        var step = this.colorSteps[index];
        return "vec3(".concat(step.color.r, ", ").concat(step.color.g, ", ").concat(step.color.b, ")");
    };
    GradientBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        if (!this.colorSteps.length || !this.gradient.connectedPoint) {
            state.compilationString += this._declareOutput(output, state) + " = vec3(0., 0., 0.);\r\n";
            return;
        }
        var tempColor = state._getFreeVariableName("gradientTempColor");
        var tempPosition = state._getFreeVariableName("gradientTempPosition");
        state.compilationString += "vec3 ".concat(tempColor, " = ").concat(this._writeColorConstant(0), ";\r\n");
        state.compilationString += "float ".concat(tempPosition, ";\r\n");
        var gradientSource = this.gradient.associatedVariableName;
        if (this.gradient.connectedPoint.type !== NodeMaterialBlockConnectionPointTypes.Float) {
            gradientSource += ".x";
        }
        for (var index = 1; index < this.colorSteps.length; index++) {
            var step = this.colorSteps[index];
            var previousStep = this.colorSteps[index - 1];
            state.compilationString += "".concat(tempPosition, " = clamp((").concat(gradientSource, " - ").concat(state._emitFloat(previousStep.step), ") / (").concat(state._emitFloat(step.step), " -  ").concat(state._emitFloat(previousStep.step), "), 0.0, 1.0) * step(").concat(state._emitFloat(index), ", ").concat(state._emitFloat(this.colorSteps.length - 1), ");\r\n");
            state.compilationString += "".concat(tempColor, " = mix(").concat(tempColor, ", ").concat(this._writeColorConstant(index), ", ").concat(tempPosition, ");\r\n");
        }
        state.compilationString += this._declareOutput(output, state) + " = ".concat(tempColor, ";\r\n");
        return this;
    };
    GradientBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.colorSteps = [];
        for (var _i = 0, _a = this.colorSteps; _i < _a.length; _i++) {
            var step = _a[_i];
            serializationObject.colorSteps.push({
                step: step.step,
                color: {
                    r: step.color.r,
                    g: step.color.g,
                    b: step.color.b,
                },
            });
        }
        return serializationObject;
    };
    GradientBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.colorSteps = [];
        for (var _i = 0, _a = serializationObject.colorSteps; _i < _a.length; _i++) {
            var step = _a[_i];
            this.colorSteps.push(new GradientBlockColorStep(step.step, new Color3(step.color.r, step.color.g, step.color.b)));
        }
    };
    GradientBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        codeString += "".concat(this._codeVariableName, ".colorSteps = [];\r\n");
        for (var _i = 0, _a = this.colorSteps; _i < _a.length; _i++) {
            var colorStep = _a[_i];
            codeString += "".concat(this._codeVariableName, ".colorSteps.push(new BABYLON.GradientBlockColorStep(").concat(colorStep.step, ", new BABYLON.Color3(").concat(colorStep.color.r, ", ").concat(colorStep.color.g, ", ").concat(colorStep.color.b, ")));\r\n");
        }
        return codeString;
    };
    return GradientBlock;
}(NodeMaterialBlock));
export { GradientBlock };
RegisterClass("BABYLON.GradientBlock", GradientBlock);
//# sourceMappingURL=gradientBlock.js.map