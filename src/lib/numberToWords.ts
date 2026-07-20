const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertLessThanThousand(num: number): string {
  if (num === 0) return "";
  let str = "";
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }
  if (num > 0) {
    str += ones[num] + " ";
  }
  return str.trim();
}

export function numberToWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Rupees Zero Only";

  const parts = amount.toFixed(2).split(".");
  let rupees = parseInt(parts[0], 10);
  const paise = parseInt(parts[1], 10);

  if (rupees === 0 && paise === 0) return "Rupees Zero Only";

  let words = "";

  if (rupees >= 10000000) {
    words += convertLessThanThousand(Math.floor(rupees / 10000000)) + " Crore ";
    rupees %= 10000000;
  }
  if (rupees >= 100000) {
    words += convertLessThanThousand(Math.floor(rupees / 100000)) + " Lakh ";
    rupees %= 100000;
  }
  if (rupees >= 1000) {
    words += convertLessThanThousand(Math.floor(rupees / 1000)) + " Thousand ";
    rupees %= 1000;
  }
  if (rupees > 0) {
    words += convertLessThanThousand(rupees) + " ";
  }

  words = words.trim();
  let result = words ? `Rupees ${words}` : "";

  if (paise > 0) {
    const paiseWords = convertLessThanThousand(paise);
    result += result ? ` and ${paiseWords} Paise` : `${paiseWords} Paise`;
  }

  return `${result} Only`;
}
