// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/kernelBlurVaryingDeclaration.js";
import "./ShadersInclude/packingFunctions.js";
import "./ShadersInclude/kernelBlurFragment.js";
import "./ShadersInclude/kernelBlurFragment2.js";
var name = "kernelBlurPixelShader";
var shader = "uniform sampler2D textureSampler;\nuniform vec2 delta;\nvarying vec2 sampleCenter;\n#ifdef DOF\nuniform sampler2D circleOfConfusionSampler;\nuniform vec2 cameraMinMaxZ;\nfloat sampleDistance(in vec2 offset) {\nfloat depth=texture2D(circleOfConfusionSampler,offset).g; \nreturn cameraMinMaxZ.x+(cameraMinMaxZ.y-cameraMinMaxZ.x)*depth; \n}\nfloat sampleCoC(in vec2 offset) {\nfloat coc=texture2D(circleOfConfusionSampler,offset).r; \nreturn coc; \n}\n#endif\n#include<kernelBlurVaryingDeclaration>[0..varyingCount]\n#ifdef PACKEDFLOAT\n#include<packingFunctions>\n#endif\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\nfloat computedWeight=0.0;\n#ifdef PACKEDFLOAT \nfloat blend=0.;\n#else\nvec4 blend=vec4(0.);\n#endif\n#ifdef DOF\nfloat sumOfWeights=CENTER_WEIGHT; \nfloat factor=0.0;\n#ifdef PACKEDFLOAT\nblend+=unpack(texture2D(textureSampler,sampleCenter))*CENTER_WEIGHT;\n#else\nblend+=texture2D(textureSampler,sampleCenter)*CENTER_WEIGHT;\n#endif\n#endif\n#include<kernelBlurFragment>[0..varyingCount]\n#include<kernelBlurFragment2>[0..depCount]\n#ifdef PACKEDFLOAT\ngl_FragColor=pack(blend);\n#else\ngl_FragColor=blend;\n#endif\n#ifdef DOF\ngl_FragColor/=sumOfWeights;\n#endif\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var kernelBlurPixelShader = { name: name, shader: shader };
//# sourceMappingURL=kernelBlur.fragment.js.map