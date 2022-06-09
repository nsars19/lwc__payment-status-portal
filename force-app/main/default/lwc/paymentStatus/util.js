export const calculateScheduledPaymentDate = (d) => {
  const date = new Date(d);

  switch (date.getUTCDay()) {
    case 0: // Sunday
      // set to Thursdays date
      date.setUTCDate(date.getUTCDate() - 3);
      break;
    case 1: // Monday
      // set to Thursdays date
      date.setUTCDate(date.getUTCDate() - 4);
      break;
    case 2: // Tuesday
      // Change nothing
      break;
    case 3: // Wednesday
      // set to Tuesdays date
      date.setUTCDate(date.getUTCDate() - 1);
      break;
    case 4: // Thursday
      // Change nothing
      break;
    case 5: // Friday
      // set to Thursdays date
      date.setUTCDate(date.getUTCDate() - 1);
      break;
    case 6: // Saturday
      // set to Thursdays date
      date.setUTCDate(date.getUTCDate() - 2);
      break;
    default:
      break;
  }

  const day = date.getUTCDate().toString();
  const month = (date.getUTCMonth() + 1).toString();

  return `${month.length === 1 ? "0" + month : month}-${
    day.length === 1 ? "0" + day : day
  }-${date.getUTCFullYear()}`;
};

export const formatPaymentDate = (d) => {
  const [year, month, day] = d.split("-");
  return `${month}-${day}-${year}`;
};

export const sortByInvoiceIDDesc = (a, b) => {
  const A = Number(a.InvoiceID);
  const B = Number(b.InvoiceID);
  if (A > B) return -1;
  if (A < B) return 1;
  return 0;
};
