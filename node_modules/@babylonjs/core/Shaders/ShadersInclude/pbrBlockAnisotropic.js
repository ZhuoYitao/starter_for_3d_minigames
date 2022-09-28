// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockAnisotropic";
var shader = "#ifdef ANISOTROPIC\nstruct anisotropicOutParams\n{\nfloat anisotropy;\nvec3 anisotropicTangent;\nvec3 anisotropicBitangent;\nvec3 anisotropicNormal;\n#if DEBUGMODE>0\nvec3 anisotropyMapData;\n#endif\n};\n#define pbr_inline\nvoid anisotropicBlock(\nin vec3 vAnisotropy,\n#ifdef ANISOTROPIC_TEXTURE\nin vec3 anisotropyMapData,\n#endif\nin mat3 TBN,\nin vec3 normalW,\nin vec3 viewDirectionW,\nout anisotropicOutParams outParams\n)\n{\nfloat anisotropy=vAnisotropy.b;\nvec3 anisotropyDirection=vec3(vAnisotropy.xy,0.);\n#ifdef ANISOTROPIC_TEXTURE\nanisotropy*=anisotropyMapData.b;\nanisotropyDirection.rg*=anisotropyMapData.rg*2.0-1.0;\n#if DEBUGMODE>0\noutParams.anisotropyMapData=anisotropyMapData;\n#endif\n#endif\nmat3 anisoTBN=mat3(normalize(TBN[0]),normalize(TBN[1]),normalize(TBN[2]));\nvec3 anisotropicTangent=normalize(anisoTBN*anisotropyDirection);\nvec3 anisotropicBitangent=normalize(cross(anisoTBN[2],anisotropicTangent));\noutParams.anisotropy=anisotropy;\noutParams.anisotropicTangent=anisotropicTangent;\noutParams.anisotropicBitangent=anisotropicBitangent;\noutParams.anisotropicNormal=getAnisotropicBentNormals(anisotropicTangent,anisotropicBitangent,normalW,viewDirectionW,anisotropy);\n}\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockAnisotropic = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockAnisotropic.js.map