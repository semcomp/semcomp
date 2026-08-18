export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none bg-semcompMidLightBlue dark:bg-semcompDarkBlue">
      <video
        src="/img/Profile/background.webm"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};