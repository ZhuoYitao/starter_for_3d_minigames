// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/fogFragmentDeclaration.js";
import "./ShadersInclude/fogFragment.js";
import "./ShadersInclude/imageProcessingCompatibility.js";
var name = "spritesPixelShader";
var shader = "uniform bool alphaTest;\nvarying vec4 vColor;\nvarying vec2 vUV;\nuniform sampler2D diffuseSampler;\n#include<fogFragmentDeclaration>\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_FRAGMENT_MAIN_BEGIN\nvec4 color=texture2D(diffuseSampler,vUV);\nif (alphaTest) \n{\nif (color.a<0.95)\ndiscard;\n}\ncolor*=vColor;\n#include<fogFragment>\ngl_FragColor=color;\n#include<imageProcessingCompatibility>\n#define CUSTOM_FRAGMENT_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var spritesPixelShader = { name: name, shader: shader };
//# sourceMappingURL=sprites.fragment.js.map