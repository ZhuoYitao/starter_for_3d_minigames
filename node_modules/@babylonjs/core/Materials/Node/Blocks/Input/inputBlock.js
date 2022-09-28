import { __extends } from "tslib";
/* eslint-disable @typescript-eslint/naming-convention */
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockConnectionPointMode } from "../../Enums/nodeMaterialBlockConnectionPointMode.js";
import { NodeMaterialSystemValues } from "../../Enums/nodeMaterialSystemValues.js";
import { Matrix, Vector2, Vector3, Vector4 } from "../../../../Maths/math.vector.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { GetClass, RegisterClass } from "../../../../Misc/typeStore.js";
import { Color3, Color4, TmpColors } from "../../../../Maths/math.js";
import { AnimatedInputBlockTypes } from "./animatedInputBlockTypes.js";
import { Observable } from "../../../../Misc/observable.js";
var remapAttributeName = {
    position2d: "position",
    particle_uv: "vUV",
    particle_color: "vColor",
    particle_texturemask: "textureMask",
    particle_positionw: "vPositionW",
};
var attributeInFragmentOnly = {
    particle_uv: true,
    particle_color: true,
    particle_texturemask: true,
    particle_positionw: true,
};
var attributeAsUniform = {
    particle_texturemask: true,
};
/**
 * Block used to expose an input value
 */
