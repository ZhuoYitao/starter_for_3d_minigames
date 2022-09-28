// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/clipPlaneFragmentDeclaration2.js";
import "./ShadersInclude/imageProcessingDeclaration.js";
import "./ShadersInclude/helperFunctions.js";
import "./ShadersInclude/imageProcessingFunctions.js";
import "./ShadersInclude/clipPlaneFragment.js";
var name = "gpuRenderParticlesPixelShader";
var shader = "precision highp float;\nuniform sampler2D diffuseSampler;\nvarying vec2 vUV;\nvarying vec4 vColor;\n#include<clipPlaneFragmentDeclaration2> \n#include<imageProcessingDeclaration>\n#include<helperFunctions>\n#include<imageProcessingFunctions>\nvoid main() {\n#include<clipPlaneFragment> \nvec4 textureColor=texture2D(diffuseSampler,vUV);\ngl_FragColor=textureColor*vColor;\n#ifdef BLENDMULTIPLYMODE\nfloat alpha=vColor.a*textureColor.a;\ngl_FragColor.rgb=gl_FragColor.rgb*alpha+vec3(1.0)*(1.0-alpha);\n#endif \n#ifdef IMAGEPROCESSINGPOSTPROCESS\ngl_FragColor.rgb=toLinearSpace(gl_FragColor.rgb);\n#else\n#ifdef IMAGEPROCESSING\ngl_FragColor.rgb=toLinearSpace(gl_FragColor.rgb);\ngl_FragColor=applyImageProcessing(gl_FragColor);\n#endif\n#endif\n}\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var gpuRenderParticlesPixelShader = { name: name, shader: shader };
//# sourceMappingURL=gpuRenderParticles.fragment.js.map