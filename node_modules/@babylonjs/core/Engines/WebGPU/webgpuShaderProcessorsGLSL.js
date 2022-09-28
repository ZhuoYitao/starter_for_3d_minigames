import { __extends } from "tslib";
import { WebGPUShaderProcessingContext } from "./webgpuShaderProcessingContext.js";
import * as WebGPUConstants from "./webgpuConstants.js";
import { Logger } from "../../Misc/logger.js";
import { WebGPUShaderProcessor } from "./webgpuShaderProcessor.js";
import { ShaderLanguage } from "../../Materials/shaderLanguage.js";
/** @hidden */
var WebGPUShaderProcessorGLSL = /** @class */ (function (_super) {
    __extends(WebGPUShaderProcessorGLSL, _super);
    function WebGPUShaderProcessorGLSL() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._missingVaryings = [];
        _this._textureArrayProcessing = [];
        _this.shaderLanguage = ShaderLanguage.GLSL;
        return _this;
    }
    WebGPUShaderProcessorGLSL.prototype._getArraySize = function (name, type, preProcessors) {
        var length = 0;
        var startArray = name.indexOf("[");
        var endArray = name.indexOf("]");
        if (startArray > 0 && endArray > 0) {
            var lengthInString = name.substring(startArray + 1, endArray);
            length = +lengthInString;
            if (isNaN(length)) {
                length = +preProcessors[lengthInString.trim()];
            }
            name = name.substr(0, startArray);
        }
        return [name, type, length];
    };
    WebGPUShaderProcessorGLSL.prototype.initializeShaders = function (processingContext) {
        this._webgpuProcessingContext = processingContext;
        this._missingVaryings.length = 0;
        this._textureArrayProcessing.length = 0;
    };
    WebGPUShaderProcessorGLSL.prototype.preProcessShaderCode = function (code, isFragment) {
        var ubDeclaration = "uniform ".concat(WebGPUShaderProcessor.InternalsUBOName, " {\nfloat yFactor__;\nfloat textureOutputHeight__;\n};\n");
        if (isFragment) {
            return ubDeclaration + "##INJECTCODE##\n" + code;
        }
        return ubDeclaration + code;
    };
    WebGPUShaderProcessorGLSL.prototype.varyingProcessor = function (varying, isFragment, preProcessors) {
        this._preProcessors = preProcessors;
        var varyingRegex = /\s*varying\s+(?:(?:highp)?|(?:lowp)?)\s*(\S+)\s+(\S+)\s*;/gm;
        var match = varyingRegex.exec(varying);
        if (match != null) {
            var varyingType = match[1];
            var name_1 = match[2];
            var location_1;
            if (isFragment) {
                location_1 = this._webgpuProcessingContext.availableVaryings[name_1];
                this._missingVaryings[location_1] = "";
                if (location_1 === undefined) {
                    Logger.Warn("Invalid fragment shader: The varying named \"".concat(name_1, "\" is not declared in the vertex shader! This declaration will be ignored."));
                }
            }
            else {
                location_1 = this._webgpuProcessingContext.getVaryingNextLocation(varyingType, this._getArraySize(name_1, varyingType, preProcessors)[2]);
                this._webgpuProcessingContext.availableVaryings[name_1] = location_1;
                this._missingVaryings[location_1] = "layout(location = ".concat(location_1, ") in ").concat(varyingType, " ").concat(name_1, ";");
            }
            varying = varying.replace(match[0], location_1 === undefined ? "" : "layout(location = ".concat(location_1, ") ").concat(isFragment ? "in" : "out", " ").concat(varyingType, " ").concat(name_1, ";"));
        }
        return varying;
    };
    WebGPUShaderProcessorGLSL.prototype.attributeProcessor = function (attribute, preProcessors) {
        this._preProcessors = preProcessors;
        var attribRegex = /\s*attribute\s+(\S+)\s+(\S+)\s*;/gm;
        var match = attribRegex.exec(attribute);
        if (match != null) {
            var attributeType = match[1];
            var name_2 = match[2];
            var location_2 = this._webgpuProcessingContext.getAttributeNextLocation(attributeType, this._getArraySize(name_2, attributeType, preProcessors)[2]);
            this._webgpuProcessingContext.availableAttributes[name_2] = location_2;
            this._webgpuProcessingContext.orderedAttributes[location_2] = name_2;
            attribute = attribute.replace(match[0], "layout(location = ".concat(location_2, ") in ").concat(attributeType, " ").concat(name_2, ";"));
        }
        return attribute;
    };
    WebGPUShaderProcessorGLSL.prototype.uniformProcessor = function (uniform, isFragment, preProcessors) {
        var _a;
        var _b;
        this._preProcessors = preProcessors;
        var uniformRegex = /\s*uniform\s+(?:(?:highp)?|(?:lowp)?)\s*(\S+)\s+(\S+)\s*;/gm;
        var match = uniformRegex.exec(uniform);
        if (match != null) {
            var uniformType = match[1];
            var name_3 = match[2];
            if (uniformType.indexOf("sampler") === 0 || uniformType.indexOf("sampler") === 1) {
                var arraySize = 0; // 0 means the texture is not declared as an array
                _a = this._getArraySize(name_3, uniformType, preProcessors), name_3 = _a[0], uniformType = _a[1], arraySize = _a[2];
                var textureInfo = this._webgpuProcessingContext.availableTextures[name_3];
                if (!textureInfo) {
                    textureInfo = {
                        autoBindSampler: true,
                        isTextureArray: arraySize > 0,
                        isStorageTexture: false,
                        textures: [],
                        sampleType: WebGPUConstants.TextureSampleType.Float,
                    };
                    for (var i = 0; i < (arraySize || 1); ++i) {
                        textureInfo.textures.push(this._webgpuProcessingContext.getNextFreeUBOBinding());
                    }
                }
                var samplerType = (_b = WebGPUShaderProcessor._SamplerTypeByWebGLSamplerType[uniformType]) !== null && _b !== void 0 ? _b : "sampler";
                var isComparisonSampler = !!WebGPUShaderProcessor._IsComparisonSamplerByWebGPUSamplerType[samplerType];
                var samplerBindingType = isComparisonSampler ? WebGPUConstants.SamplerBindingType.Comparison : WebGPUConstants.SamplerBindingType.Filtering;
                var samplerName = name_3 + WebGPUShaderProcessor.AutoSamplerSuffix;
                var samplerInfo = this._webgpuProcessingContext.availableSamplers[samplerName];
                if (!samplerInfo) {
                    samplerInfo = {
                        binding: this._webgpuProcessingContext.getNextFreeUBOBinding(),
                        type: samplerBindingType,
                    };
                }
                var componentType = uniformType.charAt(0) === "u" ? "u" : uniformType.charAt(0) === "i" ? "i" : "";
                if (componentType) {
                    uniformType = uniformType.substr(1);
                }
                var sampleType = isComparisonSampler
                    ? WebGPUConstants.TextureSampleType.Depth
                    : componentType === "u"
                        ? WebGPUConstants.TextureSampleType.Uint
                        : componentType === "i"
                            ? WebGPUConstants.TextureSampleType.Sint
                            : WebGPUConstants.TextureSampleType.Float;
                textureInfo.sampleType = sampleType;
                var isTextureArray = arraySize > 0;
                var samplerGroupIndex = samplerInfo.binding.groupIndex;
                var samplerBindingIndex = samplerInfo.binding.bindingIndex;
                var samplerFunction = WebGPUShaderProcessor._SamplerFunctionByWebGLSamplerType[uniformType];
                var textureType = WebGPUShaderProcessor._TextureTypeByWebGLSamplerType[uniformType];
                var textureDimension = WebGPUShaderProcessor._GpuTextureViewDimensionByWebGPUTextureType[textureType];
                // Manage textures and samplers.
                if (!isTextureArray) {
                    arraySize = 1;
                    uniform = "layout(set = ".concat(samplerGroupIndex, ", binding = ").concat(samplerBindingIndex, ") uniform ").concat(componentType).concat(samplerType, " ").concat(samplerName, ";\n                        layout(set = ").concat(textureInfo.textures[0].groupIndex, ", binding = ").concat(textureInfo.textures[0].bindingIndex, ") uniform ").concat(textureType, " ").concat(name_3, "Texture;\n                        #define ").concat(name_3, " ").concat(componentType).concat(samplerFunction, "(").concat(name_3, "Texture, ").concat(samplerName, ")");
                }
                else {
                    var layouts = [];
                    layouts.push("layout(set = ".concat(samplerGroupIndex, ", binding = ").concat(samplerBindingIndex, ") uniform ").concat(componentType).concat(samplerType, " ").concat(samplerName, ";"));
                    uniform = "\r\n";
                    for (var i = 0; i < arraySize; ++i) {
                        var textureSetIndex = textureInfo.textures[i].groupIndex;
                        var textureBindingIndex = textureInfo.textures[i].bindingIndex;
                        layouts.push("layout(set = ".concat(textureSetIndex, ", binding = ").concat(textureBindingIndex, ") uniform ").concat(textureType, " ").concat(name_3, "Texture").concat(i, ";"));
                        uniform += "".concat(i > 0 ? "\r\n" : "", "#define ").concat(name_3).concat(i, " ").concat(componentType).concat(samplerFunction, "(").concat(name_3, "Texture").concat(i, ", ").concat(samplerName, ")");
                    }
                    uniform = layouts.join("\r\n") + uniform;
                    this._textureArrayProcessing.push(name_3);
                }
                this._webgpuProcessingContext.availableTextures[name_3] = textureInfo;
                this._webgpuProcessingContext.availableSamplers[samplerName] = samplerInfo;
                this._addSamplerBindingDescription(samplerName, samplerInfo, !isFragment);
                for (var i = 0; i < arraySize; ++i) {
                    this._addTextureBindingDescription(name_3, textureInfo, i, textureDimension, null, !isFragment);
                }
            }
            else {
                this._addUniformToLeftOverUBO(name_3, uniformType, preProcessors);
                uniform = "";
            }
        }
        return uniform;
    };
    WebGPUShaderProcessorGLSL.prototype.uniformBufferProcessor = function (uniformBuffer, isFragment) {
        var uboRegex = /uniform\s+(\w+)/gm;
        var match = uboRegex.exec(uniformBuffer);
        if (match != null) {
            var name_4 = match[1];
            var uniformBufferInfo = this._webgpuProcessingContext.availableBuffers[name_4];
            if (!uniformBufferInfo) {
                var knownUBO = WebGPUShaderProcessingContext.KnownUBOs[name_4];
                var binding = void 0;
                if (knownUBO && knownUBO.binding.groupIndex !== -1) {
                    binding = knownUBO.binding;
                }
                else {
                    binding = this._webgpuProcessingContext.getNextFreeUBOBinding();
                }
                uniformBufferInfo = { binding: binding };
                this._webgpuProcessingContext.availableBuffers[name_4] = uniformBufferInfo;
            }
            this._addBufferBindingDescription(name_4, uniformBufferInfo, WebGPUConstants.BufferBindingType.Uniform, !isFragment);
            uniformBuffer = uniformBuffer.replace("uniform", "layout(set = ".concat(uniformBufferInfo.binding.groupIndex, ", binding = ").concat(uniformBufferInfo.binding.bindingIndex, ") uniform"));
        }
        return uniformBuffer;
    };
    WebGPUShaderProcessorGLSL.prototype.postProcessor = function (code, defines, isFragment, processingContext, engine) {
        var hasDrawBuffersExtension = code.search(/#extension.+GL_EXT_draw_buffers.+require/) !== -1;
        // Remove extensions
        var regex = /#extension.+(GL_OVR_multiview2|GL_OES_standard_derivatives|GL_EXT_shader_texture_lod|GL_EXT_frag_depth|GL_EXT_draw_buffers).+(enable|require)/g;
        code = code.replace(regex, "");
        // Replace instructions
        code = code.replace(/texture2D\s*\(/g, "texture(");
        if (isFragment) {
            var hasFragCoord = code.indexOf("gl_FragCoord") >= 0;
            var fragCoordCode = "\n                glFragCoord__ = gl_FragCoord;\n                if (yFactor__ == 1.) {\n                    glFragCoord__.y = textureOutputHeight__ - glFragCoord__.y;\n                }\n            ";
            var injectCode = hasFragCoord ? "vec4 glFragCoord__;\n" : "";
            code = code.replace(/texture2DLodEXT\s*\(/g, "textureLod(");
            code = code.replace(/textureCubeLodEXT\s*\(/g, "textureLod(");
            code = code.replace(/textureCube\s*\(/g, "texture(");
            code = code.replace(/gl_FragDepthEXT/g, "gl_FragDepth");
            code = code.replace(/gl_FragColor/g, "glFragColor");
            code = code.replace(/gl_FragData/g, "glFragData");
            code = code.replace(/gl_FragCoord/g, "glFragCoord__");
            code = code.replace(/void\s+?main\s*\(/g, (hasDrawBuffersExtension ? "" : "layout(location = 0) out vec4 glFragColor;\n") + "void main(");
            code = code.replace(/dFdy/g, "(-yFactor__)*dFdy"); // will also handle dFdyCoarse and dFdyFine
            code = code.replace("##INJECTCODE##", injectCode);
            if (hasFragCoord) {
                code = this._injectStartingAndEndingCode(code, "void main", fragCoordCode);
            }
        }
        else {
            code = code.replace(/gl_InstanceID/g, "gl_InstanceIndex");
            code = code.replace(/gl_VertexID/g, "gl_VertexIndex");
            var hasMultiviewExtension = defines.indexOf("#define MULTIVIEW") !== -1;
            if (hasMultiviewExtension) {
                return "#extension GL_OVR_multiview2 : require\nlayout (num_views = 2) in;\n" + code;
            }
        }
        // Flip Y + convert z range from [-1,1] to [0,1]
        if (!isFragment) {
            var lastClosingCurly = code.lastIndexOf("}");
            code = code.substring(0, lastClosingCurly);
            code += "gl_Position.y *= yFactor__;\n";
            if (!engine.isNDCHalfZRange) {
                code += "gl_Position.z = (gl_Position.z + gl_Position.w) / 2.0;\n";
            }
            code += "}";
        }
        return code;
    };
    WebGPUShaderProcessorGLSL.prototype._applyTextureArrayProcessing = function (code, name) {
        // Replaces the occurrences of name[XX] by nameXX
        var regex = new RegExp(name + "\\s*\\[(.+)?\\]", "gm");
        var match = regex.exec(code);
        while (match != null) {
            var index = match[1];
            var iindex = +index;
            if (this._preProcessors && isNaN(iindex)) {
                iindex = +this._preProcessors[index.trim()];
            }
            code = code.replace(match[0], name + iindex);
            match = regex.exec(code);
        }
        return code;
    };
    WebGPUShaderProcessorGLSL.prototype._generateLeftOverUBOCode = function (name, uniformBufferDescription) {
        var ubo = "layout(set = ".concat(uniformBufferDescription.binding.groupIndex, ", binding = ").concat(uniformBufferDescription.binding.bindingIndex, ") uniform ").concat(name, " {\n    ");
        for (var _i = 0, _a = this._webgpuProcessingContext.leftOverUniforms; _i < _a.length; _i++) {
            var leftOverUniform = _a[_i];
            if (leftOverUniform.length > 0) {
                ubo += "    ".concat(leftOverUniform.type, " ").concat(leftOverUniform.name, "[").concat(leftOverUniform.length, "];\n");
            }
            else {
                ubo += "    ".concat(leftOverUniform.type, " ").concat(leftOverUniform.name, ";\n");
            }
        }
        ubo += "};\n\n";
        return ubo;
    };
    WebGPUShaderProcessorGLSL.prototype.finalizeShaders = function (vertexCode, fragmentCode) {
        // make replacements for texture names in the texture array case
        for (var i = 0; i < this._textureArrayProcessing.length; ++i) {
            var name_5 = this._textureArrayProcessing[i];
            vertexCode = this._applyTextureArrayProcessing(vertexCode, name_5);
            fragmentCode = this._applyTextureArrayProcessing(fragmentCode, name_5);
        }
        // inject the missing varying in the fragment shader
        for (var i = 0; i < this._missingVaryings.length; ++i) {
            var decl = this._missingVaryings[i];
            if (decl && decl.length > 0) {
                fragmentCode = decl + "\n" + fragmentCode;
            }
        }
        // Builds the leftover UBOs.
        var leftOverUBO = this._buildLeftOverUBO();
        vertexCode = leftOverUBO + vertexCode;
        fragmentCode = leftOverUBO + fragmentCode;
        this._collectBindingNames();
        this._preCreateBindGroupEntries();
        this._preProcessors = null;
        return { vertexCode: vertexCode, fragmentCode: fragmentCode };
    };
    return WebGPUShaderProcessorGLSL;
}(WebGPUShaderProcessor));
export { WebGPUShaderProcessorGLSL };
//# sourceMappingURL=webgpuShaderProcessorsGLSL.js.map