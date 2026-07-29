<<<<<<< HEAD
// Watermarks report files before they're stored — PDFs and images get a
// tiled, semi-transparent "Company · Confidential" stamp automatically.
// Word/Excel files are left as-is (see README note at the bottom of this file).

=======
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
const fs = require('fs');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const Jimp = require('jimp');

const WATERMARK_TEXT = 'Jentech Group of Companies · Confidential';

async function watermarkPdf(filePath) {
    const bytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(bytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 18;
    const textWidth = font.widthOfTextAtSize(WATERMARK_TEXT, fontSize);

    for (const page of pdfDoc.getPages()) {
        const { width, height } = page.getSize();
        const stepX = textWidth + 90;
        const stepY = 130;
        for (let y = -height * 0.5; y < height * 1.3; y += stepY) {
            for (let x = -width * 0.5; x < width * 1.3; x += stepX) {
                page.drawText(WATERMARK_TEXT, {
<<<<<<< HEAD
                    x, y,
=======
                    x,
                    y,
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
                    size: fontSize,
                    font,
                    color: rgb(0.55, 0.55, 0.55),
                    opacity: 0.22,
                    rotate: degrees(35)
                });
            }
        }
    }
    fs.writeFileSync(filePath, await pdfDoc.save());
}

async function watermarkImage(filePath) {
    const image = await Jimp.read(filePath);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

    const textWidth = Jimp.measureText(font, WATERMARK_TEXT);
    const tile = new Jimp(textWidth + 40, 60, 0x00000000);
    tile.print(font, 8, 20, WATERMARK_TEXT);
    tile.rotate(-35, false);
    tile.opacity(0.32);

<<<<<<< HEAD
    const w = image.bitmap.width, h = image.bitmap.height;
=======
    const w = image.bitmap.width,
        h = image.bitmap.height;
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
    for (let y = -tile.bitmap.height; y < h + tile.bitmap.height; y += tile.bitmap.height + 15) {
        for (let x = -tile.bitmap.width; x < w + tile.bitmap.width; x += tile.bitmap.width + 25) {
            image.composite(tile, x, y);
        }
    }
    await image.writeAsync(filePath);
}
<<<<<<< HEAD

// Call this after multer has saved the uploaded file to disk, before the
// report record is inserted. Silently does nothing for file types that
// aren't PDF or an image (Word/Excel — see note below).
=======
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
async function applyWatermark(filePath, mimetype) {
    try {
        if (mimetype === 'application/pdf') {
            await watermarkPdf(filePath);
        } else if (mimetype === 'image/jpeg' || mimetype === 'image/png') {
            await watermarkImage(filePath);
        }
<<<<<<< HEAD
        // .doc/.docx/.xls/.xlsx intentionally left untouched — watermarking
        // those reliably needs much heavier tooling (e.g. a LibreOffice
        // instance running on the server) than is worth adding for this.
        // If watermarking those matters, export/deliver as PDF instead.
    } catch (err) {
        // Don't let a watermark failure block the whole upload — the report
        // still gets created, just without a watermark on this one file.
=======
    } catch (err) {
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
        console.error('Watermarking failed for', filePath, err.message);
    }
}

<<<<<<< HEAD
module.exports = { applyWatermark, WATERMARK_TEXT };
=======
module.exports = { applyWatermark, WATERMARK_TEXT };
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
