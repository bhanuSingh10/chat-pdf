import * as pdfjsLib from "pdfjs-dist";

// Function to extract text from PDF using pdf.js
async function extractTextFromPdf(fileKey: string) {
  try {
    // Fetch the PDF file using the fileKey (you might want to fetch it from a URL or DB)
    const response = await fetch(`/path/to/your/file/${fileKey}`);
    const arrayBuffer = await response.arrayBuffer();

    // Load the PDF with pdf.js
    const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;

    let extractedText = "";

    // Loop through all the pages and extract text
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Extract text from each item on the page and join them
      extractedText +=
        textContent.items.map((item: any) => item.str).join(" ") + "\n";
    }

    return extractedText; // Return the extracted text
  } catch (error) {
    console.error(" Error extracting text from PDF:", error);
    return "";
  }
}
