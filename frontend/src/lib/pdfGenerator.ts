import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const generateReceipt = (sale: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Formato de ticket (ancho de 80mm tipo POS)
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('HOLANSOFT', pageWidth / 2, 10, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ticket de Venta', pageWidth / 2, 16, { align: 'center' });
  
  doc.setFontSize(8);
  doc.text(`Fecha: ${format(new Date(sale.date || Date.now()), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 22, { align: 'center' });
  doc.text(`Ticket Nº: ${sale.rpNumber}`, pageWidth / 2, 26, { align: 'center' });
  doc.text(`Cliente: ${sale.customer}`, pageWidth / 2, 30, { align: 'center' });

  doc.text('-'.repeat(45), pageWidth / 2, 36, { align: 'center' });
  
  let yPos = 42;
  
  // Headers
  doc.text('Cant.', 5, yPos);
  doc.text('Producto', 15, yPos);
  doc.text('Total', pageWidth - 5, yPos, { align: 'right' });
  
  yPos += 4;
  doc.text('-'.repeat(45), pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  let total = 0;

  // Items
  sale.items.forEach((item: any) => {
    const itemTotal = item.quantity * item.price;
    total += itemTotal;
    
    doc.text(`${item.quantity}`, 5, yPos);
    
    // Split long product names
    const splitTitle = doc.splitTextToSize(item.name || item.product?.nombre || 'Producto', 40);
    doc.text(splitTitle, 15, yPos);
    
    doc.text(`Q${itemTotal.toFixed(2)}`, pageWidth - 5, yPos, { align: 'right' });
    yPos += (splitTitle.length * 4) + 2;
  });

  yPos += 2;
  doc.text('-'.repeat(45), pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', 15, yPos);
  doc.text(`Q${total.toFixed(2)}`, pageWidth - 5, yPos, { align: 'right' });

  yPos += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('¡Gracias por su compra!', pageWidth / 2, yPos, { align: 'center' });
  
  // Imprimir y también descargar opcionalmente
  // Para impresión directa se puede usar autoPrint() pero abre el dialogo
  doc.autoPrint();
  doc.output('dataurlnewwindow');
};
