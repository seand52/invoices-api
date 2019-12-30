const PdfPrinter = require('pdfmake/src/printer'); // need to use require syntax because constructor is exported with module.exports

export const generatePdf = (docDefinition, callback) => {
  try {
    const printer = new PdfPrinter({
      Roboto: {
        normal: Buffer.from(
          require('pdfmake/build/vfs_fonts.js').pdfMake.vfs[
            'Roboto-Regular.ttf'
          ],
          'base64',
        ),
        bold: Buffer.from(
          require('pdfmake/build/vfs_fonts.js').pdfMake.vfs[
            'Roboto-Medium.ttf'
          ],
          'base64',
        ),
        italics: Buffer.from(
          require('pdfmake/build/vfs_fonts.js').pdfMake.vfs[
            'Roboto-Italic.ttf'
          ],
          'base64',
        ),
      },
    });
    const doc = printer.createPdfKitDocument(docDefinition);

    const chunks = [];

    doc.on('data', chunk => {
      chunks.push(chunk);
    });

    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      callback('data:application/pdf;base64,' + result.toString('base64'));
    });

    doc.end();
  } catch (err) {
    throw err;
  }
};
