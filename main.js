const
  STYLE = document.createElement('style'),
  MIN_SAT = 50,
  MIN_LIGHT = 20,
  MAX_LIGHT = 80,
  ANI_LENGTH = 300,
  ANI_PAUSE = 500;
document.head.prepend(STYLE);

let
  c0 = [], p_c0,
  c1 = [], p_c1,
  c2 = [], p_c2,
  c3 = [], p_c3,
  d0,  p_d0,
  d1,  p_d1,
  ang, p_ang;

// Save previous gradient parameters, set new parameters
function setGradient() {
  p_c0  = [c0[0], c0[1], c0[2]];
  p_c1  = [c1[0], c1[1], c1[2]];
  p_c2  = [c2[0], c2[1], c2[2]];
  p_c3  = [c3[0], c3[1], c3[2]];
  p_d0  = d0;
  p_d1  = d1;
  p_ang = ang;
  c0  = randColor();
  c1  = randColor();
  c2  = randColor();
  c3  = randColor();
  d0  = rand(45, 10);
  d1  = rand(55, 90);
  ang = rand(0, 180);
  
  document.body.innerHTML = `
    <textarea onclick="copy(this)">
${ang}deg
${getHslString(c0)}
${getHslString(c1)} ${d0}%
${getHslString(c2)} ${d1}%
${getHslString(c3)}
    </textarea>
    click to copy`;
}

// Update CSS for animation loop
function loop(step) {
  if (step === 0) {
    setGradient();
  }
  
  const FRAME = step / ANI_LENGTH;
  STYLE.innerHTML = `
    body {
      background: linear-gradient(
        ${interp(p_ang, ang, FRAME, true)}deg,
        ${getHslString(interp(p_c0, c0, FRAME))},
        ${getHslString(interp(p_c1, c1, FRAME))}
        ${interp(p_d0, d0, FRAME, true)}%,
        ${getHslString(interp(p_c2, c2, FRAME))}
        ${interp(p_d1, d1, FRAME, true)}%,
        ${getHslString(interp(p_c3, c3, FRAME))}
      );
    }
  `;
  
  // Animate transition, pause on completion
  setTimeout(
    () => window.requestAnimationFrame(
      loop.bind(this, (step + 1) % ANI_LENGTH)
    ),
    step === ANI_LENGTH - 1 ? ANI_PAUSE : 0
  )
}

// @return random int, in range [min, max]
function rand(max, min = 0) {
  return Math.floor(min + (Math.random() * (max - min)));
}

// @return random color as [h, s, l]
function randColor() {
  return [
    rand(256),
    rand(100, MIN_SAT),
    rand(MAX_LIGHT, MIN_LIGHT)
  ];
}

// @return number "frame" distance between "prev" and "next"
// prev == Array => interp each value of array 
// frac == true  => return float
function interp(prev, next, frame, frac) {
  if (typeof prev === 'number') {
    frame = (Math.cos(Math.PI * frame) - 1) * -0.5;
    const value = prev + ((next - prev) * frame);
    return frac ? value : Math.floor(value);
  }
  return prev.map((p, i) => interp(p, next[i], frame, frac));
}

// @return 'hsl(  h,  s%,  l%)' from [h, s, l] "color"
function getHslString(color) {
  color = color.map((c, i) => c.toString().padStart(i ? 2 : 3, ' '));
  return `hsl(${color[0]}, ${color[1]}%, ${color[2]}%)`;
}

// Copy gradient str to clipboard
function copy(el) {
  const STR = el.value;
  el.value = `linear-gradient(${
    STR
      .replace(/\n/g, ', ')
      .replace(/,\s*$/, ')')
  }`;
  el.select();
  el.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(el.value);
  el.blur();
  el.value = STR;
  document.body.innerHTML += ' - copied';
}

setGradient();
loop(0);
