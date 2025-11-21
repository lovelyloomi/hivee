// Utility to capture screenshot from 3D canvas
export const capture3DScreenshot = async (canvasElement: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvasElement.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to capture screenshot'));
      }
    }, 'image/jpeg', 0.95);
  });
};

// Convert blob to File
export const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};
