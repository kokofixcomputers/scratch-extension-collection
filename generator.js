const fs = require('fs');
const path = require('path');
const https = require('https');

// Directory containing the plugin files
const downloadsDir = path.join(__dirname, 'downloads');
// Path to the plugins.txt file
const pluginsFilePath = path.join(__dirname, 'plugins.txt');

// Function to read files from the downloads directory
function readPluginsFromFiles() {
    fs.readdir(downloadsDir, (err, files) => {
        if (err) {
            console.error("Error reading downloads directory:", err);
            return;
        }

        const pluginsData = [];
        let processedFilesCount = 0;

        // Process each file in the downloads directory
        files.forEach(file => {
            const filePath = path.join(downloadsDir, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${file}:`, err);
                    return;
                }

                // Extract metadata from the top of the file
                const lines = data.split('\n');

                // Initialize variables with default values
                let name = '';
                let id = '';
                let description = '';
                let by = 'N/A'; // Default author if not found
                let license = 'unknown'; // Default license if not found
                let version = 'N/A'; // Default version if not found
                let tags = 'NoTag'; // Default tags if not found
                let media = ''; // Default media if not found

                // Read up to the first 10 lines for metadata
                for (let i = 0; i < Math.min(lines.length, 10); i++) {
                    const line = lines[i].trim();
                    if (line.startsWith('// Name:')) {
                        name = line.replace('// Name:', '').trim();
                    } else if (line.startsWith('// ID:')) {
                        id = line.replace('// ID:', '').trim();
                    } else if (line.startsWith('// Description:')) {
                        description = line.replace('// Description:', '').trim();
                    } else if (line.startsWith('// By:')) {
                        by = line.replace('// By:', '').trim();
                    } else if (line.startsWith('// Licence:')) {
                        license = line.replace('// Licence:', '').trim(); // Update license only if found
                    } else if (line.startsWith('// Version V.')) {
                        version = line.replace('// Version V.', '').trim(); // Update version only if found
                    } else if (line.startsWith('// Tags:')) {
                        tags = line.replace('// Tags:', '').trim(); // Update tags only if found
                    } else if (line.startsWith('// Thumbnail:')) {
                        media = line.replace('// Thumbnail:', '').trim(); // Update media only if found
                    }
                }

                // If media is not found, construct the URL based on the filename without .js
                if (!media) {
                    const filenameWithoutJs = file.replace('.js', '');
                    media = `https://raw.githubusercontent.com/kokofixcomputers/scratch-extension-collection/98e8bf43fefba7b7d172bd4514edbb1a9bdc7cc9/thumbs/${filenameWithoutJs}.svg`;
                }

                // Construct the plugin entry
                const pluginEntry = `
${name}
${by}
${description}
${tags}
${file}
${license}
${version}
${media}
${media}
`;

                pluginsData.push(pluginEntry);
                processedFilesCount++;

                // Write to plugins.txt after processing all files
                if (processedFilesCount === files.length) {
                    writePluginsToFile(pluginsData);
                }
            });
        });
    });
}

// Function to write collected plugin data to plugins.txt
function writePluginsToFile(pluginsData) {
    fs.writeFile(pluginsFilePath, pluginsData.join('\n\n'), (err) => {
        if (err) {
            console.error("Error writing to plugins.txt:", err);
        } else {
            console.log("Successfully written to plugins.txt");
        }
    });
}

// Start reading plugins from files
readPluginsFromFiles();