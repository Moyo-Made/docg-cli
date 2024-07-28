import fs from 'fs';
import path from 'path';

async function generateDocs(scanResult, output) {
  const outputPath = path.resolve(output);

  // Check if the output path is a directory
  const isDirectory = fs.existsSync(outputPath) && fs.lstatSync(outputPath).isDirectory();

  let finalOutputPath;
  if (isDirectory) {
    // If it's a directory, create a file named 'documentation.md' inside it
    finalOutputPath = path.join(outputPath, 'documentation.md');
  } else {
    // If it's not a directory, assume it's intended to be a file path
    // Ensure the directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    finalOutputPath = outputPath;
  }

  const markdownContent = `# Project Documentation\n\n${scanResult}`;

  try {
    fs.writeFileSync(finalOutputPath, markdownContent);
    console.log(`Documentation generated successfully at: ${finalOutputPath}`);
  } catch (error) {
    console.error(`Error writing documentation: ${error.message}`);
    throw error; // Re-throw the error so it can be caught in the calling function
  }
}

export default generateDocs;