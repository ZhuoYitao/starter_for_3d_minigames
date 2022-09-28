// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/helperFunctions.js";
var name = "rgbdEncodePixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\n#include<helperFunctions>\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) \n{\ngl_FragColor=toRGBD(texture2D(textureSampler,vUV).rgb);\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var rgbdEncodePixelShader = { name: name, shader: shader };
//# sourceMappingURL=rgbdEncode.fragment.js.map