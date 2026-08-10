<script setup lang="ts">
// Rein dekorative Hintergrund-Ebene hinter dem Three.js-Canvas ("3D Grid Studio").
// Bewusst als HTML/CSS und NICHT in der Three.js-Szene: so bleiben Hintergrund,
// 3D-Canvas und UI sauber getrennt, das Raster kostet keine Render-Zeit und
// skaliert verlustfrei mit dem Container (keine PNG/JPG-Grafik).
//
// Das Raster ist keine gezeichnete Perspektive, sondern eine echte: eine flache
// Ebene mit gleichmäßigem Gitter, per perspective() + rotateX() weggekippt.
// Dadurch laufen die Längslinien automatisch auf einen Fluchtpunkt zu und die
// Querlinien werden nach hinten enger - ganz ohne manuell berechnete Koordinaten.
</script>

<template>
  <div class="studio-bg" aria-hidden="true">
    <div class="studio-bg__glow"></div>
    <div class="studio-bg__floor"></div>
    <div class="studio-bg__shadow"></div>
  </div>
</template>

<style scoped>
.studio-bg {
  /* Horizont: hier beginnt der Boden (Vorgabe: 35-40 % der Höhe) */
  --horizon: 38%;
  --grid-line: rgba(216, 191, 168, 0.85);
  --cell: 32px;

  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  overflow: hidden;
  background: #fcf8ef;
  /* Damit Maus/Touch ungehindert an den Canvas darüber durchkommen und
     OrbitControls nicht blockiert werden */
  pointer-events: none;
}

.studio-bg > * {
  position: absolute;
  pointer-events: none;
}

/* Weiche Lichtstimmung: warmer Glow hinter dem Donut, dazu je ein sehr blasser
   Magenta-/Orange-Akzent aus dem DonutLab-Branding (4-7 % Deckkraft).
   Farbstopps enden bewusst auf rgba(...,0) statt `transparent`, sonst
   interpolieren manche Engines über transparentes Schwarz und es entstehen
   graue Ränder - also sichtbare harte Verläufe. */
.studio-bg__glow {
  inset: 0;
  background:
    radial-gradient(
      52% 40% at 50% 44%,
      rgba(255, 253, 247, 0.7) 0%,
      rgba(255, 253, 247, 0) 72%
    ),
    radial-gradient(
      46% 38% at 22% 28%,
      rgba(208, 0, 111, 0.05) 0%,
      rgba(208, 0, 111, 0) 72%
    ),
    radial-gradient(
      48% 40% at 80% 30%,
      rgba(244, 114, 22, 0.06) 0%,
      rgba(244, 114, 22, 0) 72%
    );
}

/* Die Ebene startet am Horizont und reicht über den unteren Rand hinaus.
   transform-origin oben mittig = Fluchtpunkt in der horizontalen Mitte.
   left/right negativ, damit die Ebene nach dem Kippen bis in die Ecken reicht. */
.studio-bg__floor {
  top: var(--horizon);
  bottom: -25%;
  left: -60%;
  right: -60%;
  transform: perspective(190px) rotateX(64deg);
  transform-origin: 50% 0;
  background-image:
    repeating-linear-gradient(to right, var(--grid-line) 0 1px, rgba(216, 191, 168, 0) 1px var(--cell)),
    repeating-linear-gradient(to bottom, var(--grid-line) 0 1px, rgba(216, 191, 168, 0) 1px var(--cell));
  opacity: 0.28;
  /* Direkt am Horizont stehen die Querlinien unendlich dicht - das flimmert und
     ergäbe eine harte Kante. Deshalb oben und unten ausblenden. */
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 22%,
    rgba(0, 0, 0, 1) 72%,
    rgba(0, 0, 0, 0) 100%
  );
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 22%,
    rgba(0, 0, 0, 1) 72%,
    rgba(0, 0, 0, 0) 100%
  );
}

/* Weicher elliptischer Schatten, damit der Donut optisch auf dem Boden steht */
.studio-bg__shadow {
  left: 50%;
  top: 63%;
  width: 30%;
  height: 9%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    closest-side,
    rgba(122, 90, 62, 0.2) 0%,
    rgba(122, 90, 62, 0) 75%
  );
  filter: blur(10px);
}

/* Auf schmalen Viewports steht der Donut kleiner im Bild - Raster etwas feiner
   und flacher, damit es nicht plötzlich dominant wird */
@media (max-width: 720px) {
  .studio-bg {
    --cell: 34px;
  }

  .studio-bg__floor {
    transform: perspective(150px) rotateX(66deg);
    opacity: 0.22;
  }
}
</style>
