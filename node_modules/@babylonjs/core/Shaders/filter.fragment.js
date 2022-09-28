// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "filterPixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform mat4 kernelMatrix;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\nvec3 baseColor=texture2D(textureSampler,vUV).rgb;\nvec3 updatedColor=(kernelMatrix*vec4(baseColor,1.0)).rgb;\ngl_FragColor=vec4(updatedColor,1.0);\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var filterPixelShader = { name: name, shader: shader };
//# sourceMappingURL=filter.fragment.js.map