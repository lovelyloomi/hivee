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

// Apply watermark overlay to displayed images
export const applyWatermarkOverlay = async (
  imageUrl: string,
  watermarkText: string,
  watermarkStyle: 'center' | 'repeat' | 'disabled' = 'center'
): Promise<string> => {
  if (watermarkStyle === 'disabled') return imageUrl;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) {
        resolve(imageUrl);
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Setup watermark style
      const fontSize = Math.max(20, Math.min(img.width, img.height) * 0.05);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (watermarkStyle === 'center') {
        // Single watermark in center
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(watermarkText, 0, 0);
        ctx.restore();
      } else if (watermarkStyle === 'repeat') {
        // Repeated watermark pattern
        const spacing = fontSize * 4;
        ctx.save();
        ctx.rotate(-Math.PI / 6);
        
        for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
          for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
            ctx.fillText(watermarkText, x, y);
          }
        }
        ctx.restore();
      }

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
};

// Block right-click context menu on images
export const preventImageSave = (element: HTMLElement) => {
  element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  element.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable keyboard shortcuts for saving
  element.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return false;
    }
  });
};
