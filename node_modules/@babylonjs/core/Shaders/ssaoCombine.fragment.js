// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "ssaoCombinePixelShader";
var shader = "uniform sampler2D textureSampler;\nuniform sampler2D originalColor;\nuniform vec4 viewport;\nvarying vec2 vUV;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_FRAGMENT_MAIN_BEGIN\nvec4 ssaoColor=texture2D(textureSampler,viewport.xy+vUV*viewport.zw);\nvec4 sceneColor=texture2D(originalColor,vUV);\ngl_FragColor=sceneColor*ssaoColor;\n#define CUSTOM_FRAGMENT_MAIN_END\n}\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var ssaoCombinePixelShader = { name: name, shader: shader };
//# sourceMappingURL=ssaoCombine.fragment.js.map