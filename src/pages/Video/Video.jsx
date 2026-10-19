import { useRef, useState } from 'react';
import './Video.css';

// Drop the exhibition video at public/videos/exhibition.mp4 (same name),
// or change the path here.
const VIDEO_SRC = '/videos/exhibition.mp4';

// Static QR (public/images/video-qr.svg) pointing straight at this URL, so
// it keeps working without any QR service in between.
const YOUTUBE_URL = 'https://youtu.be/ZMje26vjf1o';

// Muted autoplay is the only autoplay browsers allow without a click, so
// the video starts silent and loops; SOUND unmutes it (a click counts as
// the required user gesture).
export default function Video() {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const enterFullscreen = () => frameRef.current.requestFullscreen();

  return (
    <div className="video-page">
      <div ref={frameRef} className="video-page__frame">
        <video
          ref={videoRef}
          className="video-page__player"
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      <div className="video-page__footer">
        <div className="video-page__controls">
          <button type="button" onClick={toggleSound}>
            SOUND {muted ? 'OFF' : 'ON'}
          </button>
          {document.fullscreenEnabled && (
            <button type="button" onClick={enterFullscreen}>
              FULLSCREEN
            </button>
          )}
        </div>

        <a
          className="video-page__qr"
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="video-page__qr-label">WATCH ON YOUTUBE</span>
          <img src="/images/video-qr.svg" alt="QR code linking to the video on YouTube" />
        </a>
      </div>
    </div>
  );
}
