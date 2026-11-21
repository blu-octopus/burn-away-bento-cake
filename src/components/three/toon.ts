import * as THREE from 'three'

/**
 * The cake's "cute" shader: toon shading with a soft 3-step ramp, plus
 *  - hue-shifted shadows (dark areas lean lavender instead of going grey),
 *  - a pastel rim light around silhouettes (that sugar-glow edge),
 *  - a tiny bit of warmth lifted into the lit side.
 * Built on MeshToonMaterial so it keeps lights, shadows and instancing; the
 * extras are injected at the end of the fragment shader.
 */
const ramp = (() => {
  // three bands: shade / mid / lit — soft, never black
  const data = new Uint8Array([110, 175, 235])
  const t = new THREE.DataTexture(data, 3, 1, THREE.RedFormat)
  t.minFilter = THREE.NearestFilter
  t.magFilter = THREE.NearestFilter
  t.generateMipmaps = false
  t.needsUpdate = true
  return t
})()

const SHADOW_TINT = new THREE.Color('#b9a3ff')
const RIM = new THREE.Color('#fff0f6')

export function toonMaterial(color: THREE.ColorRepresentation, opts: { rim?: number; shadowTint?: number } = {}) {
  const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp })
  const rim = opts.rim ?? 0.28
  const tint = opts.shadowTint ?? 0.45
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uRim = { value: RIM }
    shader.uniforms.uRimStrength = { value: rim }
    shader.uniforms.uShadowTint = { value: SHADOW_TINT }
    shader.uniforms.uTintStrength = { value: tint }
    shader.fragmentShader =
      'uniform vec3 uRim;\nuniform float uRimStrength;\nuniform vec3 uShadowTint;\nuniform float uTintStrength;\n' +
      shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        {
          vec3 viewDir = normalize(vViewPosition);
          float facing = clamp(dot(normalize(normal), viewDir), 0.0, 1.0);
          // sugar-glow rim on the silhouette
          float rim = smoothstep(0.35, 1.0, pow(1.0 - facing, 2.0));
          // hue-shift the shaded side toward lavender instead of grey
          float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
          // a touch more saturation so pastels stay candy-coloured after tone mapping
          gl_FragColor.rgb = mix(vec3(lum), gl_FragColor.rgb, 1.18);
          float shade = 1.0 - smoothstep(0.30, 0.75, lum);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * uShadowTint * 1.35, shade * uTintStrength);
          gl_FragColor.rgb += uRim * rim * uRimStrength;
        }
        #include <dithering_fragment>`,
      )
  }
  // one compiled program per variant, not per colour
  m.customProgramCacheKey = () => `cake-toon-${rim}-${tint}`
  return m
}

export const INK = '#3a2622'
