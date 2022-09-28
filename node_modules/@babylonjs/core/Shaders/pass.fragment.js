// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "passPixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) \n{\ngl_FragColor=texture2D(textureSampler,vUV);\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var passPixelShader = { name: name, shader: shader };
//# sourceMappingURL=pass.fragment.js.map