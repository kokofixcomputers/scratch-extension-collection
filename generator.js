const fs = require('fs');
const path = require('path');

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
                let license = 'N/A'; // Default license if not found
                let version = 'N/A'; // Default version if not found
                let tags = 'NoTag'; // Default tags if not found

                // Read up to the first 8 lines for metadata
                for (let i = 0; i < Math.min(lines.length, 9); i++) {
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
                    }
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
`;

                pluginsData.push(pluginEntry);

                // Write to plugins.txt after processing all files
                if (pluginsData.length === files.length) {
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