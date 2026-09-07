class TGA {
  constructor(buffer) {
    this.buffer = buffer;
    this.view = new DataView(buffer);
    this.offset = 0;

    this.idLength = this.view.getUint8(0);
    this.colorMapType = this.view.getUint8(1);
    this.imageType = this.view.getUint8(2);

    this.width = this.view.getUint16(12, true);
    this.height = this.view.getUint16(14, true);
    this.pixelDepth = this.view.getUint8(16);

    this.imageData = this.decode();
  }

  decode() {
    let offset = 18 + this.idLength;
    const pixelCount = this.width * this.height;
    const bytesPerPixel = this.pixelDepth / 8;

    const out = new Uint8Array(pixelCount * 4);

    if (this.imageType === 2) {
      // Uncompressed
      for (let i = 0; i < pixelCount; i++) {
        const b = this.view.getUint8(offset++);
        const g = this.view.getUint8(offset++);
        const r = this.view.getUint8(offset++);
        const a = bytesPerPixel === 4 ? this.view.getUint8(offset++) : 255;

        const idx = i * 4;
        out[idx] = r;
        out[idx + 1] = g;
        out[idx + 2] = b;
        out[idx + 3] = a;
      }
    } else if (this.imageType === 10) {
      // RLE compressed
      let i = 0;
      while (i < pixelCount) {
        const packet = this.view.getUint8(offset++);
        const count = (packet & 0x7F) + 1;

        if (packet & 0x80) {
          // RLE packet
          const b = this.view.getUint8(offset++);
          const g = this.view.getUint8(offset++);
          const r = this.view.getUint8(offset++);
          const a = bytesPerPixel === 4 ? this.view.getUint8(offset++) : 255;

          for (let j = 0; j < count; j++) {
            const idx = (i + j) * 4;
            out[idx] = r;
            out[idx + 1] = g;
            out[idx + 2] = b;
            out[idx + 3] = a;
          }
          i += count;
        } else {
          // Raw packet
          for (let j = 0; j < count; j++) {
            const b = this.view.getUint8(offset++);
            const g = this.view.getUint8(offset++);
            const r = this.view.getUint8(offset++);
            const a = bytesPerPixel === 4 ? this.view.getUint8(offset++) : 255;

            const idx = (i + j) * 4;
            out[idx] = r;
            out[idx + 1] = g;
            out[idx + 2] = b;
            out[idx + 3] = a;
          }
          i += count;
        }
      }
    }

    return out;
  }
}
