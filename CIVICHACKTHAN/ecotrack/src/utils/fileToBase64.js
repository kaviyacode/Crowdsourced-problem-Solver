// utils/fileToBase64.js
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // converts to Base64 string
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
