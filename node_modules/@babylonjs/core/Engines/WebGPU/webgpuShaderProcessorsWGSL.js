import { __extends } from "tslib";
import { WebGPUShaderProcessingContext } from "./webgpuShaderProcessingContext.js";
import * as WebGPUConstants from "./webgpuConstants.js";
import { Logger } from "../../Misc/logger.js";
import { WebGPUShaderProcessor } from "./webgpuShaderProcessor.js";
import { RemoveComments } from "../../Misc/codeStringParsingTools.js";
import "../../ShadersWGSL/ShadersInclude/bonesDeclaration.js";
import "../../ShadersWGSL/ShadersInclude/bonesVertex.js";
import "../../ShadersWGSL/ShadersInclude/bakedVertexAnimationDeclaration.js";
import "../../ShadersWGSL/ShadersInclude/bakedVertexAnimation.js";
import "../../ShadersWGSL/ShadersInclude/clipPlaneFragment.js";
import "../../ShadersWGSL/ShadersInclude/clipPlaneFragmentDeclaration.js";
import "../../ShadersWGSL/ShadersInclude/clipPlaneVertex.js";
import "../../ShadersWGSL/ShadersInclude/clipPlaneVertexDeclaration.js";
import "../../ShadersWGSL/ShadersInclude/instancesDeclaration.js";
import "../../ShadersWGSL/ShadersInclude/instancesVertex.js";
import "../../ShadersWGSL/ShadersInclude/meshUboDeclaration.js";
import "../../ShadersWGSL/ShadersInclude/morphTargetsVertex.js";
import "../../ShadersWGSL/ShadersInclude/morphTargetsVertexDeclaration.js";
import "../../ShadersWGSL/ShadersInclude/morphTargetsVertexGlobal.js";
import "../../ShadersWGSL/ShadersInclude/morphTargetsVertexGlobalDeclaration.js";
import "../../ShadersWGSL/ShadersInclude/sceneUboDeclaration.js";
import { ShaderLanguage } from "../../Materials/shaderLanguage.js";
var builtInName_vertex_index = "gl_VertexID";
var builtInName_instance_index = "gl_InstanceID";
var builtInName_position = "gl_Position";
var builtInName_position_frag = "gl_FragCoord";
var builtInName_front_facing = "gl_FrontFacing";
var builtInName_frag_depth = "gl_FragDepth";
var builtInName_FragColor = "gl_FragColor";
var leftOverVarName = "uniforms";
var internalsVarName = "internals";
var gpuTextureViewDimensionByWebGPUTextureFunction = {
    texture_1d: WebGPUConstants.TextureViewDimension.E1d,
    texture_2d: WebGPUConstants.TextureViewDimension.E2d,
    texture_2d_array: WebGPUConstants.TextureViewDimension.E2dArray,
    texture_3d: WebGPUConstants.TextureViewDimension.E3d,
    texture_cube: WebGPUConstants.TextureViewDimension.Cube,
    texture_cube_array: WebGPUConstants.TextureViewDimension.CubeArray,
    texture_multisampled_2d: WebGPUConstants.TextureViewDimension.E2d,
    texture_depth_2d: WebGPUConstants.TextureViewDimension.E2d,
    texture_depth_2d_array: WebGPUConstants.TextureViewDimension.E2dArray,
    texture_depth_cube: WebGPUConstants.TextureViewDimension.Cube,
    texture_depth_cube_array: WebGPUConstants.TextureViewDimension.CubeArray,
    texture_depth_multisampled_2d: WebGPUConstants.TextureViewDimension.E2d,
    texture_storage_1d: WebGPUConstants.TextureViewDimension.E1d,
    texture_storage_2d: WebGPUConstants.TextureViewDimension.E2d,
    texture_storage_2d_array: WebGPUConstants.TextureViewDimension.E2dArray,
    texture_storage_3d: WebGPUConstants.TextureViewDimension.E3d,
    texture_external: null,
};
/** @hidden */
var WebGPUShaderProcessorWGSL = /** @class */ (function (_super) {
    __extends(WebGPUShaderProcessorWGSL, _super);
    function WebGPUShaderProcessorWGSL() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.shaderLanguage = ShaderLanguage.WGSL;
        _this.uniformRegexp = /uniform\s+(\w+)\s*:\s*(.+)\s*;/;
        _this.textureRegexp = /var\s+(\w+)\s*:\s*((array<\s*)?(texture_\w+)\s*(<\s*(.+)\s*>)?\s*(,\s*\w+\s*>\s*)?);/;
        _this.noPrecision = true;
        return _this;
    }
    WebGPUShaderProcessorWGSL.prototype._getArraySize = function (name, uniformType, preProcessors) {
        var length = 0;
        var endArray = uniformType.lastIndexOf(">");
        if (uniformType.indexOf("array") >= 0 && endArray > 0) {
            var startArray = endArray;
            while (startArray > 0 && uniformType.charAt(startArray) !== " " && uniformType.charAt(startArray) !== ",") {
                startArray--;
            }
            var lengthInString = uniformType.substring(startArray + 1, endArray);
            length = +lengthInString;
            if (isNaN(length)) {
                length = +preProcessors[lengthInString.trim()];
            }
            while (startArray > 0 && (uniformType.charAt(startArray) === " " || uniformType.charAt(startArray) === ",")) {
                startArray--;
            }
            uniformType = uniformType.substring(uniformType.indexOf("<") + 1, startArray + 1);
        }
        return [name, uniformType, length];
    };
    WebGPUShaderProcessorWGSL.prototype.initializeShaders = function (processingContext) {
        this._webgpuProcessingContext = processingContext;
        this._attributesWGSL = [];
        this._attributesDeclWGSL = [];
        this._attributeNamesWGSL = [];
        this._varyingsWGSL = [];
        this._varyingsDeclWGSL = [];
        this._varyingNamesWGSL = [];
        this._stridedUniformArrays = [];
    };
    WebGPUShaderProcessorWGSL.prototype.preProcessShaderCode = function (code) {
        return ("struct ".concat(WebGPUShaderProcessor.InternalsUBOName, " {\nyFactor__: f32,\ntextureOutputHeight__: f32,\n};\nvar<uniform> ").concat(internalsVarName, " : ").concat(WebGPUShaderProcessor.InternalsUBOName, ";\n") +
            RemoveComments(code));
    };
    WebGPUShaderProcessorWGSL.prototype.varyingProcessor = function (varying, isFragment, preProcessors) {
        var varyingRegex = /\s*varying\s+(?:(?:highp)?|(?:lowp)?)\s*(\S+)\s*:\s*(.+)\s*;/gm;
        var match = varyingRegex.exec(varying);
        if (match !== null) {
            var varyingType = match[2];
            var name_1 = match[1];
            var location_1;
            if (isFragment) {
                location_1 = this._webgpuProcessingContext.availableVaryings[name_1];
                if (location_1 === undefined) {
                    Logger.Warn("Invalid fragment shader: The varying named \"".concat(name_1, "\" is not declared in the vertex shader! This declaration will be ignored."));
                }
            }
            else {
                location_1 = this._webgpuProcessingContext.getVaryingNextLocation(varyingType, this._getArraySize(name_1, varyingType, preProcessors)[2]);
                this._webgpuProcessingContext.availableVaryings[name_1] = location_1;
                this._varyingsWGSL.push("@location(".concat(location_1, ") ").concat(name_1, " : ").concat(varyingType, ","));
                this._varyingsDeclWGSL.push("var<private> ".concat(name_1, " : ").concat(varyingType, ";"));
                this._varyingNamesWGSL.push(name_1);
            }
            varying = "";
        }
        return varying;
    };
    WebGPUShaderProcessorWGSL.prototype.attributeProcessor = function (attribute, preProcessors) {
        var attribRegex = /\s*attribute\s+(\S+)\s*:\s*(.+)\s*;/gm;
        var match = attribRegex.exec(attribute);
        if (match !== null) {
            var attributeType = match[2];
            var name_2 = match[1];
            var location_2 = this._webgpuProcessingContext.getAttributeNextLocation(attributeType, this._getArraySize(name_2, attributeType, preProcessors)[2]);
            this._webgpuProcessingContext.availableAttributes[name_2] = location_2;
            this._webgpuProcessingContext.orderedAttributes[location_2] = name_2;
            this._attributesWGSL.push("@location(".concat(location_2, ") ").concat(name_2, " : ").concat(attributeType, ","));
            this._attributesDeclWGSL.push("var<private> ".concat(name_2, " : ").concat(attributeType, ";"));
            this._attributeNamesWGSL.push(name_2);
            attribute = "";
        }
        return attribute;
    };
    WebGPUShaderProcessorWGSL.prototype.uniformProcessor = function (uniform, isFragment, preProcessors) {
        var match = this.uniformRegexp.exec(uniform);
        if (match !== null) {
            var uniformType = match[2];
            var name_3 = match[1];
            this._addUniformToLeftOverUBO(name_3, uniformType, preProcessors);
            uniform = "";
        }
        return uniform;
    };
    WebGPUShaderProcessorWGSL.prototype.textureProcessor = function (texture, isFragment, preProcessors) {
        var match = this.textureRegexp.exec(texture);
        if (match !== null) {
            var name_4 = match[1]; // name of the variable
            var type = match[2]; // texture_2d<f32> or array<texture_2d_array<f32>, 5> for eg
            var isArrayOfTexture = !!match[3];
            var textureFunc = match[4]; // texture_2d, texture_depth_2d, etc
            var isStorageTexture = textureFunc.indexOf("storage") > 0;
            var componentType = match[6]; // f32 or i32 or u32 or undefined
            var storageTextureFormat = isStorageTexture ? componentType.substring(0, componentType.indexOf(",")).trim() : null;
            var arraySize = isArrayOfTexture ? this._getArraySize(name_4, type, preProcessors)[2] : 0;
            var textureInfo = this._webgpuProcessingContext.availableTextures[name_4];
            if (!textureInfo) {
                textureInfo = {
                    isTextureArray: arraySize > 0,
                    isStorageTexture: isStorageTexture,
                    textures: [],
                    sampleType: WebGPUConstants.TextureSampleType.Float,
                };
                arraySize = arraySize || 1;
                for (var i = 0; i < arraySize; ++i) {
                    textureInfo.textures.push(this._webgpuProcessingContext.getNextFreeUBOBinding());
                }
            }
            else {
                arraySize = textureInfo.textures.length;
            }
            this._webgpuProcessingContext.availableTextures[name_4] = textureInfo;
            var isDepthTexture = textureFunc.indexOf("depth") > 0;
            var textureDimension = gpuTextureViewDimensionByWebGPUTextureFunction[textureFunc];
            var sampleType = isDepthTexture
                ? WebGPUConstants.TextureSampleType.Depth
                : componentType === "u32"
                    ? WebGPUConstants.TextureSampleType.Uint
                    : componentType === "i32"
                        ? WebGPUConstants.TextureSampleType.Sint
                        : WebGPUConstants.TextureSampleType.Float;
            textureInfo.sampleType = sampleType;
            if (textureDimension === undefined) {
                throw "Can't get the texture dimension corresponding to the texture function \"".concat(textureFunc, "\"!");
            }
            for (var i = 0; i < arraySize; ++i) {
                var _a = textureInfo.textures[i], groupIndex = _a.groupIndex, bindingIndex = _a.bindingIndex;
                if (i === 0) {
                    texture = "@group(".concat(groupIndex, ") @binding(").concat(bindingIndex, ") ").concat(texture);
                }
                this._addTextureBindingDescription(name_4, textureInfo, i, textureDimension, storageTextureFormat, !isFragment);
            }
        }
        return texture;
    };
    WebGPUShaderProcessorWGSL.prototype.postProcessor = function (code) {
        return code;
    };
    WebGPUShaderProcessorWGSL.prototype.finalizeShaders = function (vertexCode, fragmentCode) {
        var fragCoordCode = fragmentCode.indexOf("gl_FragCoord") >= 0
            ? "\n            if (internals.yFactor__ == 1.) {\n                gl_FragCoord.y = internals.textureOutputHeight__ - gl_FragCoord.y;\n            }\n        "
            : "";
        // Add the group/binding info to the sampler declaration (var xxx: sampler|sampler_comparison)
        vertexCode = this._processSamplers(vertexCode, true);
        fragmentCode = this._processSamplers(fragmentCode, false);
        // Add the group/binding info to the uniform/storage buffer declarations (var<uniform> XXX:YYY or var<storage(,read_write|read)> XXX:YYY)
        vertexCode = this._processCustomBuffers(vertexCode, true);
        fragmentCode = this._processCustomBuffers(fragmentCode, false);
        // Builds the leftover UBOs.
        var leftOverUBO = this._buildLeftOverUBO();
        vertexCode = leftOverUBO + vertexCode;
        fragmentCode = leftOverUBO + fragmentCode;
        // Vertex code
        vertexCode = vertexCode.replace(/#define /g, "//#define ");
        vertexCode = this._processStridedUniformArrays(vertexCode);
        var varyingsDecl = this._varyingsDeclWGSL.join("\n") + "\n";
        var vertexBuiltinDecl = "var<private> ".concat(builtInName_vertex_index, " : u32;\nvar<private> ").concat(builtInName_instance_index, " : u32;\nvar<private> ").concat(builtInName_position, " : vec4<f32>;\n");
        var vertexAttributesDecl = this._attributesDeclWGSL.join("\n") + "\n";
        var vertexInputs = "struct VertexInputs {\n  @builtin(vertex_index) vertexIndex : u32,\n  @builtin(instance_index) instanceIndex : u32,\n";
        if (this._attributesWGSL.length > 0) {
            vertexInputs += this._attributesWGSL.join("\n");
        }
        vertexInputs += "\n};\n";
        var vertexFragmentInputs = "struct FragmentInputs {\n  @builtin(position) position : vec4<f32>,\n";
        if (this._varyingsWGSL.length > 0) {
            vertexFragmentInputs += this._varyingsWGSL.join("\n");
        }
        vertexFragmentInputs += "\n};\n";
        vertexCode = vertexBuiltinDecl + vertexInputs + vertexAttributesDecl + vertexFragmentInputs + varyingsDecl + vertexCode;
        var vertexStartingCode = "  var output : FragmentInputs;\n  ".concat(builtInName_vertex_index, " = input.vertexIndex;\n  ").concat(builtInName_instance_index, " = input.instanceIndex;\n");
        for (var i = 0; i < this._attributeNamesWGSL.length; ++i) {
            var name_5 = this._attributeNamesWGSL[i];
            vertexStartingCode += "  ".concat(name_5, " = input.").concat(name_5, ";\n");
        }
        var vertexEndingCode = "  output.position = ".concat(builtInName_position, ";\n  output.position.y = output.position.y * internals.yFactor__;\n");
        for (var i = 0; i < this._varyingNamesWGSL.length; ++i) {
            var name_6 = this._varyingNamesWGSL[i];
            vertexEndingCode += "  output.".concat(name_6, " = ").concat(name_6, ";\n");
        }
        vertexEndingCode += "  return output;";
        vertexCode = this._injectStartingAndEndingCode(vertexCode, "fn main", vertexStartingCode, vertexEndingCode);
        // fragment code
        fragmentCode = fragmentCode.replace(/#define /g, "//#define ");
        fragmentCode = this._processStridedUniformArrays(fragmentCode);
        fragmentCode = fragmentCode.replace(/dpdy/g, "(-internals.yFactor__)*dpdy"); // will also handle dpdyCoarse and dpdyFine
        var fragmentBuiltinDecl = "var<private> ".concat(builtInName_position_frag, " : vec4<f32>;\nvar<private> ").concat(builtInName_front_facing, " : bool;\nvar<private> ").concat(builtInName_FragColor, " : vec4<f32>;\nvar<private> ").concat(builtInName_frag_depth, " : f32;\n");
        var fragmentFragmentInputs = "struct FragmentInputs {\n  @builtin(position) position : vec4<f32>,\n  @builtin(front_facing) frontFacing : bool,\n";
        if (this._varyingsWGSL.length > 0) {
            fragmentFragmentInputs += this._varyingsWGSL.join("\n");
        }
        fragmentFragmentInputs += "\n};\n";
        var fragmentOutputs = "struct FragmentOutputs {\n  @location(0) color : vec4<f32>,\n";
        var hasFragDepth = false;
        var idx = 0;
        while (!hasFragDepth) {
            idx = fragmentCode.indexOf(builtInName_frag_depth, idx);
            if (idx < 0) {
                break;
            }
            var saveIndex = idx;
            hasFragDepth = true;
            while (idx > 1 && fragmentCode.charAt(idx) !== "\n") {
                if (fragmentCode.charAt(idx) === "/" && fragmentCode.charAt(idx - 1) === "/") {
                    hasFragDepth = false;
                    break;
                }
                idx--;
            }
            idx = saveIndex + builtInName_frag_depth.length;
        }
        if (hasFragDepth) {
            fragmentOutputs += "  @builtin(frag_depth) fragDepth: f32,\n";
        }
        fragmentOutputs += "};\n";
        fragmentCode = fragmentBuiltinDecl + fragmentFragmentInputs + varyingsDecl + fragmentOutputs + fragmentCode;
        var fragmentStartingCode = "  var output : FragmentOutputs;\n  ".concat(builtInName_position_frag, " = input.position;\n  ").concat(builtInName_front_facing, " = input.frontFacing;\n") + fragCoordCode;
        for (var i = 0; i < this._varyingNamesWGSL.length; ++i) {
            var name_7 = this._varyingNamesWGSL[i];
            fragmentStartingCode += "  ".concat(name_7, " = input.").concat(name_7, ";\n");
        }
        var fragmentEndingCode = "  output.color = ".concat(builtInName_FragColor, ";\n");
        if (hasFragDepth) {
            fragmentEndingCode += "  output.fragDepth = ".concat(builtInName_frag_depth, ";\n");
        }
        fragmentEndingCode += "  return output;";
        fragmentCode = this._injectStartingAndEndingCode(fragmentCode, "fn main", fragmentStartingCode, fragmentEndingCode);
        this._collectBindingNames();
        this._preCreateBindGroupEntries();
        return { vertexCode: vertexCode, fragmentCode: fragmentCode };
    };
    WebGPUShaderProcessorWGSL.prototype._generateLeftOverUBOCode = function (name, uniformBufferDescription) {
        var stridedArrays = "";
        var ubo = "struct ".concat(name, " {\n");
        for (var _i = 0, _a = this._webgpuProcessingContext.leftOverUniforms; _i < _a.length; _i++) {
            var leftOverUniform = _a[_i];
            var type = leftOverUniform.type.replace(/^(.*?)(<.*>)?$/, "$1");
            var size = WebGPUShaderProcessor.UniformSizes[type];
            if (leftOverUniform.length > 0) {
                if (size <= 2) {
                    var stridedArrayType = "".concat(name, "_").concat(this._stridedUniformArrays.length, "_strided_arr");
                    stridedArrays += "struct ".concat(stridedArrayType, " {\n                        @size(16)\n                        el: ").concat(type, ",\n                    }");
                    this._stridedUniformArrays.push(leftOverUniform.name);
                    ubo += " @align(16) ".concat(leftOverUniform.name, " : array<").concat(stridedArrayType, ", ").concat(leftOverUniform.length, ">,\n");
                }
                else {
                    ubo += " ".concat(leftOverUniform.name, " : array<").concat(leftOverUniform.type, ", ").concat(leftOverUniform.length, ">,\n");
                }
            }
            else {
                ubo += "  ".concat(leftOverUniform.name, " : ").concat(leftOverUniform.type, ",\n");
            }
        }
        ubo += "};\n";
        ubo = "".concat(stridedArrays, "\n").concat(ubo);
        ubo += "@group(".concat(uniformBufferDescription.binding.groupIndex, ") @binding(").concat(uniformBufferDescription.binding.bindingIndex, ") var<uniform> ").concat(leftOverVarName, " : ").concat(name, ";\n");
        return ubo;
    };
    WebGPUShaderProcessorWGSL.prototype._processSamplers = function (code, isVertex) {
        var samplerRegexp = /var\s+(\w+Sampler)\s*:\s*(sampler|sampler_comparison)\s*;/gm;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            var match = samplerRegexp.exec(code);
            if (match === null) {
                break;
            }
            var name_8 = match[1]; // name of the variable
            var samplerType = match[2]; // sampler or sampler_comparison
            var textureName = name_8.indexOf(WebGPUShaderProcessor.AutoSamplerSuffix) === name_8.length - WebGPUShaderProcessor.AutoSamplerSuffix.length
                ? name_8.substring(0, name_8.indexOf(WebGPUShaderProcessor.AutoSamplerSuffix))
                : null;
            var samplerBindingType = samplerType === "sampler_comparison" ? WebGPUConstants.SamplerBindingType.Comparison : WebGPUConstants.SamplerBindingType.Filtering;
            if (textureName) {
                var textureInfo = this._webgpuProcessingContext.availableTextures[textureName];
                if (textureInfo) {
                    textureInfo.autoBindSampler = true;
                }
            }
            var samplerInfo = this._webgpuProcessingContext.availableSamplers[name_8];
            if (!samplerInfo) {
                samplerInfo = {
                    binding: this._webgpuProcessingContext.getNextFreeUBOBinding(),
                    type: samplerBindingType,
                };
                this._webgpuProcessingContext.availableSamplers[name_8] = samplerInfo;
            }
            this._addSamplerBindingDescription(name_8, samplerInfo, isVertex);
            var part1 = code.substring(0, match.index);
            var insertPart = "@group(".concat(samplerInfo.binding.groupIndex, ") @binding(").concat(samplerInfo.binding.bindingIndex, ") ");
            var part2 = code.substring(match.index);
            code = part1 + insertPart + part2;
            samplerRegexp.lastIndex += insertPart.length;
        }
        return code;
    };
    WebGPUShaderProcessorWGSL.prototype._processCustomBuffers = function (code, isVertex) {
        var instantiateBufferRegexp = /var<\s*(uniform|storage)\s*(,\s*(read|read_write)\s*)?>\s+(\S+)\s*:\s*(\S+)\s*;/gm;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            var match = instantiateBufferRegexp.exec(code);
            if (match === null) {
                break;
            }
            var type = match[1];
            var decoration = match[3];
            var name_9 = match[4];
            var structName = match[5];
            var bufferInfo = this._webgpuProcessingContext.availableBuffers[name_9];
            if (!bufferInfo) {
                var knownUBO = type === "uniform" ? WebGPUShaderProcessingContext.KnownUBOs[structName] : null;
                var binding = void 0;
                if (knownUBO) {
                    name_9 = structName;
                    binding = knownUBO.binding;
                    if (binding.groupIndex === -1) {
                        binding = this._webgpuProcessingContext.getNextFreeUBOBinding();
                    }
                }
                else {
                    binding = this._webgpuProcessingContext.getNextFreeUBOBinding();
                }
                bufferInfo = { binding: binding };
                this._webgpuProcessingContext.availableBuffers[name_9] = bufferInfo;
            }
            this._addBufferBindingDescription(name_9, this._webgpuProcessingContext.availableBuffers[name_9], decoration === "read_write"
                ? WebGPUConstants.BufferBindingType.Storage
                : type === "storage"
                    ? WebGPUConstants.BufferBindingType.ReadOnlyStorage
                    : WebGPUConstants.BufferBindingType.Uniform, isVertex);
            var groupIndex = bufferInfo.binding.groupIndex;
            var bindingIndex = bufferInfo.binding.bindingIndex;
            var part1 = code.substring(0, match.index);
            var insertPart = "@group(".concat(groupIndex, ") @binding(").concat(bindingIndex, ") ");
            var part2 = code.substring(match.index);
            code = part1 + insertPart + part2;
            instantiateBufferRegexp.lastIndex += insertPart.length;
        }
        return code;
    };
    WebGPUShaderProcessorWGSL.prototype._processStridedUniformArrays = function (code) {
        for (var _i = 0, _a = this._stridedUniformArrays; _i < _a.length; _i++) {
            var uniformArrayName = _a[_i];
            code = code.replace(new RegExp("".concat(uniformArrayName, "\\s*\\[(.*)\\]"), "g"), "".concat(uniformArrayName, "[$1].el"));
        }
        return code;
    };
    return WebGPUShaderProcessorWGSL;
}(WebGPUShaderProcessor));
export { WebGPUShaderProcessorWGSL };
//# sourceMappingURL=webgpuShaderProcessorsWGSL.js.map