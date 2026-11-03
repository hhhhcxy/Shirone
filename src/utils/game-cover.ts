// Capture errors for both initial images and images inserted by Swup.
function hideFailedImage(event: Event) {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.hasAttribute("data-game-cover")) {
    image.setAttribute("data-failed", "");
  }
}
document.addEventListener("error", hideFailedImage, true);
function checkImages() {
  document.querySelectorAll<HTMLImageElement>("img[data-game-cover]").forEach(image => {
    if (image.complete && image.naturalWidth === 0) image.setAttribute("data-failed", "");
  });
}
checkImages();
document.addEventListener("swup:content:replace", checkImages);
