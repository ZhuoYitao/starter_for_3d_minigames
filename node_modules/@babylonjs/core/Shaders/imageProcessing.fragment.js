// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/imageProcessingDeclaration.js";
import "./ShadersInclude/helperFunctions.js";
import "./ShadersInclude/imageProcessingFunctions.js";
var name = "imageProcessingPixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\n#include<imageProcessingDeclaration>\n#include<helperFunctions>\n#include<imageProcessingFunctions>\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\nvec4 result=texture2D(textureSampler,vUV);\n#ifdef IMAGEPROCESSING\n#ifndef FROMLINEARSPACE\nresult.rgb=toLinearSpace(result.rgb);\n#endif\nresult=applyImageProcessing(result);\n#else\n#ifdef FROMLINEARSPACE\nresult=applyImageProcessing(result);\n#endif\n#endif\ngl_FragColor=result;\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var imageProcessingPixelShader = { name: name, shader: shader };
//# sourceMappingURL=imageProcessing.fragment.js.map