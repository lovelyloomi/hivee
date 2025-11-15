export const applyWatermark = async (
  imageFile: File,
  watermarkText: string,
  watermarkUrl?: string
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Apply watermark
      if (watermarkUrl) {
        const watermarkImg = new Image();
        watermarkImg.crossOrigin = 'anonymous';
        watermarkImg.onload = () => {
          ctx.globalAlpha = 0.3;
          const wmSize = Math.min(canvas.width, canvas.height) * 0.3;
          ctx.drawImage(
            watermarkImg,
            canvas.width - wmSize - 20,
            canvas.height - wmSize - 20,
            wmSize,
            wmSize
          );
          ctx.globalAlpha = 1;

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          }, 'image/png');
        };
        watermarkImg.onerror = reject;
        watermarkImg.src = watermarkUrl;
      } else if (watermarkText) {
        ctx.globalAlpha = 0.3;
        ctx.font = `${Math.max(20, canvas.width / 30)}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(watermarkText, canvas.width - 20, canvas.height - 20);
        ctx.globalAlpha = 1;

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      } else {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      }
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
};

export const pdfToImages = async (pdfFile: File): Promise<Blob[]> => {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: Blob[] = [];

  for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    await page.render(renderContext as any).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob from PDF page'));
      }, 'image/jpeg', 0.9);
    });

    images.push(blob);
  }

  return images;
};
