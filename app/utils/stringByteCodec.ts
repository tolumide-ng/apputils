export enum Format {
    Hexadecimal = "hex",
    Decimal = "decimal"
}

export class StringByteCodec {
    #encoder;
    #decoder;

    constructor(encoding: string = 'utf-8') {
        this.#encoder = new TextEncoder();
        this.#decoder = new TextDecoder(encoding)
    }

    encode(str: string, format: Format): string[] {
        const base = format == Format.Hexadecimal ? 16 : 10;
        return Array.from(this.#encoder.encode(str)).map(x => x.toString(base));
    }

    #parseBuffer(input: string, format: Format): Uint8Array {
        // 1. Comma-separated hexadecimal or decimal
        // 2. Space-separated hexadecimal or decimal
        
        const value = (() => {
            if (/^((0x)?[0-9A-Fa-f]+\s*,\s*)*((0x)?[0-9A-Fa-f]+\s*)$/.test(input)) {
                return input.split(",").map(x => {
                    const base = format === Format.Hexadecimal ? 16 : 10;
                    return parseInt(x.trim(), base);
                })
            } else if (/^((0x)?[0-9A-Fa-f]+\s+)*((0x)?[0-9A-Fa-f]+\s*)$/.test(input)) {
                return input.split(/\s+/).map(x => {
                    const base = format === Format.Hexadecimal ? 16 : 10;
                    return parseInt(x.trim(), base);
                })
            } else {
                throw new Error("Invalid input format")
            }
        })()

        if (value?.some(val => val < 0 || val > 255 || isNaN(val))) {
            throw (new Error("Input contains invalid bytes"));
        }

        return new Uint8Array(value)
    }

    decode(buffer: string, format: Format): string {
        const data = this.#parseBuffer(buffer, format);
        const value = this.#decoder.decode(new Uint8Array(data))
        return value
    }
}