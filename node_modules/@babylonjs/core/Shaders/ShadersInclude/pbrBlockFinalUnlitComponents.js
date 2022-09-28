// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockFinalUnlitComponents";
var shader = "vec3 finalDiffuse=diffuseBase;\nfinalDiffuse*=surfaceAlbedo.rgb;\nfinalDiffuse=max(finalDiffuse,0.0);\nfinalDiffuse*=vLightingIntensity.x;\nvec3 finalAmbient=vAmbientColor;\nfinalAmbient*=surfaceAlbedo.rgb;\nvec3 finalEmissive=vEmissiveColor;\n#ifdef EMISSIVE\nvec3 emissiveColorTex=texture2D(emissiveSampler,vEmissiveUV+uvOffset).rgb;\n#ifdef GAMMAEMISSIVE\nfinalEmissive*=toLinearSpace(emissiveColorTex.rgb);\n#else\nfinalEmissive*=emissiveColorTex.rgb;\n#endif\nfinalEmissive*= vEmissiveInfos.y;\n#endif\nfinalEmissive*=vLightingIntensity.y;\n#ifdef AMBIENT\nvec3 ambientOcclusionForDirectDiffuse=mix(vec3(1.),aoOut.ambientOcclusionColor,vAmbientInfos.w);\n#else\nvec3 ambientOcclusionForDirectDiffuse=aoOut.ambientOcclusionColor;\n#endif\nfinalAmbient*=aoOut.ambientOcclusionColor;\nfinalDiffuse*=ambientOcclusionForDirectDiffuse;\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockFinalUnlitComponents = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockFinalUnlitComponents.js.map