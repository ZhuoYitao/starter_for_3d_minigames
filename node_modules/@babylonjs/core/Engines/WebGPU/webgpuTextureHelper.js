/* eslint-disable @typescript-eslint/naming-convention */
// License for the mipmap generation code:
//
// Copyright 2020 Brandon Jones
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
import * as WebGPUConstants from "./webgpuConstants.js";
import { Scalar } from "../../Maths/math.scalar.js";

import { InternalTextureSource } from "../../Materials/Textures/internalTexture.js";
import { WebGPUHardwareTexture } from "./webgpuHardwareTexture.js";
// TODO WEBGPU improve mipmap generation by using compute shaders
// TODO WEBGPU use WGSL instead of GLSL
var mipmapVertexSource = "\n    const vec2 pos[4] = vec2[4](vec2(-1.0f, 1.0f), vec2(1.0f, 1.0f), vec2(-1.0f, -1.0f), vec2(1.0f, -1.0f));\n    const vec2 tex[4] = vec2[4](vec2(0.0f, 0.0f), vec2(1.0f, 0.0f), vec2(0.0f, 1.0f), vec2(1.0f, 1.0f));\n\n    layout(location = 0) out vec2 vTex;\n\n    void main() {\n        vTex = tex[gl_VertexIndex];\n        gl_Position = vec4(pos[gl_VertexIndex], 0.0, 1.0);\n    }\n    ";
var mipmapFragmentSource = "\n    layout(set = 0, binding = 0) uniform sampler imgSampler;\n    layout(set = 0, binding = 1) uniform texture2D img;\n\n    layout(location = 0) in vec2 vTex;\n    layout(location = 0) out vec4 outColor;\n\n    void main() {\n        outColor = texture(sampler2D(img, imgSampler), vTex);\n    }\n    ";
var invertYPreMultiplyAlphaVertexSource = "\n    #extension GL_EXT_samplerless_texture_functions : enable\n\n    const vec2 pos[4] = vec2[4](vec2(-1.0f, 1.0f), vec2(1.0f, 1.0f), vec2(-1.0f, -1.0f), vec2(1.0f, -1.0f));\n    const vec2 tex[4] = vec2[4](vec2(0.0f, 0.0f), vec2(1.0f, 0.0f), vec2(0.0f, 1.0f), vec2(1.0f, 1.0f));\n\n    layout(set = 0, binding = 0) uniform texture2D img;\n\n    #ifdef INVERTY\n        layout(location = 0) out flat ivec2 vTextureSize;\n    #endif\n\n    void main() {\n        #ifdef INVERTY\n            vTextureSize = textureSize(img, 0);\n        #endif\n        gl_Position = vec4(pos[gl_VertexIndex], 0.0, 1.0);\n    }\n    ";
var invertYPreMultiplyAlphaFragmentSource = "\n    #extension GL_EXT_samplerless_texture_functions : enable\n\n    layout(set = 0, binding = 0) uniform texture2D img;\n\n    #ifdef INVERTY\n        layout(location = 0) in flat ivec2 vTextureSize;\n    #endif\n    layout(location = 0) out vec4 outColor;\n\n    void main() {\n    #ifdef INVERTY\n        vec4 color = texelFetch(img, ivec2(gl_FragCoord.x, vTextureSize.y - gl_FragCoord.y), 0);\n    #else\n        vec4 color = texelFetch(img, ivec2(gl_FragCoord.xy), 0);\n    #endif\n    #ifdef PREMULTIPLYALPHA\n        color.rgb *= color.a;\n    #endif\n        outColor = color;\n    }\n    ";
var invertYPreMultiplyAlphaWithOfstVertexSource = invertYPreMultiplyAlphaVertexSource;
var invertYPreMultiplyAlphaWithOfstFragmentSource = "\n    #extension GL_EXT_samplerless_texture_functions : enable\n\n    layout(set = 0, binding = 0) uniform texture2D img;\n    layout(set = 0, binding = 1) uniform Params {\n        float ofstX;\n        float ofstY;\n        float width;\n        float height;\n    };\n\n    #ifdef INVERTY\n        layout(location = 0) in flat ivec2 vTextureSize;\n    #endif\n    layout(location = 0) out vec4 outColor;\n\n    void main() {\n        if (gl_FragCoord.x < ofstX || gl_FragCoord.x >= ofstX + width) {\n            discard;\n        }\n        if (gl_FragCoord.y < ofstY || gl_FragCoord.y >= ofstY + height) {\n            discard;\n        }\n    #ifdef INVERTY\n        vec4 color = texelFetch(img, ivec2(gl_FragCoord.x, ofstY + height - (gl_FragCoord.y - ofstY)), 0);\n    #else\n        vec4 color = texelFetch(img, ivec2(gl_FragCoord.xy), 0);\n    #endif\n    #ifdef PREMULTIPLYALPHA\n        color.rgb *= color.a;\n    #endif\n        outColor = color;\n    }\n    ";
var clearVertexSource = "\n    const vec2 pos[4] = vec2[4](vec2(-1.0f, 1.0f), vec2(1.0f, 1.0f), vec2(-1.0f, -1.0f), vec2(1.0f, -1.0f));\n\n    void main() {\n        gl_Position = vec4(pos[gl_VertexIndex], 0.0, 1.0);\n    }\n    ";
var clearFragmentSource = "\n    layout(set = 0, binding = 0) uniform Uniforms {\n        uniform vec4 color;\n    };\n\n    layout(location = 0) out vec4 outColor;\n\n    void main() {\n        outColor = color;\n    }\n    ";
var PipelineType;
(function (PipelineType) {
    PipelineType[PipelineType["MipMap"] = 0] = "MipMap";
    PipelineType[PipelineType["InvertYPremultiplyAlpha"] = 1] = "InvertYPremultiplyAlpha";
    PipelineType[PipelineType["Clear"] = 2] = "Clear";
    PipelineType[PipelineType["InvertYPremultiplyAlphaWithOfst"] = 3] = "InvertYPremultiplyAlphaWithOfst";
})(PipelineType || (PipelineType = {}));
var shadersForPipelineType = [
    { vertex: mipmapVertexSource, fragment: mipmapFragmentSource },
    { vertex: invertYPreMultiplyAlphaVertexSource, fragment: invertYPreMultiplyAlphaFragmentSource },
    { vertex: clearVertexSource, fragment: clearFragmentSource },
    { vertex: invertYPreMultiplyAlphaWithOfstVertexSource, fragment: invertYPreMultiplyAlphaWithOfstFragmentSource },
];
/**
 * Map a (renderable) texture format (GPUTextureFormat) to an index for fast lookup (in caches for eg)
 */
