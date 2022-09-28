// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockAlphaFresnel";
var shader = "#ifdef ALPHAFRESNEL\n#if defined(ALPHATEST) || defined(ALPHABLEND)\nstruct alphaFresnelOutParams\n{\nfloat alpha;\n};\n#define pbr_inline\nvoid alphaFresnelBlock(\nin vec3 normalW,\nin vec3 viewDirectionW,\nin float alpha,\nin float microSurface,\nout alphaFresnelOutParams outParams\n)\n{\nfloat opacityPerceptual=alpha;\n#ifdef LINEARALPHAFRESNEL\nfloat opacity0=opacityPerceptual;\n#else\nfloat opacity0=opacityPerceptual*opacityPerceptual;\n#endif\nfloat opacity90=fresnelGrazingReflectance(opacity0);\nvec3 normalForward=faceforward(normalW,-viewDirectionW,normalW);\noutParams.alpha=getReflectanceFromAnalyticalBRDFLookup_Jones(saturate(dot(viewDirectionW,normalForward)),vec3(opacity0),vec3(opacity90),sqrt(microSurface)).x;\n#ifdef ALPHATEST\nif (outParams.alpha<ALPHATESTVALUE)\ndiscard;\n#ifndef ALPHABLEND\noutParams.alpha=1.0;\n#endif\n#endif\n}\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockAlphaFresnel = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockAlphaFresnel.js.map