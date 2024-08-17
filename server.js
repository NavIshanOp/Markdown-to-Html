const express = require('express');
const bodyParser = require('body-parser');
const { marked } = require('marked');
const ejs = require('ejs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper function to apply easy styling tags
function applySimpleStyling(markdownText) {
    // Simple tag patterns
    const styles = {
        '@color': 'color',
        '@bg-color': 'background-color',
        '@font-size': 'font-size',
        '@align': 'text-align',
    };

    // Replace tags with HTML inline styles
    for (const [tag, cssProp] of Object.entries(styles)) {
        const regex = new RegExp(`${tag}\\(([^)]+)\\)`, 'g');
        markdownText = markdownText.replace(regex, (match, value) => {
            return `<span style="${cssProp}:${value};">`;
        });
    }

    // Close the styling spans at the end of the paragraph or line
    markdownText = markdownText.replace(/\n/g, '</span>\n');

    return markdownText;
}

function convertMarkdownToHTML(markdownText, customCSS = '') {
    // Apply the simple styling first
    const styledMarkdown = applySimpleStyling(markdownText);

    // Convert Markdown to HTML
    const htmlContent = marked(styledMarkdown);

    // Load and render the template with embedded CSS
    const templatePath = path.join(__dirname, 'views', 'template.ejs');
    return new Promise((resolve, reject) => {
        ejs.renderFile(templatePath, { content: htmlContent, customCSS }, (err, html) => {
            if (err) {
                return reject(err);
            }
            resolve(html);
        });
    });
}

app.post('/convert', async (req, res) => {
    const { markdown, customCSS } = req.body;
    try {
        const html = await convertMarkdownToHTML(markdown, customCSS);
        res.send(html);
    } catch (err) {
        res.status(500).send('Error rendering HTML');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
