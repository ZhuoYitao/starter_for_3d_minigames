// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/helperFunctions.js";
var name = "layerPixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform vec4 color;\n#include<helperFunctions>\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_FRAGMENT_MAIN_BEGIN\nvec4 baseColor=texture2D(textureSampler,vUV);\n#ifdef LINEAR\nbaseColor.rgb=toGammaSpace(baseColor.rgb);\n#endif\n#ifdef ALPHATEST\nif (baseColor.a<0.4)\ndiscard;\n#endif\ngl_FragColor=baseColor*color;\n#define CUSTOM_FRAGMENT_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var layerPixelShader = { name: name, shader: shader };
//# sourceMappingURL=layer.fragment.js.map