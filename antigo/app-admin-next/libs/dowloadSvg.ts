import qrcode from 'qrcode';

export async function generateAndDownloadQRCode(name: string, value: string): Promise<void> {
    try {
        const qrCodeDataUrl = await qrcode.toDataURL(value);
        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        const nameWithoutSpaces = name.replace(/\s/g, '');
        link.download = `${nameWithoutSpaces}.svg`;
        link.click();
    } catch (error) {
        console.error('Failed to generate and download QR code:', error);
    }
}