import Color from "colorjs.io";

/** Keeps a protocol color's hue while meeting the terminal's rendered contrast. */
export function readableTerminalForeground(foreground: string, background: string, isDim = false): string {
  const original = new Color(foreground);
  const surface = new Color(background);
  const minimum = 4.6;
  if (original.contrastWCAG21(surface) >= minimum) {
    if (!isDim) return foreground;
    const perceptual = original.to("oklch");
    const initial = perceptual.coords[0] ?? 0;
    const destination = surface.to("oklch").coords[0] ?? 0;
    let lower = 0;
    let upper = 1;
    let result = original;
    for (let iteration = 0; iteration < 18; iteration += 1) {
      const fraction = (lower + upper) / 2;
      const candidate = perceptual
        .clone()
        .set("l", initial + (destination - initial) * fraction)
        .toGamut("srgb");
      if (candidate.contrastWCAG21(surface) >= minimum) {
        lower = fraction;
        result = candidate;
      } else {
        upper = fraction;
      }
    }
    return result.to("srgb").toString({ format: "rgb", precision: 6 });
  }
  const perceptual = original.to("oklch");
  const initialLightness = perceptual.coords[0] ?? 0;
  const destination = new Color("white").contrastWCAG21(surface) >= new Color("black").contrastWCAG21(surface) ? 1 : 0;
  let lower = 0;
  let upper = 1;
  let result = perceptual.clone().set("l", destination).toGamut("srgb");
  for (let iteration = 0; iteration < 18; iteration += 1) {
    const fraction = (lower + upper) / 2;
    const candidate = perceptual
      .clone()
      .set("l", initialLightness + (destination - initialLightness) * fraction)
      .toGamut("srgb");
    if (candidate.contrastWCAG21(surface) >= minimum) {
      upper = fraction;
      result = candidate;
    } else {
      lower = fraction;
    }
  }
  return result.to("srgb").toString({ format: "rgb", precision: 6 });
}
