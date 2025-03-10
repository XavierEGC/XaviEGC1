import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import PdfParser from 'pdf2json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.static(__dirname));

function cleanText(text) {
    try {
        return decodeURIComponent(text)
            .replace(/\+/g, ' ')
            .replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))
            .trim();
    } catch (e) {
        return text.replace(/\+/g, ' ').trim();
    }
}

function formatTable(headers, subheaders = null, rows) {
    let table = '\n| ' + headers.join(' | ') + ' |\n';
    table += '|' + headers.map(() => '---').join('|') + '|\n';
    if (subheaders) {
        table += '| ' + subheaders.join(' | ') + ' |\n';
    }
    rows.forEach(row => {
        table += '| ' + row.join(' | ') + ' |\n';
    });
    return table + '\n';
}

class DocumentProcessor {
    constructor() {
        this.markdown = '';
        this.currentSection = '';
        this.documentType = null;
        this.data = {
            tables: new Map(),
            lists: new Map(),
            metadata: new Map()
        };
        this.tempData = {
            buffer: [],
            inTable: false,
            tableHeaders: [],
            tableRows: []
        };
    }

    detectDocumentType(text) {
        if (text.match(/CERTIFICADO DE DISCAPACIDAD/i)) {
            return 'certificado';
        }
        if (text.match(/RECIBO POR HONORARIOS ELECTRONICO/i)) {
            return 'recibo';
        }
        // Agregar más tipos de documentos aquí
        return 'general';
    }

    processTableRow(text, y) {
        const row = text.split(/\s{2,}/).filter(Boolean);
        if (row.length > 0) {
            if (!this.tempData.inTable) {
                this.tempData.inTable = true;
                this.tempData.tableHeaders = row;
            } else {
                this.tempData.tableRows.push(row);
            }
        }
    }

    processSection(text) {
        // Detectar secciones numeradas (I., II., etc.)
        if (text.match(/^[IVX]+\.\s+/)) {
            this.closeCurrentSection();
            this.currentSection = text.split('.')[0] + '.';
            this.markdown += `\n## ${text}\n\n`;
            return true;
        }

        // Detectar secciones por texto específico
        const sectionHeaders = [
            'DIAGNOSTICO DE DAÑO',
            'DIAGNOSTICO ETIOLOGICO',
            'DISCAPACIDAD',
            'GRAVEDAD',
            'OBSERVACIONES',
            'REQUERIMIENTO'
        ];

        if (sectionHeaders.some(header => text.includes(header))) {
            this.closeCurrentSection();
            this.currentSection = text;
            this.markdown += `\n## ${text}\n\n`;
            return true;
        }

        return false;
    }

    closeCurrentSection() {
        if (this.tempData.inTable) {
            this.markdown += formatTable(
                this.tempData.tableHeaders,
                null,
                this.tempData.tableRows
            );
            this.tempData.inTable = false;
            this.tempData.tableHeaders = [];
            this.tempData.tableRows = [];
        }
    }

    processList(text) {
        if (text.match(/^[-•]\s/)) {
            return `- ${text.replace(/^[-•]\s/, '')}\n`;
        }
        return null;
    }

    processLabeledField(text) {
        if (text.includes(':')) {
            const [label, value] = text.split(':').map(s => s.trim());
            if (value) {
                return `**${label}:** ${value}\n\n`;
            }
        }
        return null;
    }

    processLine(text, x, y) {
        if (!text.trim()) return;

        // Detectar tipo de documento si aún no se ha hecho
        if (!this.documentType) {
            this.documentType = this.detectDocumentType(text);
            if (this.documentType === 'certificado') {
                this.markdown += `# ${text}\n\n`;
                return;
            }
        }

        // Procesar secciones
        if (this.processSection(text)) {
            return;
        }

        // Procesar listas
        const listItem = this.processList(text);
        if (listItem) {
            this.markdown += listItem;
            return;
        }

        // Procesar campos con etiquetas
        const labeledField = this.processLabeledField(text);
        if (labeledField) {
            this.markdown += labeledField;
            return;
        }

        // Procesar tablas si estamos en una sección que las requiere
        if (this.currentSection && ['IV.', 'V.'].includes(this.currentSection)) {
            this.processTableRow(text, y);
            return;
        }

        // Texto normal
        this.markdown += text + '\n\n';
    }

    finalize() {
        this.closeCurrentSection();
        
        // Limpiar el formato
        let result = this.markdown
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\n\s+\n/g, '\n\n')
            .trim();

        // Agregar pie de página para certificados
        if (this.documentType === 'certificado') {
            result += '\n\n---\n\n';
            result += '_Este documento ha sido procesado automáticamente._';
        }

        return result;
    }
}

async function convertPDFtoText(pdfPath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PdfParser(null, 1);
        pdfParser.loadedPdfVersion = 1;

        pdfParser.on("pdfParser_dataReady", pdfData => {
            try {
                const processor = new DocumentProcessor();
                
                pdfData.Pages.forEach((page, pageNum) => {
                    const textElements = [];
                    
                    page.Texts.forEach(text => {
                        if (text.R && text.R.length > 0) {
                            const content = text.R.map(r => cleanText(r.T)).join('').trim();
                            if (content) {
                                textElements.push({
                                    text: content,
                                    x: Math.round(text.x * 10) / 10,
                                    y: Math.round(text.y * 10) / 10
                                });
                            }
                        }
                    });

                    // Ordenar elementos primero por Y y luego por X
                    textElements.sort((a, b) => {
                        if (Math.abs(a.y - b.y) < 0.1) return a.x - b.x;
                        return a.y - b.y;
                    });

                    textElements.forEach(elem => {
                        processor.processLine(elem.text, elem.x, elem.y);
                    });

                    if (pageNum < pdfData.Pages.length - 1) {
                        processor.markdown += '\n---\n\n';
                    }
                });

                resolve(processor.finalize());
            } catch (error) {
                reject(new Error(`Error al procesar el PDF: ${error.message}`));
            }
        });

        pdfParser.on("pdfParser_dataError", error => {
            reject(new Error(`Error al analizar el PDF: ${error.message}`));
        });

        try {
            pdfParser.loadPDF(pdfPath);
        } catch (error) {
            reject(new Error(`Error al cargar el PDF: ${error.message}`));
        }
    });
}

app.post('/convert', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No se ha subido ningún archivo');
        }

        const markdownText = await convertPDFtoText(req.file.path);
        fs.unlinkSync(req.file.path);
        res.send(markdownText);
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).send('Error al procesar el archivo PDF: ' + error.message);
    }
});

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Para detener el servidor, presiona Ctrl+C');
});
