// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockFinalColorComposition";
var shader = "vec4 finalColor=vec4(\nfinalAmbient +\nfinalDiffuse +\n#ifndef UNLIT\n#ifdef REFLECTION\nfinalIrradiance +\n#endif\n#ifdef SPECULARTERM\nfinalSpecularScaled +\n#endif\n#ifdef SHEEN\nfinalSheenScaled +\n#endif\n#ifdef CLEARCOAT\nfinalClearCoatScaled +\n#endif\n#ifdef REFLECTION\nfinalRadianceScaled +\n#if defined(SHEEN) && defined(ENVIRONMENTBRDF)\nsheenOut.finalSheenRadianceScaled +\n#endif\n#ifdef CLEARCOAT\nclearcoatOut.finalClearCoatRadianceScaled +\n#endif\n#endif\n#ifdef SS_REFRACTION\nsubSurfaceOut.finalRefraction +\n#endif\n#endif\nfinalEmissive,\nalpha);\n#ifdef LIGHTMAP\n#ifndef LIGHTMAPEXCLUDED\n#ifdef USELIGHTMAPASSHADOWMAP\nfinalColor.rgb*=lightmapColor.rgb;\n#else\nfinalColor.rgb+=lightmapColor.rgb;\n#endif\n#endif\n#endif\n#define CUSTOM_FRAGMENT_BEFORE_FOG\nfinalColor=max(finalColor,0.0);\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockFinalColorComposition = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockFinalColorComposition.js.map