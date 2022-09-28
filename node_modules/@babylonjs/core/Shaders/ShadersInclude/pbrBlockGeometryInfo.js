// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockGeometryInfo";
var shader = "float NdotVUnclamped=dot(normalW,viewDirectionW);\nfloat NdotV=absEps(NdotVUnclamped);\nfloat alphaG=convertRoughnessToAverageSlope(roughness);\nvec2 AARoughnessFactors=getAARoughnessFactors(normalW.xyz);\n#ifdef SPECULARAA\nalphaG+=AARoughnessFactors.y;\n#endif\n#if defined(ENVIRONMENTBRDF)\nvec3 environmentBrdf=getBRDFLookup(NdotV,roughness);\n#endif\n#if defined(ENVIRONMENTBRDF) && !defined(REFLECTIONMAP_SKYBOX)\n#ifdef RADIANCEOCCLUSION\n#ifdef AMBIENTINGRAYSCALE\nfloat ambientMonochrome=aoOut.ambientOcclusionColor.r;\n#else\nfloat ambientMonochrome=getLuminance(aoOut.ambientOcclusionColor);\n#endif\nfloat seo=environmentRadianceOcclusion(ambientMonochrome,NdotVUnclamped);\n#endif\n#ifdef HORIZONOCCLUSION\n#ifdef BUMP\n#ifdef REFLECTIONMAP_3D\nfloat eho=environmentHorizonOcclusion(-viewDirectionW,normalW,geometricNormalW);\n#endif\n#endif\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockGeometryInfo = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockGeometryInfo.js.map