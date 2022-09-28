// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "lensFlarePixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform vec4 color;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_FRAGMENT_MAIN_BEGIN\nvec4 baseColor=texture2D(textureSampler,vUV);\ngl_FragColor=baseColor*color;\n#define CUSTOM_FRAGMENT_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var lensFlarePixelShader = { name: name, shader: shader };
//# sourceMappingURL=lensFlare.fragment.js.map