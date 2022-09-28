// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "glowMapMergePixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\n#ifdef EMISSIVE\nuniform sampler2D textureSampler2;\n#endif\nuniform float offset;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_FRAGMENT_MAIN_BEGIN\nvec4 baseColor=texture2D(textureSampler,vUV);\n#ifdef EMISSIVE\nbaseColor+=texture2D(textureSampler2,vUV);\nbaseColor*=offset;\n#else\nbaseColor.a=abs(offset-baseColor.a);\n#ifdef STROKE\nfloat alpha=smoothstep(.0,.1,baseColor.a);\nbaseColor.a=alpha;\nbaseColor.rgb=baseColor.rgb*alpha;\n#endif\n#endif\n#if LDR\nbaseColor=clamp(baseColor,0.,1.0);\n#endif\ngl_FragColor=baseColor;\n#define CUSTOM_FRAGMENT_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var glowMapMergePixelShader = { name: name, shader: shader };
//# sourceMappingURL=glowMapMerge.fragment.js.map