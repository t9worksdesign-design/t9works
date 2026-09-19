// Layout for the home screen's texture squares, read off the reference
// composition and converted to percentages of `.home__stage` (a fixed
// 590:501 box centered inside the hero — see Home.jsx) so positions and
// the square aspect ratio stay correct at any viewport size.
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
    y: 19,
    size: 14,
    textureImage: '/images/home/yellow/texture.png',
    revealImage: '/images/home/yellow/reveal.png',
  },
  {
    id: 'orange',
    x: 11.9,
    y: 42.9,
    size: 14,
    textureImage: '/images/home/orange/texture.png',
    revealImage: '/images/home/orange/reveal.png',
  },
  {
    id: 'green',
    x: 51.7,
    y: 51.9,
    size: 14,
    textureImage: '/images/home/green/texture.png',
    revealImage: '/images/home/green/reveal.png',
  },
  {
    id: 'purple',
    x: 81.4,
    y: 66.9,
    size: 14,
    textureImage: '/images/home/purple/texture.png',
    revealImage: '/images/home/purple/reveal.png',
  },
];
