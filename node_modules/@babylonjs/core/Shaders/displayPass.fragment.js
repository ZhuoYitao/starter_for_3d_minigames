// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "displayPassPixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D passSampler;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\ngl_FragColor=texture2D(passSampler,vUV);\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var displayPassPixelShader = { name: name, shader: shader };
//# sourceMappingURL=displayPass.fragment.js.map