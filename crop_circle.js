const Jimp = require('jimp');

async function makeCircle() {
    try {
        const image = await Jimp.read('frontend/assets/mb_monogram.png');
        
        // Force square first
        const size = Math.min(image.bitmap.width, image.bitmap.height);
        image.cover(size, size);
        
        // Apply circular mask
        image.circle();
        
        // Save
        await image.writeAsync('frontend/assets/mb_monogram.png');
        console.log('Successfully cropped to circle!');
    } catch (err) {
        console.error(err);
    }
}

makeCircle();
