import * as THREE from 'three';

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

// Generate front-view screenshot for 3D models
export const generateFrontViewScreenshot = async (file: File): Promise<File | null> => {
  return new Promise(async (resolve) => {
    const url = URL.createObjectURL(file);
    
    // Create off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });
    renderer.setSize(1024, 1024);
    renderer.setClearColor('#ffffff');
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ffffff');
    
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-10, -10, -5);
    scene.add(fillLight);
    
    // Load FBX
    const { FBXLoader } = await import('three-stdlib');
    const loader = new FBXLoader();
    
    loader.load(
      url,
      (fbx) => {
        // Scale model
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 2;
        const scale = targetSize / maxDim;
        fbx.scale.setScalar(scale);
        
        // Position camera for front view
        camera.position.set(0, 0, 3);
        camera.lookAt(0, 0, 0);
        
        scene.add(fbx);
        
        // Render
        renderer.render(scene, camera);
        
        // Capture screenshot
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          renderer.dispose();
          
          if (blob) {
            const screenshotFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
            resolve(screenshotFile);
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.95);
      },
      undefined,
      (error) => {
        console.error('Error loading model for screenshot:', error);
        URL.revokeObjectURL(url);
        renderer.dispose();
        resolve(null);
      }
    );
  });
};
