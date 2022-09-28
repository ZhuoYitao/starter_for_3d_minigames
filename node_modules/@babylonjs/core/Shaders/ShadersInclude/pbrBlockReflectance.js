// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockReflectance";
var shader = "#if defined(ENVIRONMENTBRDF) && !defined(REFLECTIONMAP_SKYBOX)\nvec3 specularEnvironmentReflectance=getReflectanceFromBRDFLookup(clearcoatOut.specularEnvironmentR0,specularEnvironmentR90,environmentBrdf);\n#ifdef RADIANCEOCCLUSION\nspecularEnvironmentReflectance*=seo;\n#endif\n#ifdef HORIZONOCCLUSION\n#ifdef BUMP\n#ifdef REFLECTIONMAP_3D\nspecularEnvironmentReflectance*=eho;\n#endif\n#endif\n#endif\n#else\nvec3 specularEnvironmentReflectance=getReflectanceFromAnalyticalBRDFLookup_Jones(NdotV,clearcoatOut.specularEnvironmentR0,specularEnvironmentR90,sqrt(microSurface));\n#endif\n#ifdef CLEARCOAT\nspecularEnvironmentReflectance*=clearcoatOut.conservationFactor;\n#if defined(CLEARCOAT_TINT)\nspecularEnvironmentReflectance*=clearcoatOut.absorption;\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockReflectance = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockReflectance.js.map