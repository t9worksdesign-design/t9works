// Layout for the home screen's texture squares, positioned by percentage
// directly against `.home__hero` so the composition fills the hero edge
// to edge on any screen (see Home.jsx / Home.css — no letterboxing).
// `y` values are stretched so the lowest square's bottom edge lands near
// 92% of the hero height instead of the ~81% in the original reference,
// so the composition uses the full vertical space instead of leaving a
// dead band at the bottom.
// `textureImage` sits on top and is draggable; dragging it aside reveals
// `revealImage` underneath at the same spot.
export const homeVisuals = [
  {
    id: 'red',
    x: 0,
    y: 0,
    size: 14,
    textureImage: '/images/home/red/texture.png',
    revealImage: '/images/home/red/reveal.png',
  },
  {
    id: 'yellow',
    x: 24.6,
    y: 22.2,
    size: 14,
    textureImage: '/images/home/yellow/texture.png',
    revealImage: '/images/home/yellow/reveal.png',
  },
  {
    id: 'orange',
    x: 11.9,
    y: 50,
    size: 14,
    textureImage: '/images/home/orange/texture.png',
    revealImage: '/images/home/orange/reveal.png',
  },
  {
    id: 'green',
    x: 51.7,
    y: 60.5,
    size: 14,
    textureImage: '/images/home/green/texture.png',
    revealImage: '/images/home/green/reveal.png',
  },
  {
    id: 'purple',
    x: 81.4,
    y: 78,
    size: 14,
    textureImage: '/images/home/purple/texture.png',
    revealImage: '/images/home/purple/reveal.png',
  },
];
