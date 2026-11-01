# 3D Laundry Video Prompt Guide for Google Flow / Veo & Scroll-Scrub Script

This guide gives you:
1. **Copy-paste 3D cinematic prompts** for Google Flow (Google Veo / Imagen 3D video generation).
2. **The website code** to make the video play in reverse or forward as the user scrolls up and down the page.

---

## Part 1: Prompts for Google Flow / Veo (Copy & Paste)

### Prompt 1: The Infinite 3D Laundromat Tunnel (Recommended for Hero)
```text
Photorealistic 3D cinematic camera tracking shot pushing forward smoothly through a modern boutique laundromat with gleaming stainless-steel commercial washing machine drums spinning on both sides. In the center, iridescent water droplets and glowing bubbles float weightlessly in slow motion. Lighting is soft studio lighting in sea green (#0f766e) and vibrant light cyan blue (#38bdf8) with subtle golden warm lens flares. 8K resolution, octane render, Raytracing, hyper-detailed glass refractions, slow seamless 60fps loop.
```

### Prompt 2: 3D Floating Silk & Fabric Wave (Luxury Dry-Cleaning Vibe)
```text
Extreme slow-motion 3D simulation of crisp, luxurious white, sea-green, and light-blue silk fabrics gracefully floating and undulating through mid-air like ocean waves. Translucent soap suds and sparkling water beads bounce softly off the fabric folds. Studio cyclorama background illuminated by dual-tone neon cyan and mint teal rim lighting. Depth of field with soft bokeh, photorealistic cloth physics, 4K, 60fps continuous smooth motion.
```

### Prompt 3: Inside the Washer Drum (Macro 3D Spin)
```text
First-person macro 3D camera inside a high-tech chrome washing drum spinning with crystal clear swirling water, bubbling suds, and freshly washed colorful garments tumbling in smooth slow motion. Camera slowly pulls backward out of the round glass porthole door into a sunlit, spotless modern laundry facility. Clean aesthetic, sea green and sky blue color grading, hyper-realistic water surface physics, 60fps.
```

---

## Part 2: How to Connect the Video to Page Scrolling (Scroll-Scrubbing)

To make your 3D video advance frame-by-frame as the customer scrolls down (and rewind when they scroll up, exactly like Apple and high-end sites):

Add this script to your `public/app.js`:

```javascript
// ==========================================
// 3D VIDEO SCROLL-SCRUBBING ENGINE
// ==========================================
const heroVideo = document.querySelector('video.bg-video');

if (heroVideo) {
  heroVideo.addEventListener('loadedmetadata', initScrollScrub);
  if (heroVideo.readyState >= 1) initScrollScrub();

  function initScrollScrub() {
    heroVideo.pause();

    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      const scrollFraction = Math.min(1, Math.max(0, scrollPosition / (window.innerHeight * 1.5)));

      if (heroVideo.duration) {
        heroVideo.currentTime = scrollFraction * heroVideo.duration;
      }
    }, { passive: true });
  }
}
```

---

## Part 3: What to Do Once Google Flow Generates Your Video

1. Download the generated `.mp4` video from Google Flow.
2. Rename the file to:  
   `laundry_video.mp4`
3. Replace the existing file at:  
   `c:\Users\Hp\Downloads\clean-is-clean-website\public\images\laundry_video.mp4`
4. Also replace it inside:  
   `c:\Users\Hp\Downloads\clean-is-clean-website\hostinger-deploy\images\laundry_video.mp4`
5. The website will immediately showcase your custom 3D background!
