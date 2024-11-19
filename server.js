const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.disable('x-powered-by');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to fetch plugins from plugins.txt
app.get('/api/plugins', (req, res) => {
    fs.readFile('plugins.txt', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read plugins file' });
        }
        const plugins = parsePlugins(data);
        res.json(plugins);
    });
});

// Serve the MIT license HTML file at /license/mit
app.get('/MIT', (req, res) => {
    res.sendFile(path.join(__dirname, 'license', 'mit.html'));
});

// Serve the unknown license HTML file
app.get('/unknown', (req, res) => {
    res.sendFile(path.join(__dirname, 'license', 'unknown.html'));
});

// Endpoint to handle file downloads
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'downloads', filename);

    res.download(filePath, filename, (err) => {
        if (err) {
            console.error("File download error:", err);
            res.status(404).send("File not found");
        }
    });
});

// New endpoint to serve raw files
app.get('/raw/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'downloads', filename);

    // Serve the file as plain text
    res.sendFile(filePath, { headers: { 'Content-Type': 'text/plain' } }, (err) => {
        if (err) {
            console.error("Error serving raw file:", err);
            res.status(404).send("File not found");
        }
    });
});

// Function to parse plugins from the text file
function parsePlugins(data) {
    return data.trim().split("\n\n").map(pluginData => {
        const parts = pluginData.split("\n");
        
        if (parts.length < 5) {
            console.error("Plugin entry is missing information:", parts);
            return null;
        }

        return {
            name: parts[0],
            author: parts[1],
            description: parts[2],
            tags: parts[3] ? parts[3].split(",").map(tag => tag.trim()) : [],
            downloadUrl: `/download/${parts[4]}`,
            license: parts[5] || '',
            version: parts[6] || 'N/A',
            discordSupport: parts[7] || '',
            media: parts[8] || ''
        };
    }).filter(plugin => plugin !== null);
}

// Export the app for Vercel
module.exports = app;