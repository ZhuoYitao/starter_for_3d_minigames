// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockAmbientOcclusion";
var shader = "struct ambientOcclusionOutParams\n{\nvec3 ambientOcclusionColor;\n#if DEBUGMODE>0\nvec3 ambientOcclusionColorMap;\n#endif\n};\n#define pbr_inline\nvoid ambientOcclusionBlock(\n#ifdef AMBIENT\nin vec3 ambientOcclusionColorMap_,\nin vec4 vAmbientInfos,\n#endif\nout ambientOcclusionOutParams outParams\n)\n{\nvec3 ambientOcclusionColor=vec3(1.,1.,1.);\n#ifdef AMBIENT\nvec3 ambientOcclusionColorMap=ambientOcclusionColorMap_*vAmbientInfos.y;\n#ifdef AMBIENTINGRAYSCALE\nambientOcclusionColorMap=vec3(ambientOcclusionColorMap.r,ambientOcclusionColorMap.r,ambientOcclusionColorMap.r);\n#endif\nambientOcclusionColor=mix(ambientOcclusionColor,ambientOcclusionColorMap,vAmbientInfos.z);\n#if DEBUGMODE>0\noutParams.ambientOcclusionColorMap=ambientOcclusionColorMap;\n#endif\n#endif\noutParams.ambientOcclusionColor=ambientOcclusionColor;\n}\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockAmbientOcclusion = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockAmbientOcclusion.js.map