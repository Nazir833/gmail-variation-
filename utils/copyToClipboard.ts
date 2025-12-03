/**
 * Copies the given text to the clipboard.
 * @param text The text to copy.
 * @returns A promise that resolves to true if successful, false otherwise.
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Attempt to use the modern Clipboard API
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text using Clipboard API: ', err);
    // Fallback for browsers that do not support navigator.clipboard or if permission is denied
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Make the textarea invisible and outside the viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      // Execute the copy command
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error('Fallback: Failed to copy text: ', fallbackErr);
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export default copyToClipboard;