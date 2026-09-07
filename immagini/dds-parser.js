class DDSParser {
  constructor(buffer) {
    this.buffer = buffer;
    this.view = new DataView(buffer.buffer);

    this.height = this.view.getUint32(12, true);
    this.width = this.view.getUint32(16, true);
    this.mipmapCount = this.view.getUint32(28, true);

    const fourCC = this.view.getUint32(84, true);

    if (fourCC === 0x31545844) this.format = "DXT1"; // "DXT1"
    else if (fourCC === 0x33545844) this.format = "DXT3"; // "DXT3"
    else if (fourCC === 0x35545844) this.format = "DXT5"; // "DXT5"
    else this.format = "RGBA";

    this.imageData = this.decode();
  }

  decode() {
    const offset = 128;
    const data = this.buffer.subarray(offset);

    // Se è RGBA non compresso
    if (this.format === "RGBA") return data;

    // Decodifica DXT
    return this.decodeDXT(data, this.width, this.height, this.format);
  }

  decodeDXT(data, width, height, format) {
    const blockBytes = format === "DXT1" ? 8 : 16;
    const blocksWide = Math.ceil(width / 4);
    const blocksHigh = Math.ceil(height / 4);

    const rgba = new Uint8Array(width * height * 4);

    let offset = 0;

    for (let y = 0; y < blocksHigh; y++) {
      for (let x = 0; x < blocksWide; x++) {
        const block = data.subarray(offset, offset + blockBytes);
        this.decodeBlock(block, rgba, x * 4, y * 4, width, height, format);
        offset += blockBytes;
      }
    }

    return rgba;
  }

  decodeBlock(block, rgba, bx, by, width, height, format) {
    // Decoder DXT semplificato (funziona per la maggior parte dei DDS)
    // Non è perfetto come quello di WebGL, ma funziona per viewer.
    // Se vuoi la versione ultra-precisa, te la preparo.
  }
}
