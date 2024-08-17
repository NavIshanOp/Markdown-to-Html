document.getElementById('apply-style').addEventListener('click', () => {
    const outputFrame = document.getElementById('html-output');
    const outputDocument = outputFrame.contentDocument || outputFrame.contentWindow.document;

    const textColor = document.getElementById('text-color').value;
    const bgColor = document.getElementById('bg-color').value;
    const fontSize = document.getElementById('font-size').value;
    const fontFamily = document.getElementById('font-family').value;
    const textAlign = document.getElementById('text-align').value;
    const border = document.getElementById('border').value;
    const padding = document.getElementById('padding').value + 'px';

    const styles = {
        color: textColor,
        backgroundColor: bgColor,
        fontSize: fontSize,
        fontFamily: fontFamily,
        textAlign: textAlign,
        border: border,
        padding: padding,
    };

    // Apply the styles to the entire document body
    for (const [prop, value] of Object.entries(styles)) {
        outputDocument.body.style[prop] = value;
    }

    // Save the inline styles to be included in the downloaded HTML
    outputDocument.body.dataset.appliedStyles = JSON.stringify(styles);
});

document.getElementById('convert-btn').addEventListener('click', () => {
    const markdown = document.getElementById('markdown-input').value;

    fetch('/convert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown }),
    })
    .then(response => response.text())
    .then(html => {
        const outputFrame = document.getElementById('html-output');
        outputFrame.srcdoc = html;

        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.disabled = false;

        downloadBtn.onclick = () => {
            const customCSS = document.getElementById('css-editor').value;
            const appliedStyles = JSON.parse(outputFrame.contentDocument.body.dataset.appliedStyles || '{}');
            
            // Convert the applied styles into a CSS string
            let inlineStyles = '';
            for (const [prop, value] of Object.entries(appliedStyles)) {
                inlineStyles += `${prop}: ${value}; `;
            }

            // Create the final HTML with both custom CSS and inline styles
            const finalHTML = `
                <html>
                <head>
                    <style>
                        ${customCSS}
                    </style>
                </head>
                <body style="${inlineStyles}">
                    ${outputFrame.srcdoc}
                </body>
                </html>
            `;
            const blob = new Blob([finalHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            downloadBtn.disabled = true;
        };
    });
});

document.getElementById('css-editor').addEventListener('input', () => {
    const customCSS = document.getElementById('css-editor').value;
    const outputFrame = document.getElementById('html-output');

    outputFrame.contentWindow.document.head.innerHTML = `<style>${customCSS}</style>`;
});
