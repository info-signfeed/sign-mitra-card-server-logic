
export const generateInvoiceHTML = (order, items, payment) => {
    const itemRows = items.map(item => {
        const itemTotal = item.totalPrice;
        return `
        <tr>
          <td>${item.itemName}</td>
          <td>x${item.quantity}</td>
          <td>₹${item.pricePerUnit}</td>
          <td>${item.gst}%</td>
          <td>${item.serviceTax}%</td>
          <td>₹${itemTotal}</td>
        </tr>
      `;
    }).join('');

    const subtotal = items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0);
    const totalGST = items.reduce((sum, i) => sum + (i.pricePerUnit * i.gst / 100) * i.quantity, 0);
    const totalServiceTax = items.reduce((sum, i) => sum + (i.pricePerUnit * i.serviceTax / 100) * i.quantity, 0);

    return `
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 40px; color: #333; }
            h1 { text-align: center; color: #F9A825; margin-bottom: 40px; }
  
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
  
            .logo {
              height: 60px;
            }
  
            .info {
              margin-top: 30px;
            }
  
            .info div {
              margin: 5px 0;
            }
  
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 30px;
            }
  
            th, td {
              border: 1px solid #ccc;
              padding: 10px;
              text-align: center;
            }
  
            th {
              background-color: #f9f9f9;
              font-weight: bold;
            }
  
            .summary {
              margin-top: 30px;
              width: 100%;
              display: flex;
              justify-content: flex-end;
            }
  
            .summary-table {
              width: 300px;
              border-collapse: collapse;
            }
  
            .summary-table td {
              padding: 8px;
              text-align: right;
            }
  
            .summary-table .label {
              font-weight: bold;
              text-align: left;
            }
  
            .highlight {
              background-color: #F9A825;
              color: #fff;
              font-weight: bold;
            }
  
            .footer {
              margin-top: 50px;
              font-size: 12px;
              text-align: center;
              color: #888;
              border-top: 1px solid #ccc;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="../" class="logo" alt="Logo" />
            <div>
              <h2 style="margin: 0;">INVOICE</h2>
              <div><strong>Invoice ID:</strong> ${payment.razorPayOrderId}</div>
              <div><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleString()}</div>
            </div>
          </div>
          <div class="info">
            <div><strong>Customer Name:</strong> ${payment.name}</div>
            <div><strong>Phone:</strong> ${payment.phone}</div>
            <div><strong>Order Type:</strong> ${order.orderType}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>GST%</th>
                <th>Tax%</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
  
          <div class="summary">
            <table class="summary-table">
              <tr>
                <td class="label">Subtotal</td>
                <td>₹${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">Total GST</td>
                <td>₹${totalGST.toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">Service Tax</td>
                <td>₹${totalServiceTax.toFixed(2)}</td>
              </tr>
              <tr class="highlight">
                <td class="label">Grand Total</td>
                <td>₹${order.totalAmount}</td>
              </tr>
            </table>
          </div>
  
          <div class="footer">
            Thank you for your business! | Company Address Here | support@example.com
          </div>
        </body>
      </html>
    `;
};
