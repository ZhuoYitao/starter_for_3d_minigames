// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
import "./sceneUboDeclaration.js";
import "./meshUboDeclaration.js";
var name = "pbrUboDeclaration";
var shader = "layout(std140,column_major) uniform;\nuniform Material {\nvec2 vAlbedoInfos;\nvec4 vAmbientInfos;\nvec2 vOpacityInfos;\nvec2 vEmissiveInfos;\nvec2 vLightmapInfos;\nvec3 vReflectivityInfos;\nvec2 vMicroSurfaceSamplerInfos;\nvec2 vReflectionInfos;\nvec2 vReflectionFilteringInfo;\nvec3 vReflectionPosition;\nvec3 vReflectionSize;\nvec3 vBumpInfos;\nmat4 albedoMatrix;\nmat4 ambientMatrix;\nmat4 opacityMatrix;\nmat4 emissiveMatrix;\nmat4 lightmapMatrix;\nmat4 reflectivityMatrix;\nmat4 microSurfaceSamplerMatrix;\nmat4 bumpMatrix;\nvec2 vTangentSpaceParams;\nmat4 reflectionMatrix;\nvec3 vReflectionColor;\nvec4 vAlbedoColor;\nvec4 vLightingIntensity;\nvec3 vReflectionMicrosurfaceInfos;\nfloat pointSize;\nvec4 vReflectivityColor;\nvec3 vEmissiveColor;\nvec3 vAmbientColor;\nvec2 vDebugMode;\nvec4 vMetallicReflectanceFactors;\nvec2 vMetallicReflectanceInfos;\nmat4 metallicReflectanceMatrix;\nvec2 vReflectanceInfos;\nmat4 reflectanceMatrix;\nvec3 vSphericalL00;\nvec3 vSphericalL1_1;\nvec3 vSphericalL10;\nvec3 vSphericalL11;\nvec3 vSphericalL2_2;\nvec3 vSphericalL2_1;\nvec3 vSphericalL20;\nvec3 vSphericalL21;\nvec3 vSphericalL22;\nvec3 vSphericalX;\nvec3 vSphericalY;\nvec3 vSphericalZ;\nvec3 vSphericalXX_ZZ;\nvec3 vSphericalYY_ZZ;\nvec3 vSphericalZZ;\nvec3 vSphericalXY;\nvec3 vSphericalYZ;\nvec3 vSphericalZX;\n#define ADDITIONAL_UBO_DECLARATION\n};\n#include<sceneUboDeclaration>\n#include<meshUboDeclaration>\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrUboDeclaration = { name: name, shader: shader };
//# sourceMappingURL=pbrUboDeclaration.js.map