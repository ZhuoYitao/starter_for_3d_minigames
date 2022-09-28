// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/helperFunctions.js";
var name = "rgbdDecodePixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\n#include<helperFunctions>\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) \n{\ngl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var rgbdDecodePixelShader = { name: name, shader: shader };
//# sourceMappingURL=rgbdDecode.fragment.js.map