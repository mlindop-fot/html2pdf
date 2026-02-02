window.function = function (html, fileName, format, zoom, orientation, margin, breakBefore, breakAfter, breakAvoid, fidelity, customDimensions) {
    // FIDELITY MAPPING
    const fidelityMap = {
        low: 1,
        standard: 1.5,
        high: 2,
    };

    // DYNAMIC VALUES
    html = html.value ?? "No HTML set.";
    fileName = fileName.value ?? "file";
    format = format.value ?? "a4";
    zoom = zoom.value ?? "1";
    orientation = orientation.value ?? "portrait";
    margin = Number(margin.value) ?? 0;
    breakBefore = breakBefore.value ? breakBefore.value.split(",") : [];
    breakAfter = breakAfter.value ? breakAfter.value.split(",") : [];
    breakAvoid = breakAvoid.value ? breakAvoid.value.split(",") : [];
    const quality = fidelityMap[fidelity.value] ?? 1.5;
    customDimensions = customDimensions.value ? customDimensions.value.split(",").map(Number) : null;

    // DOCUMENT DIMENSIONS
    const formatDimensions = {
        a0: [4967, 7022], a1: [3508, 4967], a2: [2480, 3508], a3: [1754, 2480],
        a4: [1240, 1754], a5: [874, 1240], a6: [620, 874], a7: [437, 620],
        a8: [307, 437], a9: [219, 307], a10: [154, 219], b4: [1476, 2085],
        letter: [1276, 1648], legal: [1276, 2102], tabloid: [1648, 2551]
    };

    const dimensions = customDimensions || formatDimensions[format.toLowerCase()] || formatDimensions.a4;
    
    // Adjust dimensions for orientation
    let dims = [...dimensions];
    if (orientation === 'landscape' && dims[0] < dims[1]) {
        dims = [dims[1], dims[0]];
    } else if (orientation === 'portrait' && dims[1] < dims[0]) {
        dims = [dims[1], dims[0]];
    }

    const finalDimensions = dims.map((d) => Math.round(d / zoom));
    // Calculate content width to prevent overlap (Dimensions minus margins)
    const contentWidth = finalDimensions[0] - (margin * 2);

    const customCSS = `
    body { margin: 0!important; padding: 0!important; }
    #content { 
        width: ${contentWidth}px; 
        margin: 0 auto;
        word-wrap: break-word;
    }
    #content * { max-width: 100%; box-sizing: border-box; }
    button#download {
        position: fixed; border-radius: 0.5rem; font-size: 14px; font-weight: 600;
        color: #0d0d0d; border: none; font-family: sans-serif; padding: 0px 12px;
        height: 32px; background: #ffffff; top: 8px; right: 8px;
        box-shadow: 0 0 0 0.5px rgba(0,0,0,0.08), 0 1px 2.5px rgba(0,0,0,0.1);
        cursor: pointer; z-index: 10000;
    }
    .downloading { color: #ea580c!important; }
    .done { color: #16a34a!important; }
    `;

    const originalHTML = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"></script>
    <style>${customCSS}</style>
    <div class="main">
        <button id="download">Download PDF</button>
        <div id="content">${html}</div>
    </div>
    <script>
    document.getElementById('download').addEventListener('click', function() {
        const element = document.getElementById('content');
        const button = this;
        button.innerText = 'Downloading...';
        button.classList.add('downloading');

        const opt = {
            pagebreak: { 
                mode: ['avoid-all', 'css'], 
                before: ${JSON.stringify(breakBefore)}, 
                after: ${JSON.stringify(breakAfter)}, 
                avoid: ${JSON.stringify(breakAvoid)} 
            },
            margin: ${margin},
            filename: '${fileName}.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: ${quality}, 
                useCORS: true, 
                letterRendering: true,
                width: ${contentWidth}
            },
            jsPDF: { 
                unit: 'px', 
                format: [${finalDimensions}], 
                orientation: '${orientation}',
                hotfixes: ['px_scaling']
            }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            button.innerText = 'Done 🎉';
            button.classList.remove('downloading');
            button.classList.add('done');
            setTimeout(() => { 
                button.innerText = 'Download PDF'; 
                button.classList.remove('done');
            }, 2000);
        });
    });
    <\/script>
    `;

    return "data:text/html;charset=utf-8," + encodeURIComponent(originalHTML);
};
