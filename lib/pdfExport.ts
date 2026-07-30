import type { Canvas } from "@/lib/types"

export const exportToPDF = (canvas: Canvas, ownerName: string) => {
  // Simple PDF export implementation
  // In a real app, you'd use a library like jsPDF or Puppeteer
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${canvas.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { font-size: 10px; color: #666; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .content { line-height: 1.6; }
        .section { margin-bottom: 20px; }
        .section h3 { font-size: 16px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="header">${ownerName}</div>
      <div class="title">${canvas.title}</div>
      <div class="content">
        <div class="section">
          <h3>Project Details</h3>
          <p>${canvas.content}</p>
        </div>
        <div class="section">
          <h3>Client</h3>
          <p>${canvas.clientName}</p>
        </div>
        <div class="section">
          <h3>Status</h3>
          <p>${canvas.status}</p>
        </div>
        <div class="section">
          <h3>Created</h3>
          <p>${canvas.createdAt}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
};