var InputBlock = /** @class */ (function (_super) {
    __extends(InputBlock, _super);
    /**
     * Creates a new InputBlock
     * @param name defines the block name
     * @param target defines the target of that block (Vertex by default)
     * @param type defines the type of the input (can be set to NodeMaterialBlockConnectionPointTypes.AutoDetect)
     */
    function InputBlock(name, target, type) {
        if (target === void 0) { target = NodeMaterialBlockTargets.Vertex; }
        if (type === void 0) { type = NodeMaterialBlockConnectionPointTypes.AutoDetect; }
        var _this = _super.call(this, name, target, false, true) || this;
        _this._mode = NodeMaterialBlockConnectionPointMode.Undefined;
        _this._animationType = AnimatedInputBlockTypes.None;
        /** Gets or set a value used to limit the range of float values */
        _this.min = 0;
        /** Gets or set a value used to limit the range of float values */
        _this.max = 0;
        /** Gets or set a value indicating that this input can only get 0 and 1 values */
        _this.isBoolean = false;
        /** Gets or sets a value used by the Node Material editor to determine how to configure the current value if it is a matrix */
        _this.matrixMode = 0;
        /** @hidden */
        _this._systemValue = null;
        /** Gets or sets a boolean indicating that the value of this input will not change after a build */
        _this.isConstant = false;
        /** Gets or sets the group to use to display this block in the Inspector */
        _this.groupInInspector = "";
        /** Gets an observable raised when the value is changed */
        _this.onValueChangedObservable = new Observable();
        /** Gets or sets a boolean indicating if content needs to be converted to gamma space (for color3/4 only) */
        _this.convertToGammaSpace = false;
        /** Gets or sets a boolean indicating if content needs to be converted to linear space (for color3/4 only) */
        _this.convertToLinearSpace = false;
        _this._type = type;
        _this.setDefaultValue();
        _this.registerOutput("output", type);
        return _this;
    }
    Object.defineProperty(InputBlock.prototype, "type", {
        /**
         * Gets or sets the connection point type (default is float)
         */
        get: function () {
            if (this._type === NodeMaterialBlockConnectionPointTypes.AutoDetect) {
                if (this.isUniform && this.value != null) {
                    if (!isNaN(this.value)) {
                        this._type = NodeMaterialBlockConnectionPointTypes.Float;
                        return this._type;
                    }
                    switch (this.value.getClassName()) {
                        case "Vector2":
                            this._type = NodeMaterialBlockConnectionPointTypes.Vector2;
                            return this._type;
                        case "Vector3":
                            this._type = NodeMaterialBlockConnectionPointTypes.Vector3;
                            return this._type;
                        case "Vector4":
                            this._type = NodeMaterialBlockConnectionPointTypes.Vector4;
                            return this._type;
                        case "Color3":
                            this._type = NodeMaterialBlockConnectionPointTypes.Color3;
                            return this._type;
                        case "Color4":
                            this._type = NodeMaterialBlockConnectionPointTypes.Color4;
                            return this._type;
                        case "Matrix":
                            this._type = NodeMaterialBlockConnectionPointTypes.Matrix;
                            return this._type;
                    }
                }
                if (this.isAttribute) {
                    switch (this.name) {
                        case "position":
                        case "normal":
                        case "particle_positionw":
                            this._type = NodeMaterialBlockConnectionPointTypes.Vector3;
                            return this._type;
                        case "uv":
                        case "uv2":
                        case "uv3":
                        case "uv4":
                        case "uv5":
                        case "uv6":
                        case "position2d":
                        case "particle_uv":
                            this._type = NodeMaterialBlockConnectionPointTypes.Vector2;
                            return this._type;
                        case "matricesIndices":
                        case "matricesWeights":
                        case "world0":
                        case "world1":
                        case "world2":
                        case "world3":
                        case "tangent":
                            this._type = NodeMaterialBlockConnectionPointTypes.Vector4;
                            return this._type;
                        case "color":
                        case "particle_color":
                        case "particle_texturemask":
                            this._type = NodeMaterialBlockConnectionPointTypes.Color4;
                            return this._type;
                    }
                }
                if (this.isSystemValue) {
                    switch (this._systemValue) {
                        case NodeMaterialSystemValues.World:
                        case NodeMaterialSystemValues.WorldView:
                        case NodeMaterialSystemValues.WorldViewProjection:
                        case NodeMaterialSystemValues.View:
                        case NodeMaterialSystemValues.ViewProjection:
                        case NodeMaterialSystemValues.Projection:
                            this._type = NodeMaterialBlockConnectionPointTypes.Matrix;
                            return this._type;
                        case NodeMaterialSystemValues.CameraPosition:
                            this._type = NodeMaterialBlockConnectionPointTypes.Vector3;
                            return this._type;
                        case NodeMaterialSystemValues.FogColor:
                            this._type = NodeMaterialBlockConnectionPointTypes.Color3;
                            return this._type;
                        case NodeMaterialSystemValues.DeltaTime:
                        case NodeMaterialSystemValues.MaterialAlpha:
                            this._type = NodeMaterialBlockConnectionPointTypes.Float;
                            return this._type;
                        case NodeMaterialSystemValues.CameraParameters:
                            this._type = NodeMaterialBlockConnectionPointTypes.Vector4;
                            return this._type;
                    }
                }
            }
            return this._type;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Validates if a name is a reserve word.
     * @param newName the new name to be given to the node.
     * @returns false if the name is a reserve word, else true.
     */
    InputBlock.prototype.validateBlockName = function (newName) {
        if (!this.isAttribute) {
            return _super.prototype.validateBlockName.call(this, newName);
        }
        return true;
    };
    Object.defineProperty(InputBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Set the source of this connection point to a vertex attribute
     * @param attributeName defines the attribute name (position, uv, normal, etc...). If not specified it will take the connection point name
     * @returns the current connection point
     */
    InputBlock.prototype.setAsAttribute = function (attributeName) {
        this._mode = NodeMaterialBlockConnectionPointMode.Attribute;
        if (attributeName) {
            this.name = attributeName;
        }
        return this;
    };
    /**
     * Set the source of this connection point to a system value
     * @param value define the system value to use (world, view, etc...) or null to switch to manual value
     * @returns the current connection point
     */
    InputBlock.prototype.setAsSystemValue = function (value) {
        this.systemValue = value;
        return this;
    };
    Object.defineProperty(InputBlock.prototype, "value", {
        /**
         * Gets or sets the value of that point.
         * Please note that this value will be ignored if valueCallback is defined
         */
        get: function () {
            return this._storedValue;
        },
        set: function (value) {
            if (this.type === NodeMaterialBlockConnectionPointTypes.Float) {
                if (this.isBoolean) {
                    value = value ? 1 : 0;
                }
                else if (this.min !== this.max) {
                    value = Math.max(this.min, value);
                    value = Math.min(this.max, value);
                }
            }
            this._storedValue = value;
            this._mode = NodeMaterialBlockConnectionPointMode.Uniform;
            this.onValueChangedObservable.notifyObservers(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputBlock.prototype, "valueCallback", {
        /**
         * Gets or sets a callback used to get the value of that point.
         * Please note that setting this value will force the connection point to ignore the value property
         */
        get: function () {
            return this._valueCallback;
        },
        set: function (value) {
            this._valueCallback = value;
            this._mode = NodeMaterialBlockConnectionPointMode.Uniform;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputBlock.prototype, "associatedVariableName", {
        /**
         * Gets or sets the associated variable name in the shader
         */
        get: function () {
            return this._associatedVariableName;
        },
        set: function (value) {
            this._associatedVariableName = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputBlock.prototype, "animationType", {
        /** Gets or sets the type of animation applied to the input */
        get: function () {
            return this._animationType;
        },
        set: function (value) {
            this._animationType = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputBlock.prototype, "isUndefined", {
        /**
         * Gets a boolean indicating that this connection point not defined yet
         */
        get: function () {
            return this._mode === NodeMaterialBlockConnectionPointMode.Undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputBlock.prototype, "isUniform", {
        /**
         * Gets or sets a boolean indicating that this connection point is coming from an uniform.
         * In this case the connection point name must be the name of the uniform to use.
         * Can only be set on inputs
         */
        get: function () {
            return this._mode === NodeMaterialBlockConnectionPointMode.Uniform;
        },
        set: function (value) {
            this._mode = value ? NodeMaterialBlockConnectionPointMode.Uniform : NodeMaterialBlockConnectionPointMode.Undefined;
            this.associatedVariableName = "";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputBlock.prototype, "isAttribute", {
        /**
         * Gets or sets a boolean indicating that this connection point is coming from an attribute.
         * In this case the connection point name must be the name of the attribute to use
         * Can only be set on inputs
         */
        get: function () {
            return this._mode === NodeMaterialBlockConnectionPointMode.Attribute;
        },
        set: function (value) {
            this._mode = value ? NodeMaterialBlockConnectionPointMode.Attribute : NodeMaterialBlockConnectionPointMode.Undefined;
            this.associatedVariableName = "";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputBlock.prototype, "isVarying", {
        /**
         * Gets or sets a boolean indicating that this connection point is generating a varying variable.
         * Can only be set on exit points
         */
        get: function () {
            return this._mode === NodeMaterialBlockConnectionPointMode.Varying;
        },
        set: function (value) {
            this._mode = value ? NodeMaterialBlockConnectionPointMode.Varying : NodeMaterialBlockConnectionPointMode.Undefined;
            this.associatedVariableName = "";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputBlock.prototype, "isSystemValue", {
        /**
         * Gets a boolean indicating that the current connection point is a system value
         */
        get: function () {
            return this._systemValue != null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputBlock.prototype, "systemValue", {
        /**
         * Gets or sets the current well known value or null if not defined as a system value
         */
        get: function () {
            return this._systemValue;
        },
        set: function (value) {
            this._mode = NodeMaterialBlockConnectionPointMode.Uniform;
            this.associatedVariableName = "";
            this._systemValue = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the current class name
     * @returns the class name
     */
    InputBlock.prototype.getClassName = function () {
        return "InputBlock";
    };
    /**
     * Animate the input if animationType !== None
     * @param scene defines the rendering scene
     */
    InputBlock.prototype.animate = function (scene) {
        switch (this._animationType) {
            case AnimatedInputBlockTypes.Time: {
                if (this.type === NodeMaterialBlockConnectionPointTypes.Float) {
                    this.value += scene.getAnimationRatio() * 0.01;
                }
                break;
            }
        }
    };
    InputBlock.prototype._emitDefine = function (define) {
        if (define[0] === "!") {
            return "#ifndef ".concat(define.substring(1), "\r\n");
        }
        return "#ifdef ".concat(define, "\r\n");
    };
    InputBlock.prototype.initialize = function () {
        this.associatedVariableName = "";
    };
    /**
     * Set the input block to its default value (based on its type)
     */
    InputBlock.prototype.setDefaultValue = function () {
        switch (this.type) {
            case NodeMaterialBlockConnectionPointTypes.Float:
                this.value = 0;
                break;
            case NodeMaterialBlockConnectionPointTypes.Vector2:
                this.value = Vector2.Zero();
                break;
            case NodeMaterialBlockConnectionPointTypes.Vector3:
                this.value = Vector3.Zero();
                break;
            case NodeMaterialBlockConnectionPointTypes.Vector4:
                this.value = Vector4.Zero();
                break;
            case NodeMaterialBlockConnectionPointTypes.Color3:
                this.value = Color3.White();
                break;
            case NodeMaterialBlockConnectionPointTypes.Color4:
                this.value = new Color4(1, 1, 1, 1);
                break;
            case NodeMaterialBlockConnectionPointTypes.Matrix:
                this.value = Matrix.Identity();
                break;
        }
    };
    InputBlock.prototype._emitConstant = function (state) {
        switch (this.type) {
            case NodeMaterialBlockConnectionPointTypes.Float:
                return "".concat(state._emitFloat(this.value));
            case NodeMaterialBlockConnectionPointTypes.Vector2:
                return "vec2(".concat(this.value.x, ", ").concat(this.value.y, ")");
            case NodeMaterialBlockConnectionPointTypes.Vector3:
                return "vec3(".concat(this.value.x, ", ").concat(this.value.y, ", ").concat(this.value.z, ")");
            case NodeMaterialBlockConnectionPointTypes.Vector4:
                return "vec4(".concat(this.value.x, ", ").concat(this.value.y, ", ").concat(this.value.z, ", ").concat(this.value.w, ")");
            case NodeMaterialBlockConnectionPointTypes.Color3:
                TmpColors.Color3[0].set(this.value.r, this.value.g, this.value.b);
                if (this.convertToGammaSpace) {
                    TmpColors.Color3[0].toGammaSpaceToRef(TmpColors.Color3[0]);
                }
                if (this.convertToLinearSpace) {
                    TmpColors.Color3[0].toLinearSpaceToRef(TmpColors.Color3[0]);
                }
                return "vec3(".concat(TmpColors.Color3[0].r, ", ").concat(TmpColors.Color3[0].g, ", ").concat(TmpColors.Color3[0].b, ")");
            case NodeMaterialBlockConnectionPointTypes.Color4:
                TmpColors.Color4[0].set(this.value.r, this.value.g, this.value.b, this.value.a);
                if (this.convertToGammaSpace) {
                    TmpColors.Color4[0].toGammaSpaceToRef(TmpColors.Color4[0]);
                }
                if (this.convertToLinearSpace) {
                    TmpColors.Color4[0].toLinearSpaceToRef(TmpColors.Color4[0]);
                }
                return "vec4(".concat(TmpColors.Color4[0].r, ", ").concat(TmpColors.Color4[0].g, ", ").concat(TmpColors.Color4[0].b, ", ").concat(TmpColors.Color4[0].a, ")");
        }
        return "";
    };
    Object.defineProperty(InputBlock.prototype, "_noContextSwitch", {
        /** @hidden */
        get: function () {
            return attributeInFragmentOnly[this.name];
        },
        enumerable: false,
        configurable: true
    });
    InputBlock.prototype._emit = function (state, define) {
        var _a;
        // Uniforms
        if (this.isUniform) {
            if (!this.associatedVariableName) {
                this.associatedVariableName = state._getFreeVariableName("u_" + this.name);
            }
            if (this.isConstant) {
                if (state.constants.indexOf(this.associatedVariableName) !== -1) {
                    return;
                }
                state.constants.push(this.associatedVariableName);
                state._constantDeclaration += this._declareOutput(this.output, state) + " = ".concat(this._emitConstant(state), ";\r\n");
                return;
            }
            if (state.uniforms.indexOf(this.associatedVariableName) !== -1) {
                return;
            }
            state.uniforms.push(this.associatedVariableName);
            if (define) {
                state._uniformDeclaration += this._emitDefine(define);
            }
            state._uniformDeclaration += "uniform ".concat(state._getGLType(this.type), " ").concat(this.associatedVariableName, ";\r\n");
            if (define) {
                state._uniformDeclaration += "#endif\r\n";
            }
            // well known
            var hints = state.sharedData.hints;
            if (this._systemValue !== null && this._systemValue !== undefined) {
                switch (this._systemValue) {
                    case NodeMaterialSystemValues.WorldView:
                        hints.needWorldViewMatrix = true;
                        break;
                    case NodeMaterialSystemValues.WorldViewProjection:
                        hints.needWorldViewProjectionMatrix = true;
                        break;
                }
            }
            else {
                if (this._animationType !== AnimatedInputBlockTypes.None) {
                    state.sharedData.animatedInputs.push(this);
                }
            }
            return;
        }
        // Attribute
        if (this.isAttribute) {
            this.associatedVariableName = (_a = remapAttributeName[this.name]) !== null && _a !== void 0 ? _a : this.name;
            if (this.target === NodeMaterialBlockTargets.Vertex && state._vertexState) {
                // Attribute for fragment need to be carried over by varyings
                if (attributeInFragmentOnly[this.name]) {
                    if (attributeAsUniform[this.name]) {
                        state._emitUniformFromString(this.associatedVariableName, state._getGLType(this.type), define);
                    }
                    else {
                        state._emitVaryingFromString(this.associatedVariableName, state._getGLType(this.type), define);
                    }
                }
                else {
                    this._emit(state._vertexState, define);
                }
                return;
            }
            if (state.attributes.indexOf(this.associatedVariableName) !== -1) {
                return;
            }
            state.attributes.push(this.associatedVariableName);
            if (attributeInFragmentOnly[this.name]) {
                if (attributeAsUniform[this.name]) {
                    state._emitUniformFromString(this.associatedVariableName, state._getGLType(this.type), define);
                }
                else {
                    state._emitVaryingFromString(this.associatedVariableName, state._getGLType(this.type), define);
                }
            }
            else {
                if (define) {
                    state._attributeDeclaration += this._emitDefine(define);
                }
                state._attributeDeclaration += "attribute ".concat(state._getGLType(this.type), " ").concat(this.associatedVariableName, ";\r\n");
                if (define) {
                    state._attributeDeclaration += "#endif\r\n";
                }
            }
        }
    };
    /**
     * @param effect
     * @param world
     * @param worldView
     * @param worldViewProjection
     * @hidden
     */
    InputBlock.prototype._transmitWorld = function (effect, world, worldView, worldViewProjection) {
        if (!this._systemValue) {
            return;
        }
        var variableName = this.associatedVariableName;
        switch (this._systemValue) {
            case NodeMaterialSystemValues.World:
                effect.setMatrix(variableName, world);
                break;
            case NodeMaterialSystemValues.WorldView:
                effect.setMatrix(variableName, worldView);
                break;
            case NodeMaterialSystemValues.WorldViewProjection:
                effect.setMatrix(variableName, worldViewProjection);
                break;
        }
    };
    /**
     * @param effect
     * @param scene
     * @param material
     * @hidden
     */
    InputBlock.prototype._transmit = function (effect, scene, material) {
        if (this.isAttribute) {
            return;
        }
        var variableName = this.associatedVariableName;
        if (this._systemValue) {
            switch (this._systemValue) {
                case NodeMaterialSystemValues.World:
                case NodeMaterialSystemValues.WorldView:
                case NodeMaterialSystemValues.WorldViewProjection:
                    return;
                case NodeMaterialSystemValues.View:
                    effect.setMatrix(variableName, scene.getViewMatrix());
                    break;
                case NodeMaterialSystemValues.Projection:
                    effect.setMatrix(variableName, scene.getProjectionMatrix());
                    break;
                case NodeMaterialSystemValues.ViewProjection:
                    effect.setMatrix(variableName, scene.getTransformMatrix());
                    break;
                case NodeMaterialSystemValues.CameraPosition:
                    scene.bindEyePosition(effect, variableName, true);
                    break;
                case NodeMaterialSystemValues.FogColor:
                    effect.setColor3(variableName, scene.fogColor);
                    break;
                case NodeMaterialSystemValues.DeltaTime:
                    effect.setFloat(variableName, scene.deltaTime / 1000.0);
                    break;
                case NodeMaterialSystemValues.CameraParameters:
                    if (scene.activeCamera) {
                        effect.setFloat4(variableName, scene.getEngine().hasOriginBottomLeft ? -1 : 1, scene.activeCamera.minZ, scene.activeCamera.maxZ, 1 / scene.activeCamera.maxZ);
                    }
                    break;
                case NodeMaterialSystemValues.MaterialAlpha:
                    effect.setFloat(variableName, material.alpha);
                    break;
            }
            return;
        }
        var value = this._valueCallback ? this._valueCallback() : this._storedValue;
        if (value === null) {
            return;
        }
        switch (this.type) {
            case NodeMaterialBlockConnectionPointTypes.Float:
                effect.setFloat(variableName, value);
                break;
            case NodeMaterialBlockConnectionPointTypes.Int:
                effect.setInt(variableName, value);
                break;
            case NodeMaterialBlockConnectionPointTypes.Color3:
                TmpColors.Color3[0].set(this.value.r, this.value.g, this.value.b);
                if (this.convertToGammaSpace) {
                    TmpColors.Color3[0].toGammaSpaceToRef(TmpColors.Color3[0]);
                }
                if (this.convertToLinearSpace) {
                    TmpColors.Color3[0].toLinearSpaceToRef(TmpColors.Color3[0]);
                }
                effect.setColor3(variableName, TmpColors.Color3[0]);
                break;
            case NodeMaterialBlockConnectionPointTypes.Color4:
                TmpColors.Color4[0].set(this.value.r, this.value.g, this.value.b, this.value.a);
                if (this.convertToGammaSpace) {
                    TmpColors.Color4[0].toGammaSpaceToRef(TmpColors.Color4[0]);
                }
                if (this.convertToLinearSpace) {
                    TmpColors.Color4[0].toLinearSpaceToRef(TmpColors.Color4[0]);
                }
                effect.setDirectColor4(variableName, TmpColors.Color4[0]);
                break;
            case NodeMaterialBlockConnectionPointTypes.Vector2:
                effect.setVector2(variableName, value);
                break;
            case NodeMaterialBlockConnectionPointTypes.Vector3:
                effect.setVector3(variableName, value);
                break;
            case NodeMaterialBlockConnectionPointTypes.Vector4:
                effect.setVector4(variableName, value);
                break;
            case NodeMaterialBlockConnectionPointTypes.Matrix:
                effect.setMatrix(variableName, value);
                break;
        }
    };
    InputBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        if (this.isUniform || this.isSystemValue) {
            state.sharedData.inputBlocks.push(this);
        }
        this._emit(state);
    };
    InputBlock.prototype._dumpPropertiesCode = function () {
        var variableName = this._codeVariableName;
        if (this.isAttribute) {
            return _super.prototype._dumpPropertiesCode.call(this) + "".concat(variableName, ".setAsAttribute(\"").concat(this.name, "\");\r\n");
        }
        if (this.isSystemValue) {
            return _super.prototype._dumpPropertiesCode.call(this) + "".concat(variableName, ".setAsSystemValue(BABYLON.NodeMaterialSystemValues.").concat(NodeMaterialSystemValues[this._systemValue], ");\r\n");
        }
        if (this.isUniform) {
            var codes = [];
            var valueString = "";
            switch (this.type) {
                case NodeMaterialBlockConnectionPointTypes.Float:
                    valueString = "".concat(this.value);
                    break;
                case NodeMaterialBlockConnectionPointTypes.Vector2:
                    valueString = "new BABYLON.Vector2(".concat(this.value.x, ", ").concat(this.value.y, ")");
                    break;
                case NodeMaterialBlockConnectionPointTypes.Vector3:
                    valueString = "new BABYLON.Vector3(".concat(this.value.x, ", ").concat(this.value.y, ", ").concat(this.value.z, ")");
                    break;
                case NodeMaterialBlockConnectionPointTypes.Vector4:
                    valueString = "new BABYLON.Vector4(".concat(this.value.x, ", ").concat(this.value.y, ", ").concat(this.value.z, ", ").concat(this.value.w, ")");
                    break;
                case NodeMaterialBlockConnectionPointTypes.Color3:
                    valueString = "new BABYLON.Color3(".concat(this.value.r, ", ").concat(this.value.g, ", ").concat(this.value.b, ")");
                    if (this.convertToGammaSpace) {
                        valueString += ".toGammaSpace()";
                    }
                    if (this.convertToLinearSpace) {
                        valueString += ".toLinearSpace()";
                    }
                    break;
                case NodeMaterialBlockConnectionPointTypes.Color4:
                    valueString = "new BABYLON.Color4(".concat(this.value.r, ", ").concat(this.value.g, ", ").concat(this.value.b, ", ").concat(this.value.a, ")");
                    if (this.convertToGammaSpace) {
                        valueString += ".toGammaSpace()";
                    }
                    if (this.convertToLinearSpace) {
                        valueString += ".toLinearSpace()";
                    }
                    break;
                case NodeMaterialBlockConnectionPointTypes.Matrix:
                    valueString = "BABYLON.Matrix.FromArray([".concat(this.value.m, "])");
                    break;
            }
            // Common Property "Value"
            codes.push("".concat(variableName, ".value = ").concat(valueString));
            // Float-Value-Specific Properties
            if (this.type === NodeMaterialBlockConnectionPointTypes.Float) {
                codes.push("".concat(variableName, ".min = ").concat(this.min), "".concat(variableName, ".max = ").concat(this.max), "".concat(variableName, ".isBoolean = ").concat(this.isBoolean), "".concat(variableName, ".matrixMode = ").concat(this.matrixMode), "".concat(variableName, ".animationType = BABYLON.AnimatedInputBlockTypes.").concat(AnimatedInputBlockTypes[this.animationType]));
            }
            // Common Property "Type"
            codes.push("".concat(variableName, ".isConstant = ").concat(this.isConstant));
            codes.push("");
            return _super.prototype._dumpPropertiesCode.call(this) + codes.join(";\r\n");
        }
        return _super.prototype._dumpPropertiesCode.call(this);
    };
    InputBlock.prototype.dispose = function () {
        this.onValueChangedObservable.clear();
        _super.prototype.dispose.call(this);
    };
    InputBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.type = this.type;
        serializationObject.mode = this._mode;
        serializationObject.systemValue = this._systemValue;
        serializationObject.animationType = this._animationType;
        serializationObject.min = this.min;
        serializationObject.max = this.max;
        serializationObject.isBoolean = this.isBoolean;
        serializationObject.matrixMode = this.matrixMode;
        serializationObject.isConstant = this.isConstant;
        serializationObject.groupInInspector = this.groupInInspector;
        serializationObject.convertToGammaSpace = this.convertToGammaSpace;
        serializationObject.convertToLinearSpace = this.convertToLinearSpace;
        if (this._storedValue != null && this._mode === NodeMaterialBlockConnectionPointMode.Uniform) {
            if (this._storedValue.asArray) {
                serializationObject.valueType = "BABYLON." + this._storedValue.getClassName();
                serializationObject.value = this._storedValue.asArray();
            }
            else {
                serializationObject.valueType = "number";
                serializationObject.value = this._storedValue;
            }
        }
        return serializationObject;
    };
    InputBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        this._mode = serializationObject.mode;
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this._type = serializationObject.type;
        this._systemValue = serializationObject.systemValue || serializationObject.wellKnownValue;
        this._animationType = serializationObject.animationType;
        this.min = serializationObject.min || 0;
        this.max = serializationObject.max || 0;
        this.isBoolean = !!serializationObject.isBoolean;
        this.matrixMode = serializationObject.matrixMode || 0;
        this.isConstant = !!serializationObject.isConstant;
        this.groupInInspector = serializationObject.groupInInspector || "";
        this.convertToGammaSpace = !!serializationObject.convertToGammaSpace;
        this.convertToLinearSpace = !!serializationObject.convertToLinearSpace;
        if (!serializationObject.valueType) {
            return;
        }
        if (serializationObject.valueType === "number") {
            this._storedValue = serializationObject.value;
        }
        else {
            var valueType = GetClass(serializationObject.valueType);
            if (valueType) {
                this._storedValue = valueType.FromArray(serializationObject.value);
            }
        }
    };
    return InputBlock;
}(NodeMaterialBlock));
export { InputBlock };
RegisterClass("BABYLON.InputBlock", InputBlock);
//# sourceMappingURL=inputBlock.js.map