export var renderableTextureFormatToIndex = {
    "": 0,
    r8unorm: 1,
    r8uint: 2,
    r8sint: 3,
    r16uint: 4,
    r16sint: 5,
    r16float: 6,
    rg8unorm: 7,
    rg8uint: 8,
    rg8sint: 9,
    r32uint: 10,
    r32sint: 11,
    r32float: 12,
    rg16uint: 13,
    rg16sint: 14,
    rg16float: 15,
    rgba8unorm: 16,
    "rgba8unorm-srgb": 17,
    rgba8uint: 18,
    rgba8sint: 19,
    bgra8unorm: 20,
    "bgra8unorm-srgb": 21,
    rgb10a2unorm: 22,
    rg32uint: 23,
    rg32sint: 24,
    rg32float: 25,
    rgba16uint: 26,
    rgba16sint: 27,
    rgba16float: 28,
    rgba32uint: 29,
    rgba32sint: 30,
    rgba32float: 31,
    stencil8: 32,
    depth16unorm: 33,
    depth24plus: 34,
    "depth24plus-stencil8": 35,
    depth32float: 36,
    "depth24unorm-stencil8": 37,
    "depth32float-stencil8": 38,
};
/** @hidden */
var WebGPUTextureHelper = /** @class */ (function () {
    //------------------------------------------------------------------------------
    //                         Initialization / Helpers
    //------------------------------------------------------------------------------
    function WebGPUTextureHelper(device, glslang, tintWASM, bufferManager) {
        this._pipelines = {};
        this._compiledShaders = [];
        this._deferredReleaseTextures = [];
        this._device = device;
        this._glslang = glslang;
        this._tintWASM = tintWASM;
        this._bufferManager = bufferManager;
        this._mipmapSampler = device.createSampler({ minFilter: WebGPUConstants.FilterMode.Linear });
        this._ubCopyWithOfst = this._bufferManager.createBuffer(4 * 4, WebGPUConstants.BufferUsage.Uniform | WebGPUConstants.BufferUsage.CopyDst).underlyingResource;
        this._getPipeline(WebGPUConstants.TextureFormat.RGBA8Unorm);
    }
    WebGPUTextureHelper.ComputeNumMipmapLevels = function (width, height) {
        return Scalar.ILog2(Math.max(width, height)) + 1;
    };
    WebGPUTextureHelper.prototype._getPipeline = function (format, type, params) {
        if (type === void 0) { type = PipelineType.MipMap; }
        var index = type === PipelineType.MipMap
            ? 1 << 0
            : type === PipelineType.InvertYPremultiplyAlpha
                ? ((params.invertY ? 1 : 0) << 1) + ((params.premultiplyAlpha ? 1 : 0) << 2)
                : type === PipelineType.Clear
                    ? 1 << 3
                    : type === PipelineType.InvertYPremultiplyAlphaWithOfst
                        ? ((params.invertY ? 1 : 0) << 4) + ((params.premultiplyAlpha ? 1 : 0) << 5)
                        : 0;
        if (!this._pipelines[format]) {
            this._pipelines[format] = [];
        }
        var pipelineAndBGL = this._pipelines[format][index];
        if (!pipelineAndBGL) {
            var defines = "#version 450\r\n";
            if (type === PipelineType.InvertYPremultiplyAlpha || type === PipelineType.InvertYPremultiplyAlphaWithOfst) {
                if (params.invertY) {
                    defines += "#define INVERTY\r\n";
                }
                if (params.premultiplyAlpha) {
                    defines += "#define PREMULTIPLYALPHA\r\n";
                }
            }
            var modules = this._compiledShaders[index];
            if (!modules) {
                var vertexCode = this._glslang.compileGLSL(defines + shadersForPipelineType[type].vertex, "vertex");
                var fragmentCode = this._glslang.compileGLSL(defines + shadersForPipelineType[type].fragment, "fragment");
                if (this._tintWASM) {
                    vertexCode = this._tintWASM.convertSpirV2WGSL(vertexCode);
                    fragmentCode = this._tintWASM.convertSpirV2WGSL(fragmentCode);
                }
                var vertexModule = this._device.createShaderModule({
                    code: vertexCode,
                });
                var fragmentModule = this._device.createShaderModule({
                    code: fragmentCode,
                });
                modules = this._compiledShaders[index] = [vertexModule, fragmentModule];
            }
            var pipeline = this._device.createRenderPipeline({
                vertex: {
                    module: modules[0],
                    entryPoint: "main",
                },
                fragment: {
                    module: modules[1],
                    entryPoint: "main",
                    targets: [
                        {
                            format: format,
                        },
                    ],
                },
                primitive: {
                    topology: WebGPUConstants.PrimitiveTopology.TriangleStrip,
                    stripIndexFormat: WebGPUConstants.IndexFormat.Uint16,
                },
            });
            pipelineAndBGL = this._pipelines[format][index] = [pipeline, pipeline.getBindGroupLayout(0)];
        }
        return pipelineAndBGL;
    };
    WebGPUTextureHelper._GetTextureTypeFromFormat = function (format) {
        switch (format) {
            // One Component = 8 bits
            case WebGPUConstants.TextureFormat.R8Unorm:
            case WebGPUConstants.TextureFormat.R8Snorm:
            case WebGPUConstants.TextureFormat.R8Uint:
            case WebGPUConstants.TextureFormat.R8Sint:
            case WebGPUConstants.TextureFormat.RG8Unorm:
            case WebGPUConstants.TextureFormat.RG8Snorm:
            case WebGPUConstants.TextureFormat.RG8Uint:
            case WebGPUConstants.TextureFormat.RG8Sint:
            case WebGPUConstants.TextureFormat.RGBA8Unorm:
            case WebGPUConstants.TextureFormat.RGBA8UnormSRGB:
            case WebGPUConstants.TextureFormat.RGBA8Snorm:
            case WebGPUConstants.TextureFormat.RGBA8Uint:
            case WebGPUConstants.TextureFormat.RGBA8Sint:
            case WebGPUConstants.TextureFormat.BGRA8Unorm:
            case WebGPUConstants.TextureFormat.BGRA8UnormSRGB:
            case WebGPUConstants.TextureFormat.RGB10A2Unorm: // composite format - let's say it's byte...
            case WebGPUConstants.TextureFormat.RGB9E5UFloat: // composite format - let's say it's byte...
            case WebGPUConstants.TextureFormat.RG11B10UFloat: // composite format - let's say it's byte...
            case WebGPUConstants.TextureFormat.Depth24UnormStencil8: // composite format - let's say it's byte...
            case WebGPUConstants.TextureFormat.Depth32FloatStencil8: // composite format - let's say it's byte...
            case WebGPUConstants.TextureFormat.BC7RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC7RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC6HRGBUFloat:
            case WebGPUConstants.TextureFormat.BC6HRGBFloat:
            case WebGPUConstants.TextureFormat.BC5RGUnorm:
            case WebGPUConstants.TextureFormat.BC5RGSnorm:
            case WebGPUConstants.TextureFormat.BC3RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC3RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC2RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC2RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC4RUnorm:
            case WebGPUConstants.TextureFormat.BC4RSnorm:
            case WebGPUConstants.TextureFormat.BC1RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC1RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.ETC2RGB8Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGB8UnormSRGB:
            case WebGPUConstants.TextureFormat.ETC2RGB8A1Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGB8A1UnormSRGB:
            case WebGPUConstants.TextureFormat.ETC2RGBA8Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGBA8UnormSRGB:
            case WebGPUConstants.TextureFormat.EACR11Unorm:
            case WebGPUConstants.TextureFormat.EACR11Snorm:
            case WebGPUConstants.TextureFormat.EACRG11Unorm:
            case WebGPUConstants.TextureFormat.EACRG11Snorm:
            case WebGPUConstants.TextureFormat.ASTC4x4Unorm:
            case WebGPUConstants.TextureFormat.ASTC4x4UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC5x4Unorm:
            case WebGPUConstants.TextureFormat.ASTC5x4UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC5x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC5x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC6x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC6x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC6x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC6x6UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC8x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC8x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x6UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC8x8Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x8UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x6UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x8Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x8UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x10Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x10UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC12x10Unorm:
            case WebGPUConstants.TextureFormat.ASTC12x10UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC12x12Unorm:
            case WebGPUConstants.TextureFormat.ASTC12x12UnormSRGB:
                return 0;
            // One component = 16 bits
            case WebGPUConstants.TextureFormat.R16Uint:
            case WebGPUConstants.TextureFormat.R16Sint:
            case WebGPUConstants.TextureFormat.RG16Uint:
            case WebGPUConstants.TextureFormat.RG16Sint:
            case WebGPUConstants.TextureFormat.RGBA16Uint:
            case WebGPUConstants.TextureFormat.RGBA16Sint:
            case WebGPUConstants.TextureFormat.Depth16Unorm:
                return 5;
            case WebGPUConstants.TextureFormat.R16Float:
            case WebGPUConstants.TextureFormat.RG16Float:
            case WebGPUConstants.TextureFormat.RGBA16Float:
                return 2;
            // One component = 32 bits
            case WebGPUConstants.TextureFormat.R32Uint:
            case WebGPUConstants.TextureFormat.R32Sint:
            case WebGPUConstants.TextureFormat.RG32Uint:
            case WebGPUConstants.TextureFormat.RG32Sint:
            case WebGPUConstants.TextureFormat.RGBA32Uint:
            case WebGPUConstants.TextureFormat.RGBA32Sint:
                return 7;
            case WebGPUConstants.TextureFormat.R32Float:
            case WebGPUConstants.TextureFormat.RG32Float:
            case WebGPUConstants.TextureFormat.RGBA32Float:
            case WebGPUConstants.TextureFormat.Depth32Float:
                return 1;
            case WebGPUConstants.TextureFormat.Stencil8:
                throw "No fixed size for Stencil8 format!";
            case WebGPUConstants.TextureFormat.Depth24Plus:
                throw "No fixed size for Depth24Plus format!";
            case WebGPUConstants.TextureFormat.Depth24PlusStencil8:
                throw "No fixed size for Depth24PlusStencil8 format!";
        }
        return 0;
    };
    WebGPUTextureHelper._GetBlockInformationFromFormat = function (format) {
        switch (format) {
            // 8 bits formats
            case WebGPUConstants.TextureFormat.R8Unorm:
            case WebGPUConstants.TextureFormat.R8Snorm:
            case WebGPUConstants.TextureFormat.R8Uint:
            case WebGPUConstants.TextureFormat.R8Sint:
                return { width: 1, height: 1, length: 1 };
            // 16 bits formats
            case WebGPUConstants.TextureFormat.R16Uint:
            case WebGPUConstants.TextureFormat.R16Sint:
            case WebGPUConstants.TextureFormat.R16Float:
            case WebGPUConstants.TextureFormat.RG8Unorm:
            case WebGPUConstants.TextureFormat.RG8Snorm:
            case WebGPUConstants.TextureFormat.RG8Uint:
            case WebGPUConstants.TextureFormat.RG8Sint:
                return { width: 1, height: 1, length: 2 };
            // 32 bits formats
            case WebGPUConstants.TextureFormat.R32Uint:
            case WebGPUConstants.TextureFormat.R32Sint:
            case WebGPUConstants.TextureFormat.R32Float:
            case WebGPUConstants.TextureFormat.RG16Uint:
            case WebGPUConstants.TextureFormat.RG16Sint:
            case WebGPUConstants.TextureFormat.RG16Float:
            case WebGPUConstants.TextureFormat.RGBA8Unorm:
            case WebGPUConstants.TextureFormat.RGBA8UnormSRGB:
            case WebGPUConstants.TextureFormat.RGBA8Snorm:
            case WebGPUConstants.TextureFormat.RGBA8Uint:
            case WebGPUConstants.TextureFormat.RGBA8Sint:
            case WebGPUConstants.TextureFormat.BGRA8Unorm:
            case WebGPUConstants.TextureFormat.BGRA8UnormSRGB:
            case WebGPUConstants.TextureFormat.RGB9E5UFloat:
            case WebGPUConstants.TextureFormat.RGB10A2Unorm:
            case WebGPUConstants.TextureFormat.RG11B10UFloat:
                return { width: 1, height: 1, length: 4 };
            // 64 bits formats
            case WebGPUConstants.TextureFormat.RG32Uint:
            case WebGPUConstants.TextureFormat.RG32Sint:
            case WebGPUConstants.TextureFormat.RG32Float:
            case WebGPUConstants.TextureFormat.RGBA16Uint:
            case WebGPUConstants.TextureFormat.RGBA16Sint:
            case WebGPUConstants.TextureFormat.RGBA16Float:
                return { width: 1, height: 1, length: 8 };
            // 128 bits formats
            case WebGPUConstants.TextureFormat.RGBA32Uint:
            case WebGPUConstants.TextureFormat.RGBA32Sint:
            case WebGPUConstants.TextureFormat.RGBA32Float:
                return { width: 1, height: 1, length: 16 };
            // Depth and stencil formats
            case WebGPUConstants.TextureFormat.Stencil8:
                throw "No fixed size for Stencil8 format!";
            case WebGPUConstants.TextureFormat.Depth16Unorm:
                return { width: 1, height: 1, length: 2 };
            case WebGPUConstants.TextureFormat.Depth24Plus:
                throw "No fixed size for Depth24Plus format!";
            case WebGPUConstants.TextureFormat.Depth24PlusStencil8:
                throw "No fixed size for Depth24PlusStencil8 format!";
            case WebGPUConstants.TextureFormat.Depth32Float:
                return { width: 1, height: 1, length: 4 };
            case WebGPUConstants.TextureFormat.Depth24UnormStencil8:
                return { width: 1, height: 1, length: 4 };
            case WebGPUConstants.TextureFormat.Depth32FloatStencil8:
                return { width: 1, height: 1, length: 5 };
            // BC compressed formats usable if "texture-compression-bc" is both
            // supported by the device/user agent and enabled in requestDevice.
            case WebGPUConstants.TextureFormat.BC7RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC7RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC6HRGBUFloat:
            case WebGPUConstants.TextureFormat.BC6HRGBFloat:
            case WebGPUConstants.TextureFormat.BC5RGUnorm:
            case WebGPUConstants.TextureFormat.BC5RGSnorm:
            case WebGPUConstants.TextureFormat.BC3RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC3RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC2RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC2RGBAUnormSRGB:
                return { width: 4, height: 4, length: 16 };
            case WebGPUConstants.TextureFormat.BC4RUnorm:
            case WebGPUConstants.TextureFormat.BC4RSnorm:
            case WebGPUConstants.TextureFormat.BC1RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC1RGBAUnormSRGB:
                return { width: 4, height: 4, length: 8 };
            // ETC2 compressed formats usable if "texture-compression-etc2" is both
            // supported by the device/user agent and enabled in requestDevice.
            case WebGPUConstants.TextureFormat.ETC2RGB8Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGB8UnormSRGB:
            case WebGPUConstants.TextureFormat.ETC2RGB8A1Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGB8A1UnormSRGB:
            case WebGPUConstants.TextureFormat.EACR11Unorm:
            case WebGPUConstants.TextureFormat.EACR11Snorm:
                return { width: 4, height: 4, length: 8 };
            case WebGPUConstants.TextureFormat.ETC2RGBA8Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGBA8UnormSRGB:
            case WebGPUConstants.TextureFormat.EACRG11Unorm:
            case WebGPUConstants.TextureFormat.EACRG11Snorm:
                return { width: 4, height: 4, length: 16 };
            // ASTC compressed formats usable if "texture-compression-astc" is both
            // supported by the device/user agent and enabled in requestDevice.
            case WebGPUConstants.TextureFormat.ASTC4x4Unorm:
            case WebGPUConstants.TextureFormat.ASTC4x4UnormSRGB:
                return { width: 4, height: 4, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC5x4Unorm:
            case WebGPUConstants.TextureFormat.ASTC5x4UnormSRGB:
                return { width: 5, height: 4, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC5x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC5x5UnormSRGB:
                return { width: 5, height: 5, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC6x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC6x5UnormSRGB:
                return { width: 6, height: 5, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC6x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC6x6UnormSRGB:
                return { width: 6, height: 6, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC8x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x5UnormSRGB:
                return { width: 8, height: 5, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC8x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x6UnormSRGB:
                return { width: 8, height: 6, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC8x8Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x8UnormSRGB:
                return { width: 8, height: 8, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC10x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x5UnormSRGB:
                return { width: 10, height: 5, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC10x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x6UnormSRGB:
                return { width: 10, height: 6, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC10x8Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x8UnormSRGB:
                return { width: 10, height: 8, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC10x10Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x10UnormSRGB:
                return { width: 10, height: 10, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC12x10Unorm:
            case WebGPUConstants.TextureFormat.ASTC12x10UnormSRGB:
                return { width: 12, height: 10, length: 16 };
            case WebGPUConstants.TextureFormat.ASTC12x12Unorm:
            case WebGPUConstants.TextureFormat.ASTC12x12UnormSRGB:
                return { width: 12, height: 12, length: 16 };
        }
        return { width: 1, height: 1, length: 4 };
    };
    WebGPUTextureHelper._IsHardwareTexture = function (texture) {
        return !!texture.release;
    };
    WebGPUTextureHelper._IsInternalTexture = function (texture) {
        return !!texture.dispose;
    };
    WebGPUTextureHelper.IsImageBitmap = function (imageBitmap) {
        return imageBitmap.close !== undefined;
    };
    WebGPUTextureHelper.IsImageBitmapArray = function (imageBitmap) {
        return Array.isArray(imageBitmap) && imageBitmap[0].close !== undefined;
    };
    WebGPUTextureHelper.prototype.setCommandEncoder = function (encoder) {
        this._commandEncoderForCreation = encoder;
    };
    WebGPUTextureHelper.IsCompressedFormat = function (format) {
        switch (format) {
            case WebGPUConstants.TextureFormat.BC7RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC7RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC6HRGBFloat:
            case WebGPUConstants.TextureFormat.BC6HRGBUFloat:
            case WebGPUConstants.TextureFormat.BC5RGSnorm:
            case WebGPUConstants.TextureFormat.BC5RGUnorm:
            case WebGPUConstants.TextureFormat.BC4RSnorm:
            case WebGPUConstants.TextureFormat.BC4RUnorm:
            case WebGPUConstants.TextureFormat.BC3RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC3RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC2RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC2RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC1RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC1RGBAUnorm:
            case WebGPUConstants.TextureFormat.ETC2RGB8Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGB8UnormSRGB:
            case WebGPUConstants.TextureFormat.ETC2RGB8A1Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGB8A1UnormSRGB:
            case WebGPUConstants.TextureFormat.ETC2RGBA8Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGBA8UnormSRGB:
            case WebGPUConstants.TextureFormat.EACR11Unorm:
            case WebGPUConstants.TextureFormat.EACR11Snorm:
            case WebGPUConstants.TextureFormat.EACRG11Unorm:
            case WebGPUConstants.TextureFormat.EACRG11Snorm:
            case WebGPUConstants.TextureFormat.ASTC4x4Unorm:
            case WebGPUConstants.TextureFormat.ASTC4x4UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC5x4Unorm:
            case WebGPUConstants.TextureFormat.ASTC5x4UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC5x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC5x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC6x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC6x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC6x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC6x6UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC8x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC8x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x6UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC8x8Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x8UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x6UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x8Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x8UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x10Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x10UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC12x10Unorm:
            case WebGPUConstants.TextureFormat.ASTC12x10UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC12x12Unorm:
            case WebGPUConstants.TextureFormat.ASTC12x12UnormSRGB:
                return true;
        }
        return false;
    };
    WebGPUTextureHelper.GetWebGPUTextureFormat = function (type, format, useSRGBBuffer) {
        if (useSRGBBuffer === void 0) { useSRGBBuffer = false; }
        switch (format) {
            case 15:
                return WebGPUConstants.TextureFormat.Depth16Unorm;
            case 16:
                return WebGPUConstants.TextureFormat.Depth24Plus;
            case 13:
                return WebGPUConstants.TextureFormat.Depth24PlusStencil8;
            case 14:
                return WebGPUConstants.TextureFormat.Depth32Float;
            case 17:
                return WebGPUConstants.TextureFormat.Depth24UnormStencil8;
            case 18:
                return WebGPUConstants.TextureFormat.Depth32FloatStencil8;
            case 36492:
                return useSRGBBuffer ? WebGPUConstants.TextureFormat.BC7RGBAUnormSRGB : WebGPUConstants.TextureFormat.BC7RGBAUnorm;
            case 36495:
                return WebGPUConstants.TextureFormat.BC6HRGBUFloat;
            case 36494:
                return WebGPUConstants.TextureFormat.BC6HRGBFloat;
            case 33779:
                return useSRGBBuffer ? WebGPUConstants.TextureFormat.BC3RGBAUnormSRGB : WebGPUConstants.TextureFormat.BC3RGBAUnorm;
            case 33778:
                return useSRGBBuffer ? WebGPUConstants.TextureFormat.BC2RGBAUnormSRGB : WebGPUConstants.TextureFormat.BC2RGBAUnorm;
            case 33777:
            case 33776:
                return useSRGBBuffer ? WebGPUConstants.TextureFormat.BC1RGBAUnormSRGB : WebGPUConstants.TextureFormat.BC1RGBAUnorm;
            case 37808:
                return useSRGBBuffer ? WebGPUConstants.TextureFormat.ASTC4x4UnormSRGB : WebGPUConstants.TextureFormat.ASTC4x4Unorm;
            case 36196:
                return useSRGBBuffer ? WebGPUConstants.TextureFormat.ETC2RGB8UnormSRGB : WebGPUConstants.TextureFormat.ETC2RGB8Unorm;
        }
        switch (type) {
            case 3:
                switch (format) {
                    case 6:
                        return WebGPUConstants.TextureFormat.R8Snorm;
                    case 7:
                        return WebGPUConstants.TextureFormat.RG8Snorm;
                    case 4:
                        throw "RGB format not supported in WebGPU";
                    case 8:
                        return WebGPUConstants.TextureFormat.R8Sint;
                    case 9:
                        return WebGPUConstants.TextureFormat.RG8Sint;
                    case 10:
                        throw "RGB_INTEGER format not supported in WebGPU";
                    case 11:
                        return WebGPUConstants.TextureFormat.RGBA8Sint;
                    default:
                        return WebGPUConstants.TextureFormat.RGBA8Snorm;
                }
            case 0:
                switch (format) {
                    case 6:
                        return WebGPUConstants.TextureFormat.R8Unorm;
                    case 7:
                        return WebGPUConstants.TextureFormat.RG8Unorm;
                    case 4:
                        throw "TEXTUREFORMAT_RGB format not supported in WebGPU";
                    case 5:
                        return useSRGBBuffer ? WebGPUConstants.TextureFormat.RGBA8UnormSRGB : WebGPUConstants.TextureFormat.RGBA8Unorm;
                    case 12:
                        return useSRGBBuffer ? WebGPUConstants.TextureFormat.BGRA8UnormSRGB : WebGPUConstants.TextureFormat.BGRA8Unorm;
                    case 8:
                        return WebGPUConstants.TextureFormat.R8Uint;
                    case 9:
                        return WebGPUConstants.TextureFormat.RG8Uint;
                    case 10:
                        throw "RGB_INTEGER format not supported in WebGPU";
                    case 11:
                        return WebGPUConstants.TextureFormat.RGBA8Uint;
                    case 0:
                        throw "TEXTUREFORMAT_ALPHA format not supported in WebGPU";
                    case 1:
                        throw "TEXTUREFORMAT_LUMINANCE format not supported in WebGPU";
                    case 2:
                        throw "TEXTUREFORMAT_LUMINANCE_ALPHA format not supported in WebGPU";
                    default:
                        return WebGPUConstants.TextureFormat.RGBA8Unorm;
                }
            case 4:
                switch (format) {
                    case 8:
                        return WebGPUConstants.TextureFormat.R16Sint;
                    case 9:
                        return WebGPUConstants.TextureFormat.RG16Sint;
                    case 10:
                        throw "TEXTUREFORMAT_RGB_INTEGER format not supported in WebGPU";
                    case 11:
                        return WebGPUConstants.TextureFormat.RGBA16Sint;
                    default:
                        return WebGPUConstants.TextureFormat.RGBA16Sint;
                }
            case 5:
                switch (format) {
                    case 8:
                        return WebGPUConstants.TextureFormat.R16Uint;
                    case 9:
                        return WebGPUConstants.TextureFormat.RG16Uint;
                    case 10:
                        throw "TEXTUREFORMAT_RGB_INTEGER format not supported in WebGPU";
                    case 11:
                        return WebGPUConstants.TextureFormat.RGBA16Uint;
                    default:
                        return WebGPUConstants.TextureFormat.RGBA16Uint;
                }
            case 6:
                switch (format) {
                    case 8:
                        return WebGPUConstants.TextureFormat.R32Sint;
                    case 9:
                        return WebGPUConstants.TextureFormat.RG32Sint;
                    case 10:
                        throw "TEXTUREFORMAT_RGB_INTEGER format not supported in WebGPU";
                    case 11:
                        return WebGPUConstants.TextureFormat.RGBA32Sint;
                    default:
                        return WebGPUConstants.TextureFormat.RGBA32Sint;
                }
            case 7: // Refers to UNSIGNED_INT
                switch (format) {
                    case 8:
                        return WebGPUConstants.TextureFormat.R32Uint;
                    case 9:
                        return WebGPUConstants.TextureFormat.RG32Uint;
                    case 10:
                        throw "TEXTUREFORMAT_RGB_INTEGER format not supported in WebGPU";
                    case 11:
                        return WebGPUConstants.TextureFormat.RGBA32Uint;
                    default:
                        return WebGPUConstants.TextureFormat.RGBA32Uint;
                }
            case 1:
                switch (format) {
                    case 6:
                        return WebGPUConstants.TextureFormat.R32Float; // By default. Other possibility is R16Float.
                    case 7:
                        return WebGPUConstants.TextureFormat.RG32Float; // By default. Other possibility is RG16Float.
                    case 4:
                        throw "TEXTUREFORMAT_RGB format not supported in WebGPU";
                    case 5:
                        return WebGPUConstants.TextureFormat.RGBA32Float; // By default. Other possibility is RGBA16Float.
                    default:
                        return WebGPUConstants.TextureFormat.RGBA32Float;
                }
            case 2:
                switch (format) {
                    case 6:
                        return WebGPUConstants.TextureFormat.R16Float;
                    case 7:
                        return WebGPUConstants.TextureFormat.RG16Float;
                    case 4:
                        throw "TEXTUREFORMAT_RGB format not supported in WebGPU";
                    case 5:
                        return WebGPUConstants.TextureFormat.RGBA16Float;
                    default:
                        return WebGPUConstants.TextureFormat.RGBA16Float;
                }
            case 10:
                throw "TEXTURETYPE_UNSIGNED_SHORT_5_6_5 format not supported in WebGPU";
            case 13:
                throw "TEXTURETYPE_UNSIGNED_INT_10F_11F_11F_REV format not supported in WebGPU";
            case 14:
                throw "TEXTURETYPE_UNSIGNED_INT_5_9_9_9_REV format not supported in WebGPU";
            case 8:
                throw "TEXTURETYPE_UNSIGNED_SHORT_4_4_4_4 format not supported in WebGPU";
            case 9:
                throw "TEXTURETYPE_UNSIGNED_SHORT_5_5_5_1 format not supported in WebGPU";
            case 11:
                switch (format) {
                    case 5:
                        return WebGPUConstants.TextureFormat.RGB10A2Unorm;
                    case 11:
                        throw "TEXTUREFORMAT_RGBA_INTEGER format not supported in WebGPU when type is TEXTURETYPE_UNSIGNED_INT_2_10_10_10_REV";
                    default:
                        return WebGPUConstants.TextureFormat.RGB10A2Unorm;
                }
        }
        return useSRGBBuffer ? WebGPUConstants.TextureFormat.RGBA8UnormSRGB : WebGPUConstants.TextureFormat.RGBA8Unorm;
    };
    WebGPUTextureHelper.GetNumChannelsFromWebGPUTextureFormat = function (format) {
        switch (format) {
            case WebGPUConstants.TextureFormat.R8Unorm:
            case WebGPUConstants.TextureFormat.R8Snorm:
            case WebGPUConstants.TextureFormat.R8Uint:
            case WebGPUConstants.TextureFormat.R8Sint:
            case WebGPUConstants.TextureFormat.BC4RUnorm:
            case WebGPUConstants.TextureFormat.BC4RSnorm:
            case WebGPUConstants.TextureFormat.R16Uint:
            case WebGPUConstants.TextureFormat.R16Sint:
            case WebGPUConstants.TextureFormat.Depth16Unorm:
            case WebGPUConstants.TextureFormat.R16Float:
            case WebGPUConstants.TextureFormat.R32Uint:
            case WebGPUConstants.TextureFormat.R32Sint:
            case WebGPUConstants.TextureFormat.R32Float:
            case WebGPUConstants.TextureFormat.Depth32Float:
            case WebGPUConstants.TextureFormat.Stencil8:
            case WebGPUConstants.TextureFormat.Depth24Plus:
            case WebGPUConstants.TextureFormat.EACR11Unorm:
            case WebGPUConstants.TextureFormat.EACR11Snorm:
                return 1;
            case WebGPUConstants.TextureFormat.RG8Unorm:
            case WebGPUConstants.TextureFormat.RG8Snorm:
            case WebGPUConstants.TextureFormat.RG8Uint:
            case WebGPUConstants.TextureFormat.RG8Sint:
            case WebGPUConstants.TextureFormat.Depth24UnormStencil8: // composite format - let's say it's byte...
            case WebGPUConstants.TextureFormat.Depth32FloatStencil8: // composite format - let's say it's byte...
            case WebGPUConstants.TextureFormat.BC5RGUnorm:
            case WebGPUConstants.TextureFormat.BC5RGSnorm:
            case WebGPUConstants.TextureFormat.RG16Uint:
            case WebGPUConstants.TextureFormat.RG16Sint:
            case WebGPUConstants.TextureFormat.RG16Float:
            case WebGPUConstants.TextureFormat.RG32Uint:
            case WebGPUConstants.TextureFormat.RG32Sint:
            case WebGPUConstants.TextureFormat.RG32Float:
            case WebGPUConstants.TextureFormat.Depth24PlusStencil8:
            case WebGPUConstants.TextureFormat.EACRG11Unorm:
            case WebGPUConstants.TextureFormat.EACRG11Snorm:
                return 2;
            case WebGPUConstants.TextureFormat.RGB9E5UFloat: // composite format - let's say it's byte...
            case WebGPUConstants.TextureFormat.RG11B10UFloat: // composite format - let's say it's byte...
            case WebGPUConstants.TextureFormat.BC6HRGBUFloat:
            case WebGPUConstants.TextureFormat.BC6HRGBFloat:
            case WebGPUConstants.TextureFormat.ETC2RGB8Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGB8UnormSRGB:
                return 3;
            case WebGPUConstants.TextureFormat.RGBA8Unorm:
            case WebGPUConstants.TextureFormat.RGBA8UnormSRGB:
            case WebGPUConstants.TextureFormat.RGBA8Snorm:
            case WebGPUConstants.TextureFormat.RGBA8Uint:
            case WebGPUConstants.TextureFormat.RGBA8Sint:
            case WebGPUConstants.TextureFormat.BGRA8Unorm:
            case WebGPUConstants.TextureFormat.BGRA8UnormSRGB:
            case WebGPUConstants.TextureFormat.RGB10A2Unorm: // composite format - let's say it's byte...
            case WebGPUConstants.TextureFormat.BC7RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC7RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC3RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC3RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC2RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC2RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.BC1RGBAUnorm:
            case WebGPUConstants.TextureFormat.BC1RGBAUnormSRGB:
            case WebGPUConstants.TextureFormat.RGBA16Uint:
            case WebGPUConstants.TextureFormat.RGBA16Sint:
            case WebGPUConstants.TextureFormat.RGBA16Float:
            case WebGPUConstants.TextureFormat.RGBA32Uint:
            case WebGPUConstants.TextureFormat.RGBA32Sint:
            case WebGPUConstants.TextureFormat.RGBA32Float:
            case WebGPUConstants.TextureFormat.ETC2RGB8A1Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGB8A1UnormSRGB:
            case WebGPUConstants.TextureFormat.ETC2RGBA8Unorm:
            case WebGPUConstants.TextureFormat.ETC2RGBA8UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC4x4Unorm:
            case WebGPUConstants.TextureFormat.ASTC4x4UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC5x4Unorm:
            case WebGPUConstants.TextureFormat.ASTC5x4UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC5x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC5x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC6x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC6x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC6x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC6x6UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC8x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC8x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x6UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC8x8Unorm:
            case WebGPUConstants.TextureFormat.ASTC8x8UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x5Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x5UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x6Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x6UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x8Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x8UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC10x10Unorm:
            case WebGPUConstants.TextureFormat.ASTC10x10UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC12x10Unorm:
            case WebGPUConstants.TextureFormat.ASTC12x10UnormSRGB:
            case WebGPUConstants.TextureFormat.ASTC12x12Unorm:
            case WebGPUConstants.TextureFormat.ASTC12x12UnormSRGB:
                return 4;
        }
        throw "Unknown format ".concat(format, "!");
    };
    WebGPUTextureHelper.HasStencilAspect = function (format) {
        switch (format) {
            case WebGPUConstants.TextureFormat.Stencil8:
            case WebGPUConstants.TextureFormat.Depth24UnormStencil8:
            case WebGPUConstants.TextureFormat.Depth32FloatStencil8:
            case WebGPUConstants.TextureFormat.Depth24PlusStencil8:
                return true;
        }
        return false;
    };
    WebGPUTextureHelper.HasDepthAndStencilAspects = function (format) {
        switch (format) {
            case WebGPUConstants.TextureFormat.Depth24UnormStencil8:
            case WebGPUConstants.TextureFormat.Depth32FloatStencil8:
            case WebGPUConstants.TextureFormat.Depth24PlusStencil8:
                return true;
        }
        return false;
    };
    WebGPUTextureHelper.prototype.invertYPreMultiplyAlpha = function (gpuOrHdwTexture, width, height, format, invertY, premultiplyAlpha, faceIndex, mipLevel, layers, ofstX, ofstY, rectWidth, rectHeight, commandEncoder, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    allowGPUOptimization) {
        var _a, _b, _c, _d, _e, _f;
        if (invertY === void 0) { invertY = false; }
        if (premultiplyAlpha === void 0) { premultiplyAlpha = false; }
        if (faceIndex === void 0) { faceIndex = 0; }
        if (mipLevel === void 0) { mipLevel = 0; }
        if (layers === void 0) { layers = 1; }
        if (ofstX === void 0) { ofstX = 0; }
        if (ofstY === void 0) { ofstY = 0; }
        if (rectWidth === void 0) { rectWidth = 0; }
        if (rectHeight === void 0) { rectHeight = 0; }
        var useRect = rectWidth !== 0;
        var useOwnCommandEncoder = commandEncoder === undefined;
        var _g = this._getPipeline(format, useRect ? PipelineType.InvertYPremultiplyAlphaWithOfst : PipelineType.InvertYPremultiplyAlpha, {
            invertY: invertY,
            premultiplyAlpha: premultiplyAlpha,
        }), pipeline = _g[0], bindGroupLayout = _g[1];
        faceIndex = Math.max(faceIndex, 0);
        if (useOwnCommandEncoder) {
            commandEncoder = this._device.createCommandEncoder({});
        }
        (_b = (_a = commandEncoder).pushDebugGroup) === null || _b === void 0 ? void 0 : _b.call(_a, "internal process texture - invertY=".concat(invertY, " premultiplyAlpha=").concat(premultiplyAlpha));
        var gpuTexture;
        if (WebGPUTextureHelper._IsHardwareTexture(gpuOrHdwTexture)) {
            gpuTexture = gpuOrHdwTexture.underlyingResource;
            if (!(invertY && !premultiplyAlpha && layers === 1 && faceIndex === 0)) {
                // we optimize only for the most likely case (invertY=true, premultiplyAlpha=false, layers=1, faceIndex=0) to avoid dealing with big caches
                gpuOrHdwTexture = undefined;
            }
        }
        else {
            gpuTexture = gpuOrHdwTexture;
            gpuOrHdwTexture = undefined;
        }
        if (!gpuTexture) {
            return;
        }
        if (useRect) {
            this._bufferManager.setRawData(this._ubCopyWithOfst, 0, new Float32Array([ofstX, ofstY, rectWidth, rectHeight]), 0, 4 * 4);
        }
        var webgpuHardwareTexture = gpuOrHdwTexture;
        var outputTexture = (_c = webgpuHardwareTexture === null || webgpuHardwareTexture === void 0 ? void 0 : webgpuHardwareTexture._copyInvertYTempTexture) !== null && _c !== void 0 ? _c : this.createTexture({ width: width, height: height, layers: 1 }, false, false, false, false, false, format, 1, commandEncoder, WebGPUConstants.TextureUsage.CopySrc | WebGPUConstants.TextureUsage.RenderAttachment | WebGPUConstants.TextureUsage.TextureBinding);
        var renderPassDescriptor = (_d = webgpuHardwareTexture === null || webgpuHardwareTexture === void 0 ? void 0 : webgpuHardwareTexture._copyInvertYRenderPassDescr) !== null && _d !== void 0 ? _d : {
            colorAttachments: [
                {
                    view: outputTexture.createView({
                        format: format,
                        dimension: WebGPUConstants.TextureViewDimension.E2d,
                        baseMipLevel: 0,
                        mipLevelCount: 1,
                        arrayLayerCount: 1,
                        baseArrayLayer: 0,
                    }),
                    loadOp: WebGPUConstants.LoadOp.Load,
                    storeOp: WebGPUConstants.StoreOp.Store,
                },
            ],
        };
        var passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        var bindGroup = useRect ? webgpuHardwareTexture === null || webgpuHardwareTexture === void 0 ? void 0 : webgpuHardwareTexture._copyInvertYBindGroupWithOfst : webgpuHardwareTexture === null || webgpuHardwareTexture === void 0 ? void 0 : webgpuHardwareTexture._copyInvertYBindGroup;
        if (!bindGroup) {
            var descriptor = {
                layout: bindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: gpuTexture.createView({
                            format: format,
                            dimension: WebGPUConstants.TextureViewDimension.E2d,
                            baseMipLevel: mipLevel,
                            mipLevelCount: 1,
                            arrayLayerCount: layers,
                            baseArrayLayer: faceIndex,
                        }),
                    },
                ],
            };
            if (useRect) {
                descriptor.entries.push({
                    binding: 1,
                    resource: {
                        buffer: this._ubCopyWithOfst,
                    },
                });
            }
            bindGroup = this._device.createBindGroup(descriptor);
        }
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(4, 1, 0, 0);
        passEncoder.end();
        commandEncoder.copyTextureToTexture({
            texture: outputTexture,
        }, {
            texture: gpuTexture,
            mipLevel: mipLevel,
            origin: {
                x: 0,
                y: 0,
                z: faceIndex,
            },
        }, {
            width: width,
            height: height,
            depthOrArrayLayers: 1,
        });
        if (webgpuHardwareTexture) {
            webgpuHardwareTexture._copyInvertYTempTexture = outputTexture;
            webgpuHardwareTexture._copyInvertYRenderPassDescr = renderPassDescriptor;
            if (useRect) {
                webgpuHardwareTexture._copyInvertYBindGroupWithOfst = bindGroup;
            }
            else {
                webgpuHardwareTexture._copyInvertYBindGroup = bindGroup;
            }
        }
        else {
            this._deferredReleaseTextures.push([outputTexture, null]);
        }
        (_f = (_e = commandEncoder).popDebugGroup) === null || _f === void 0 ? void 0 : _f.call(_e);
        if (useOwnCommandEncoder) {
            this._device.queue.submit([commandEncoder.finish()]);
            commandEncoder = null;
        }
    };
    WebGPUTextureHelper.prototype.copyWithInvertY = function (srcTextureView, format, renderPassDescriptor, commandEncoder) {
        var _a, _b, _c, _d;
        var useOwnCommandEncoder = commandEncoder === undefined;
        var _e = this._getPipeline(format, PipelineType.InvertYPremultiplyAlpha, { invertY: true, premultiplyAlpha: false }), pipeline = _e[0], bindGroupLayout = _e[1];
        if (useOwnCommandEncoder) {
            commandEncoder = this._device.createCommandEncoder({});
        }
        (_b = (_a = commandEncoder).pushDebugGroup) === null || _b === void 0 ? void 0 : _b.call(_a, "internal copy texture with invertY");
        var passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        var bindGroup = this._device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: srcTextureView,
                },
            ],
        });
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(4, 1, 0, 0);
        passEncoder.end();
        (_d = (_c = commandEncoder).popDebugGroup) === null || _d === void 0 ? void 0 : _d.call(_c);
        if (useOwnCommandEncoder) {
            this._device.queue.submit([commandEncoder.finish()]);
            commandEncoder = null;
        }
    };
    //------------------------------------------------------------------------------
    //                               Creation
    //------------------------------------------------------------------------------
    WebGPUTextureHelper.prototype.createTexture = function (imageBitmap, hasMipmaps, generateMipmaps, invertY, premultiplyAlpha, is3D, format, sampleCount, commandEncoder, usage, additionalUsages) {
        if (hasMipmaps === void 0) { hasMipmaps = false; }
        if (generateMipmaps === void 0) { generateMipmaps = false; }
        if (invertY === void 0) { invertY = false; }
        if (premultiplyAlpha === void 0) { premultiplyAlpha = false; }
        if (is3D === void 0) { is3D = false; }
        if (format === void 0) { format = WebGPUConstants.TextureFormat.RGBA8Unorm; }
        if (sampleCount === void 0) { sampleCount = 1; }
        if (usage === void 0) { usage = -1; }
        if (additionalUsages === void 0) { additionalUsages = 0; }
        if (sampleCount > 1) {
            // WebGPU only supports 1 or 4
            sampleCount = 4;
        }
        var layerCount = imageBitmap.layers || 1;
        var textureSize = {
            width: imageBitmap.width,
            height: imageBitmap.height,
            depthOrArrayLayers: layerCount,
        };
        var isCompressedFormat = WebGPUTextureHelper.IsCompressedFormat(format);
        var mipLevelCount = hasMipmaps ? WebGPUTextureHelper.ComputeNumMipmapLevels(imageBitmap.width, imageBitmap.height) : 1;
        var usages = usage >= 0 ? usage : WebGPUConstants.TextureUsage.CopySrc | WebGPUConstants.TextureUsage.CopyDst | WebGPUConstants.TextureUsage.TextureBinding;
        additionalUsages |= hasMipmaps && !isCompressedFormat ? WebGPUConstants.TextureUsage.CopySrc | WebGPUConstants.TextureUsage.RenderAttachment : 0;
        if (!isCompressedFormat && !is3D) {
            // we don't know in advance if the texture will be updated with copyExternalImageToTexture (which requires to have those flags), so we need to force the flags all the times
            additionalUsages |= WebGPUConstants.TextureUsage.RenderAttachment | WebGPUConstants.TextureUsage.CopyDst;
        }
        var gpuTexture = this._device.createTexture({
            size: textureSize,
            dimension: is3D ? WebGPUConstants.TextureDimension.E3d : WebGPUConstants.TextureDimension.E2d,
            format: format,
            usage: usages | additionalUsages,
            sampleCount: sampleCount,
            mipLevelCount: mipLevelCount,
        });
        if (WebGPUTextureHelper.IsImageBitmap(imageBitmap)) {
            this.updateTexture(imageBitmap, gpuTexture, imageBitmap.width, imageBitmap.height, layerCount, format, 0, 0, invertY, premultiplyAlpha, 0, 0);
            if (hasMipmaps && generateMipmaps) {
                this.generateMipmaps(gpuTexture, format, mipLevelCount, 0, commandEncoder);
            }
        }
        return gpuTexture;
    };
    WebGPUTextureHelper.prototype.createCubeTexture = function (imageBitmaps, hasMipmaps, generateMipmaps, invertY, premultiplyAlpha, format, sampleCount, commandEncoder, usage, additionalUsages) {
        if (hasMipmaps === void 0) { hasMipmaps = false; }
        if (generateMipmaps === void 0) { generateMipmaps = false; }
        if (invertY === void 0) { invertY = false; }
        if (premultiplyAlpha === void 0) { premultiplyAlpha = false; }
        if (format === void 0) { format = WebGPUConstants.TextureFormat.RGBA8Unorm; }
        if (sampleCount === void 0) { sampleCount = 1; }
        if (usage === void 0) { usage = -1; }
        if (additionalUsages === void 0) { additionalUsages = 0; }
        if (sampleCount > 1) {
            // WebGPU only supports 1 or 4
            sampleCount = 4;
        }
        var width = WebGPUTextureHelper.IsImageBitmapArray(imageBitmaps) ? imageBitmaps[0].width : imageBitmaps.width;
        var height = WebGPUTextureHelper.IsImageBitmapArray(imageBitmaps) ? imageBitmaps[0].height : imageBitmaps.height;
        var isCompressedFormat = WebGPUTextureHelper.IsCompressedFormat(format);
        var mipLevelCount = hasMipmaps ? WebGPUTextureHelper.ComputeNumMipmapLevels(width, height) : 1;
        var usages = usage >= 0 ? usage : WebGPUConstants.TextureUsage.CopySrc | WebGPUConstants.TextureUsage.CopyDst | WebGPUConstants.TextureUsage.TextureBinding;
        additionalUsages |= hasMipmaps && !isCompressedFormat ? WebGPUConstants.TextureUsage.CopySrc | WebGPUConstants.TextureUsage.RenderAttachment : 0;
        if (!isCompressedFormat) {
            // we don't know in advance if the texture will be updated with copyExternalImageToTexture (which requires to have those flags), so we need to force the flags all the times
            additionalUsages |= WebGPUConstants.TextureUsage.RenderAttachment | WebGPUConstants.TextureUsage.CopyDst;
        }
        var gpuTexture = this._device.createTexture({
            size: {
                width: width,
                height: height,
                depthOrArrayLayers: 6,
            },
            dimension: WebGPUConstants.TextureDimension.E2d,
            format: format,
            usage: usages | additionalUsages,
            sampleCount: sampleCount,
            mipLevelCount: mipLevelCount,
        });
        if (WebGPUTextureHelper.IsImageBitmapArray(imageBitmaps)) {
            this.updateCubeTextures(imageBitmaps, gpuTexture, width, height, format, invertY, premultiplyAlpha, 0, 0);
            if (hasMipmaps && generateMipmaps) {
                this.generateCubeMipmaps(gpuTexture, format, mipLevelCount, commandEncoder);
            }
        }
        return gpuTexture;
    };
    WebGPUTextureHelper.prototype.generateCubeMipmaps = function (gpuTexture, format, mipLevelCount, commandEncoder) {
        var _a, _b, _c, _d;
        var useOwnCommandEncoder = commandEncoder === undefined;
        if (useOwnCommandEncoder) {
            commandEncoder = this._device.createCommandEncoder({});
        }
        (_b = (_a = commandEncoder).pushDebugGroup) === null || _b === void 0 ? void 0 : _b.call(_a, "create cube mipmaps - ".concat(mipLevelCount, " levels"));
        for (var f = 0; f < 6; ++f) {
            this.generateMipmaps(gpuTexture, format, mipLevelCount, f, commandEncoder);
        }
        (_d = (_c = commandEncoder).popDebugGroup) === null || _d === void 0 ? void 0 : _d.call(_c);
        if (useOwnCommandEncoder) {
            this._device.queue.submit([commandEncoder.finish()]);
            commandEncoder = null;
        }
    };
    WebGPUTextureHelper.prototype.generateMipmaps = function (gpuOrHdwTexture, format, mipLevelCount, faceIndex, commandEncoder) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (faceIndex === void 0) { faceIndex = 0; }
        var useOwnCommandEncoder = commandEncoder === undefined;
        var _j = this._getPipeline(format), pipeline = _j[0], bindGroupLayout = _j[1];
        faceIndex = Math.max(faceIndex, 0);
        if (useOwnCommandEncoder) {
            commandEncoder = this._device.createCommandEncoder({});
        }
        (_b = (_a = commandEncoder).pushDebugGroup) === null || _b === void 0 ? void 0 : _b.call(_a, "create mipmaps for face #".concat(faceIndex, " - ").concat(mipLevelCount, " levels"));
        var gpuTexture;
        if (WebGPUTextureHelper._IsHardwareTexture(gpuOrHdwTexture)) {
            gpuTexture = gpuOrHdwTexture.underlyingResource;
            gpuOrHdwTexture._mipmapGenRenderPassDescr = gpuOrHdwTexture._mipmapGenRenderPassDescr || [];
            gpuOrHdwTexture._mipmapGenBindGroup = gpuOrHdwTexture._mipmapGenBindGroup || [];
        }
        else {
            gpuTexture = gpuOrHdwTexture;
            gpuOrHdwTexture = undefined;
        }
        if (!gpuTexture) {
            return;
        }
        var webgpuHardwareTexture = gpuOrHdwTexture;
        for (var i = 1; i < mipLevelCount; ++i) {
            var renderPassDescriptor = (_d = (_c = webgpuHardwareTexture === null || webgpuHardwareTexture === void 0 ? void 0 : webgpuHardwareTexture._mipmapGenRenderPassDescr[faceIndex]) === null || _c === void 0 ? void 0 : _c[i - 1]) !== null && _d !== void 0 ? _d : {
                colorAttachments: [
                    {
                        view: gpuTexture.createView({
                            format: format,
                            dimension: WebGPUConstants.TextureViewDimension.E2d,
                            baseMipLevel: i,
                            mipLevelCount: 1,
                            arrayLayerCount: 1,
                            baseArrayLayer: faceIndex,
                        }),
                        loadOp: WebGPUConstants.LoadOp.Load,
                        storeOp: WebGPUConstants.StoreOp.Store,
                    },
                ],
            };
            if (webgpuHardwareTexture) {
                webgpuHardwareTexture._mipmapGenRenderPassDescr[faceIndex] = webgpuHardwareTexture._mipmapGenRenderPassDescr[faceIndex] || [];
                webgpuHardwareTexture._mipmapGenRenderPassDescr[faceIndex][i - 1] = renderPassDescriptor;
            }
            var passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
            var bindGroup = (_f = (_e = webgpuHardwareTexture === null || webgpuHardwareTexture === void 0 ? void 0 : webgpuHardwareTexture._mipmapGenBindGroup[faceIndex]) === null || _e === void 0 ? void 0 : _e[i - 1]) !== null && _f !== void 0 ? _f : this._device.createBindGroup({
                layout: bindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: this._mipmapSampler,
                    },
                    {
                        binding: 1,
                        resource: gpuTexture.createView({
                            format: format,
                            dimension: WebGPUConstants.TextureViewDimension.E2d,
                            baseMipLevel: i - 1,
                            mipLevelCount: 1,
                            arrayLayerCount: 1,
                            baseArrayLayer: faceIndex,
                        }),
                    },
                ],
            });
            if (webgpuHardwareTexture) {
                webgpuHardwareTexture._mipmapGenBindGroup[faceIndex] = webgpuHardwareTexture._mipmapGenBindGroup[faceIndex] || [];
                webgpuHardwareTexture._mipmapGenBindGroup[faceIndex][i - 1] = bindGroup;
            }
            passEncoder.setPipeline(pipeline);
            passEncoder.setBindGroup(0, bindGroup);
            passEncoder.draw(4, 1, 0, 0);
            passEncoder.end();
        }
        (_h = (_g = commandEncoder).popDebugGroup) === null || _h === void 0 ? void 0 : _h.call(_g);
        if (useOwnCommandEncoder) {
            this._device.queue.submit([commandEncoder.finish()]);
            commandEncoder = null;
        }
    };
    WebGPUTextureHelper.prototype.createGPUTextureForInternalTexture = function (texture, width, height, depth, creationFlags) {
        if (!texture._hardwareTexture) {
            texture._hardwareTexture = new WebGPUHardwareTexture();
        }
        if (width === undefined) {
            width = texture.width;
        }
        if (height === undefined) {
            height = texture.height;
        }
        if (depth === undefined) {
            depth = texture.depth;
        }
        var gpuTextureWrapper = texture._hardwareTexture;
        var isStorageTexture = ((creationFlags !== null && creationFlags !== void 0 ? creationFlags : 0) & 1) !== 0;
        gpuTextureWrapper.format = WebGPUTextureHelper.GetWebGPUTextureFormat(texture.type, texture.format, texture._useSRGBBuffer);
        gpuTextureWrapper.textureUsages =
            texture._source === InternalTextureSource.RenderTarget || texture.source === InternalTextureSource.MultiRenderTarget
                ? WebGPUConstants.TextureUsage.TextureBinding | WebGPUConstants.TextureUsage.CopySrc | WebGPUConstants.TextureUsage.RenderAttachment
                : texture._source === InternalTextureSource.DepthStencil
                    ? WebGPUConstants.TextureUsage.TextureBinding | WebGPUConstants.TextureUsage.RenderAttachment
                    : -1;
        gpuTextureWrapper.textureAdditionalUsages = isStorageTexture ? WebGPUConstants.TextureUsage.StorageBinding : 0;
        var hasMipMaps = texture.generateMipMaps;
        var layerCount = depth || 1;
        var mipmapCount;
        if (texture._maxLodLevel !== null) {
            mipmapCount = texture._maxLodLevel;
        }
        else {
            mipmapCount = hasMipMaps ? WebGPUTextureHelper.ComputeNumMipmapLevels(width, height) : 1;
        }
        if (texture.isCube) {
            var gpuTexture = this.createCubeTexture({ width: width, height: height }, texture.generateMipMaps, texture.generateMipMaps, texture.invertY, false, gpuTextureWrapper.format, 1, this._commandEncoderForCreation, gpuTextureWrapper.textureUsages, gpuTextureWrapper.textureAdditionalUsages);
            gpuTextureWrapper.set(gpuTexture);
            gpuTextureWrapper.createView({
                format: gpuTextureWrapper.format,
                dimension: WebGPUConstants.TextureViewDimension.Cube,
                mipLevelCount: mipmapCount,
                baseArrayLayer: 0,
                baseMipLevel: 0,
                arrayLayerCount: 6,
                aspect: WebGPUTextureHelper.HasDepthAndStencilAspects(gpuTextureWrapper.format) ? WebGPUConstants.TextureAspect.DepthOnly : WebGPUConstants.TextureAspect.All,
            }, isStorageTexture);
        }
        else {
            var gpuTexture = this.createTexture({ width: width, height: height, layers: layerCount }, texture.generateMipMaps, texture.generateMipMaps, texture.invertY, false, texture.is3D, gpuTextureWrapper.format, 1, this._commandEncoderForCreation, gpuTextureWrapper.textureUsages, gpuTextureWrapper.textureAdditionalUsages);
            gpuTextureWrapper.set(gpuTexture);
            gpuTextureWrapper.createView({
                format: gpuTextureWrapper.format,
                dimension: texture.is2DArray
                    ? WebGPUConstants.TextureViewDimension.E2dArray
                    : texture.is3D
                        ? WebGPUConstants.TextureDimension.E3d
                        : WebGPUConstants.TextureViewDimension.E2d,
                mipLevelCount: mipmapCount,
                baseArrayLayer: 0,
                baseMipLevel: 0,
                arrayLayerCount: texture.is3D ? 1 : layerCount,
                aspect: WebGPUTextureHelper.HasDepthAndStencilAspects(gpuTextureWrapper.format) ? WebGPUConstants.TextureAspect.DepthOnly : WebGPUConstants.TextureAspect.All,
            }, isStorageTexture);
        }
        texture.width = texture.baseWidth = width;
        texture.height = texture.baseHeight = height;
        texture.depth = texture.baseDepth = depth;
        this.createMSAATexture(texture, texture.samples);
        return gpuTextureWrapper;
    };
    WebGPUTextureHelper.prototype.createMSAATexture = function (texture, samples) {
        var gpuTextureWrapper = texture._hardwareTexture;
        if (gpuTextureWrapper === null || gpuTextureWrapper === void 0 ? void 0 : gpuTextureWrapper.msaaTexture) {
            this.releaseTexture(gpuTextureWrapper.msaaTexture);
            gpuTextureWrapper.msaaTexture = null;
        }
        if (!gpuTextureWrapper || (samples !== null && samples !== void 0 ? samples : 1) <= 1) {
            return;
        }
        var width = texture.width;
        var height = texture.height;
        var layerCount = texture.depth || 1;
        if (texture.isCube) {
            var gpuMSAATexture = this.createCubeTexture({ width: width, height: height }, false, false, texture.invertY, false, gpuTextureWrapper.format, samples, this._commandEncoderForCreation, gpuTextureWrapper.textureUsages, gpuTextureWrapper.textureAdditionalUsages);
            gpuTextureWrapper.msaaTexture = gpuMSAATexture;
        }
        else {
            var gpuMSAATexture = this.createTexture({ width: width, height: height, layers: layerCount }, false, false, texture.invertY, false, texture.is3D, gpuTextureWrapper.format, samples, this._commandEncoderForCreation, gpuTextureWrapper.textureUsages, gpuTextureWrapper.textureAdditionalUsages);
            gpuTextureWrapper.msaaTexture = gpuMSAATexture;
        }
    };
    //------------------------------------------------------------------------------
    //                                  Update
    //------------------------------------------------------------------------------
    WebGPUTextureHelper.prototype.updateCubeTextures = function (imageBitmaps, gpuTexture, width, height, format, invertY, premultiplyAlpha, offsetX, offsetY) {
        if (invertY === void 0) { invertY = false; }
        if (premultiplyAlpha === void 0) { premultiplyAlpha = false; }
        if (offsetX === void 0) { offsetX = 0; }
        if (offsetY === void 0) { offsetY = 0; }
        var faces = [0, 3, 1, 4, 2, 5];
        for (var f = 0; f < faces.length; ++f) {
            var imageBitmap = imageBitmaps[faces[f]];
            this.updateTexture(imageBitmap, gpuTexture, width, height, 1, format, f, 0, invertY, premultiplyAlpha, offsetX, offsetY);
        }
    };
    // TODO WEBGPU handle data source not being in the same format than the destination texture?
    WebGPUTextureHelper.prototype.updateTexture = function (imageBitmap, texture, width, height, layers, format, faceIndex, mipLevel, invertY, premultiplyAlpha, offsetX, offsetY, allowGPUOptimization) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (mipLevel === void 0) { mipLevel = 0; }
        if (invertY === void 0) { invertY = false; }
        if (premultiplyAlpha === void 0) { premultiplyAlpha = false; }
        if (offsetX === void 0) { offsetX = 0; }
        if (offsetY === void 0) { offsetY = 0; }
        var gpuTexture = WebGPUTextureHelper._IsInternalTexture(texture) ? texture._hardwareTexture.underlyingResource : texture;
        var blockInformation = WebGPUTextureHelper._GetBlockInformationFromFormat(format);
        var gpuOrHdwTexture = WebGPUTextureHelper._IsInternalTexture(texture) ? texture._hardwareTexture : texture;
        var textureCopyView = {
            texture: gpuTexture,
            origin: {
                x: offsetX,
                y: offsetY,
                z: Math.max(faceIndex, 0),
            },
            mipLevel: mipLevel,
            premultipliedAlpha: premultiplyAlpha,
        };
        var textureExtent = {
            width: Math.ceil(width / blockInformation.width) * blockInformation.width,
            height: Math.ceil(height / blockInformation.height) * blockInformation.height,
            depthOrArrayLayers: layers || 1,
        };
        if (imageBitmap.byteLength !== undefined) {
            imageBitmap = imageBitmap;
            var bytesPerRow = Math.ceil(width / blockInformation.width) * blockInformation.length;
            var aligned = Math.ceil(bytesPerRow / 256) * 256 === bytesPerRow;
            if (aligned) {
                var commandEncoder = this._device.createCommandEncoder({});
                var buffer = this._bufferManager.createRawBuffer(imageBitmap.byteLength, WebGPUConstants.BufferUsage.MapWrite | WebGPUConstants.BufferUsage.CopySrc, true);
                var arrayBuffer = buffer.getMappedRange();
                new Uint8Array(arrayBuffer).set(imageBitmap);
                buffer.unmap();
                commandEncoder.copyBufferToTexture({
                    buffer: buffer,
                    offset: 0,
                    bytesPerRow: bytesPerRow,
                    rowsPerImage: height,
                }, textureCopyView, textureExtent);
                this._device.queue.submit([commandEncoder.finish()]);
                this._bufferManager.releaseBuffer(buffer);
            }
            else {
                this._device.queue.writeTexture(textureCopyView, imageBitmap, {
                    offset: 0,
                    bytesPerRow: bytesPerRow,
                    rowsPerImage: height,
                }, textureExtent);
            }
            if (invertY || premultiplyAlpha) {
                if (WebGPUTextureHelper._IsInternalTexture(texture)) {
                    var dontUseRect = offsetX === 0 && offsetY === 0 && width === texture.width && height === texture.height;
                    this.invertYPreMultiplyAlpha(gpuOrHdwTexture, texture.width, texture.height, format, invertY, premultiplyAlpha, faceIndex, mipLevel, layers || 1, offsetX, offsetY, dontUseRect ? 0 : width, dontUseRect ? 0 : height, undefined, allowGPUOptimization);
                }
                else {
                    // we should never take this code path
                    throw "updateTexture: Can't process the texture data because a GPUTexture was provided instead of an InternalTexture!";
                }
            }
        }
        else {
            imageBitmap = imageBitmap;
            if (invertY) {
                textureCopyView.premultipliedAlpha = false; // we are going to handle premultiplyAlpha ourselves
                // we must preprocess the image
                if (WebGPUTextureHelper._IsInternalTexture(texture) && offsetX === 0 && offsetY === 0 && width === texture.width && height === texture.height) {
                    // optimization when the source image is the same size than the destination texture and offsets X/Y == 0:
                    // we simply copy the source to the destination and we apply the preprocessing on the destination
                    this._device.queue.copyExternalImageToTexture({ source: imageBitmap }, textureCopyView, textureExtent);
                    this.invertYPreMultiplyAlpha(gpuOrHdwTexture, width, height, format, invertY, premultiplyAlpha, faceIndex, mipLevel, layers || 1, 0, 0, 0, 0, undefined, allowGPUOptimization);
                }
                else {
                    // we must apply the preprocessing on the source image before copying it into the destination texture
                    var commandEncoder = this._device.createCommandEncoder({});
                    // create a temp texture and copy the image to it
                    var srcTexture = this.createTexture({ width: width, height: height, layers: 1 }, false, false, false, false, false, format, 1, commandEncoder, WebGPUConstants.TextureUsage.CopySrc | WebGPUConstants.TextureUsage.TextureBinding);
                    this._deferredReleaseTextures.push([srcTexture, null]);
                    textureExtent.depthOrArrayLayers = 1;
                    this._device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture: srcTexture }, textureExtent);
                    textureExtent.depthOrArrayLayers = layers || 1;
                    // apply the preprocessing to this temp texture
                    this.invertYPreMultiplyAlpha(srcTexture, width, height, format, invertY, premultiplyAlpha, faceIndex, mipLevel, layers || 1, 0, 0, 0, 0, commandEncoder, allowGPUOptimization);
                    // copy the temp texture to the destination texture
                    commandEncoder.copyTextureToTexture({ texture: srcTexture }, textureCopyView, textureExtent);
                    this._device.queue.submit([commandEncoder.finish()]);
                }
            }
            else {
                // no preprocessing: direct copy to destination texture
                this._device.queue.copyExternalImageToTexture({ source: imageBitmap }, textureCopyView, textureExtent);
            }
        }
    };
    WebGPUTextureHelper.prototype.readPixels = function (texture, x, y, width, height, format, faceIndex, mipLevel, buffer, noDataConversion) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (mipLevel === void 0) { mipLevel = 0; }
        if (buffer === void 0) { buffer = null; }
        if (noDataConversion === void 0) { noDataConversion = false; }
        var blockInformation = WebGPUTextureHelper._GetBlockInformationFromFormat(format);
        var bytesPerRow = Math.ceil(width / blockInformation.width) * blockInformation.length;
        var bytesPerRowAligned = Math.ceil(bytesPerRow / 256) * 256;
        var size = bytesPerRowAligned * height;
        var gpuBuffer = this._bufferManager.createRawBuffer(size, WebGPUConstants.BufferUsage.MapRead | WebGPUConstants.BufferUsage.CopyDst);
        var commandEncoder = this._device.createCommandEncoder({});
        commandEncoder.copyTextureToBuffer({
            texture: texture,
            mipLevel: mipLevel,
            origin: {
                x: x,
                y: y,
                z: Math.max(faceIndex, 0),
            },
        }, {
            buffer: gpuBuffer,
            offset: 0,
            bytesPerRow: bytesPerRowAligned,
        }, {
            width: width,
            height: height,
            depthOrArrayLayers: 1,
        });
        this._device.queue.submit([commandEncoder.finish()]);
        return this._bufferManager.readDataFromBuffer(gpuBuffer, size, width, height, bytesPerRow, bytesPerRowAligned, WebGPUTextureHelper._GetTextureTypeFromFormat(format), 0, buffer, true, noDataConversion);
    };
    //------------------------------------------------------------------------------
    //                              Dispose
    //------------------------------------------------------------------------------
    WebGPUTextureHelper.prototype.releaseTexture = function (texture) {
        if (WebGPUTextureHelper._IsInternalTexture(texture)) {
            var hardwareTexture = texture._hardwareTexture;
            var irradianceTexture = texture._irradianceTexture;
            // We can't destroy the objects just now because they could be used in the current frame - we delay the destroying after the end of the frame
            this._deferredReleaseTextures.push([hardwareTexture, irradianceTexture]);
        }
        else {
            this._deferredReleaseTextures.push([texture, null]);
        }
    };
    WebGPUTextureHelper.prototype.destroyDeferredTextures = function () {
        for (var i = 0; i < this._deferredReleaseTextures.length; ++i) {
            var _a = this._deferredReleaseTextures[i], hardwareTexture = _a[0], irradianceTexture = _a[1];
            if (hardwareTexture) {
                if (WebGPUTextureHelper._IsHardwareTexture(hardwareTexture)) {
                    hardwareTexture.release();
                }
                else {
                    hardwareTexture.destroy();
                }
            }
            irradianceTexture === null || irradianceTexture === void 0 ? void 0 : irradianceTexture.dispose();
        }
        this._deferredReleaseTextures.length = 0;
    };
    return WebGPUTextureHelper;
}());
export { WebGPUTextureHelper };
//# sourceMappingURL=webgpuTextureHelper.js.map