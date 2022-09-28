// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "refractionPixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D refractionSampler;\nuniform vec3 baseColor;\nuniform float depth;\nuniform float colorLevel;\nvoid main() {\nfloat ref=1.0-texture2D(refractionSampler,vUV).r;\nvec2 uv=vUV-vec2(0.5);\nvec2 offset=uv*depth*ref;\nvec3 sourceColor=texture2D(textureSampler,vUV-offset).rgb;\ngl_FragColor=vec4(sourceColor+sourceColor*ref*colorLevel,1.0);\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var refractionPixelShader = { name: name, shader: shader };
//# sourceMappingURL=refraction.fragment.js.map