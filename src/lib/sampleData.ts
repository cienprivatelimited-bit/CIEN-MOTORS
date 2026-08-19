import { Customer, Supplier, Product, SaleInvoice, PurchaseInvoice, CustomerReceipt, SupplierPayment, Expense, AppSettings, Company } from '../types';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-abc-traders',
    companyName: 'ABC Traders',
    shortName: 'ABC',
    address: '124 Main Street, Pettah, Colombo 11, Sri Lanka',
    city: 'Colombo 11',
    district: 'Colombo',
    country: 'Sri Lanka',
    telephone: '+94 11 234 5678',
    mobile: '+94 77 123 4567',
    companyEmail: 'info@abctraders.lk',
    taxRegistrationNo: 'VAT-10928374-7000',
    currency: 'Rs.',
    financialYearStart: '2026-01-01',
    financialYearEnd: '2026-12-31',
    invoicePrefix: 'INV',
    invoiceNumber: 1001,
    isActive: true,
    isVatEnabled: true,
    vatNumber: 'VAT-10928374-7000',
    defaultVatRate: 18,
    vatType: 'EXCLUSIVE',
    isItemDiscountEnabled: true,
    defaultDiscountType: 'PERCENT',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'comp-xyz-enterprises',
    companyName: 'XYZ Enterprises',
    shortName: 'XYZ',
    address: '45 Galle Road, Bambalapitiya, Colombo 04, Sri Lanka',
    city: 'Colombo 04',
    district: 'Colombo',
    country: 'Sri Lanka',
    telephone: '+94 11 567 8900',
    mobile: '+94 71 987 6543',
    companyEmail: 'contact@xyzenterprises.lk',
    taxRegistrationNo: 'VAT-88371920-5000',
    currency: 'Rs.',
    financialYearStart: '2026-01-01',
    financialYearEnd: '2026-12-31',
    invoicePrefix: 'XYZ-INV',
    invoiceNumber: 501,
    isActive: true,
    isVatEnabled: true,
    vatNumber: 'VAT-88371920-5000',
    defaultVatRate: 15,
    vatType: 'INCLUSIVE',
    isItemDiscountEnabled: true,
    defaultDiscountType: 'FIXED',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'comp-kumar-hardware',
    companyName: 'Kumar Hardware',
    shortName: 'KHW',
    address: '88 Kandy Road, Kiribathgoda, Sri Lanka',
    city: 'Kiribathgoda',
    district: 'Gampaha',
    country: 'Sri Lanka',
    telephone: '+94 33 221 1000',
    mobile: '+94 70 334 4556',
    companyEmail: 'sales@kumarhardware.lk',
    taxRegistrationNo: 'VAT-55112233-1000',
    currency: 'Rs.',
    financialYearStart: '2026-01-01',
    financialYearEnd: '2026-12-31',
    invoicePrefix: 'KHW-INV',
    invoiceNumber: 101,
    isActive: true,
    isVatEnabled: false,
    vatNumber: '',
    defaultVatRate: 0,
    vatType: 'EXCLUSIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  companyName: 'ABC Traders',
  companyAddress: '124 Main Street, Pettah, Colombo 11, Sri Lanka',
  companyPhone: '+94 11 234 5678 / +94 77 123 4567',
  companyEmail: 'info@abctraders.lk',
  taxRegistrationNo: 'VAT-10928374-7000',
  currencySymbol: 'Rs.',
  currencyCode: 'LKR',
  allowNegativeStock: false,
  initialCashBalance: 75000,
  invoiceNote: 'Thank you for buying from ABC Traders! Goods sold are non-refundable.',
  supabaseUrl: '',
  supabaseAnonKey: '',
  defaultPrintFormat: 'A4',
  printFontSize: 'normal',
  dotMatrixDashedBorders: true,
  customPageWidthMm: 210
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    code: 'CUST-001',
    name: 'Perera & Sons Supermarket',
    phone: '0771234567',
    email: 'perera.super@gmail.com',
    address: '45 Galle Road, Bambalapitiya',
    city: 'Colombo 04',
    openingBalance: 0,
    outstandingBalance: 14500,
    createdAt: '2026-07-15T09:00:00Z'
  },
  {
    id: 'cust-2',
    code: 'CUST-002',
    name: 'Kandy Express Groceries',
    phone: '0812233445',
    email: 'kandyexpress@yahoo.com',
    address: '112 Dalada Veediya',
    city: 'Kandy',
    openingBalance: 0,
    outstandingBalance: 28900,
    createdAt: '2026-07-16T10:30:00Z'
  },
  {
    id: 'cust-3',
    code: 'CUST-003',
    name: 'Galle Coastal Mini Mart',
    phone: '0912245566',
    email: 'gallemart@outlook.com',
    address: '78 Main Street',
    city: 'Galle',
    openingBalance: 0,
    outstandingBalance: 0,
    createdAt: '2026-07-18T11:15:00Z'
  },
  {
    id: 'cust-4',
    code: 'CUST-004',
    name: 'Jaffna City Corner Store',
    phone: '0212228899',
    email: 'jaffnacity@gmail.com',
    address: '34 Hospital Road',
    city: 'Jaffna',
    openingBalance: 0,
    outstandingBalance: 8200,
    createdAt: '2026-07-20T14:20:00Z'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    code: 'SUPP-001',
    name: 'CBL Munchee Distributors',
    companyName: 'Ceylon Biscuits Limited',
    phone: '0112855111',
    email: 'orders@cbl.lk',
    address: 'High Level Road, Makumbura, Pannipitiya',
    openingBalance: 0,
    payableBalance: 32000,
    createdAt: '2026-07-10T08:00:00Z'
  },
  {
    id: 'supp-2',
    code: 'SUPP-002',
    name: 'Watawala Plantations Tea Co',
    companyName: 'Sunshine Tea (Pvt) Ltd',
    phone: '0114702400',
    email: 'wholesale@sunshinetea.lk',
    address: '60 Nawam Mawatha, Colombo 02',
    openingBalance: 0,
    payableBalance: 18500,
    createdAt: '2026-07-12T09:30:00Z'
  },
  {
    id: 'supp-3',
    code: 'SUPP-003',
    name: 'Fonterra Brands Lanka',
    companyName: 'Anchor Dairy Lanka',
    phone: '0112487000',
    email: 'sales@fonterra.lk',
    address: 'Delgoda Road, Biyagama',
    openingBalance: 0,
    payableBalance: 0,
    createdAt: '2026-07-14T12:00:00Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'PROD-001',
    name: 'Watawala Tea Bag 100s',
    category: 'Beverages',
    costPrice: 420,
    sellingPrice: 580,
    currentStock: 85,
    reorderLevel: 15,
    createdAt: '2026-07-10T08:30:00Z'
  },
  {
    id: 'prod-2',
    code: 'PROD-002',
    name: 'Munchee Super Cream Cracker 190g',
    category: 'Confectionery',
    costPrice: 160,
    sellingPrice: 220,
    currentStock: 140,
    reorderLevel: 25,
    createdAt: '2026-07-10T09:00:00Z'
  },
  {
    id: 'prod-3',
    code: 'PROD-003',
    name: 'Anchor Full Cream Milk Powder 400g',
    category: 'Dairy',
    costPrice: 890,
    sellingPrice: 1150,
    currentStock: 8, // Low Stock example
    reorderLevel: 15,
    createdAt: '2026-07-11T10:00:00Z'
  },
  {
    id: 'prod-4',
    code: 'PROD-004',
    name: 'Araliya Keeri Samba Rice 5kg',
    category: 'Grains & Rice',
    costPrice: 1350,
    sellingPrice: 1680,
    currentStock: 45,
    reorderLevel: 10,
    createdAt: '2026-07-12T11:00:00Z'
  },
  {
    id: 'prod-5',
    code: 'PROD-005',
    name: 'Elephant House Ginger Beer 1.5L',
    category: 'Beverages',
    costPrice: 280,
    sellingPrice: 380,
    currentStock: 60,
    reorderLevel: 12,
    createdAt: '2026-07-13T14:00:00Z'
  },
  {
    id: 'prod-6',
    code: 'PROD-006',
    name: 'Harischandra Coffee Powder 200g',
    category: 'Beverages',
    costPrice: 490,
    sellingPrice: 650,
    currentStock: 32,
    reorderLevel: 10,
    createdAt: '2026-07-14T15:30:00Z'
  },
  {
    id: 'prod-7',
    code: 'PROD-007',
    name: 'Ceylon Cinnamon Powder 100g',
    category: 'Spices',
    costPrice: 350,
    sellingPrice: 520,
    currentStock: 50,
    reorderLevel: 10,
    createdAt: '2026-07-15T09:10:00Z'
  },
  {
    id: 'prod-8',
    code: 'PROD-008',
    name: 'Maliban Chocolate Biscuit 200g',
    category: 'Confectionery',
    costPrice: 180,
    sellingPrice: 250,
    currentStock: 4, // Low Stock example
    reorderLevel: 15,
    createdAt: '2026-07-15T11:40:00Z'
  }
];

export const INITIAL_SALES: SaleInvoice[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'INV-2026-0001',
    date: '2026-07-28',
    customerId: 'cust-1',
    customerName: 'Perera & Sons Supermarket',
    type: 'CREDIT',
    items: [
      {
        productId: 'prod-1',
        productCode: 'PROD-001',
        productName: 'Watawala Tea Bag 100s',
        quantity: 15,
        unitPrice: 580,
        total: 8700
      },
      {
        productId: 'prod-2',
        productCode: 'PROD-002',
        productName: 'Munchee Super Cream Cracker 190g',
        quantity: 30,
        unitPrice: 220,
        total: 6600
      }
    ],
    subtotal: 15300,
    discount: 800,
    grandTotal: 14500,
    paidAmount: 0,
    dueAmount: 14500,
    notes: 'Credit sale - 14 days payment terms',
    createdAt: '2026-07-28T10:00:00Z'
  },
  {
    id: 'sale-2',
    invoiceNumber: 'INV-2026-0002',
    date: '2026-07-29',
    customerId: 'cust-2',
    customerName: 'Kandy Express Groceries',
    type: 'CREDIT',
    items: [
      {
        productId: 'prod-4',
        productCode: 'PROD-004',
        productName: 'Araliya Keeri Samba Rice 5kg',
        quantity: 10,
        unitPrice: 1680,
        total: 16800
      },
      {
        productId: 'prod-3',
        productCode: 'PROD-003',
        productName: 'Anchor Full Cream Milk Powder 400g',
        quantity: 11,
        unitPrice: 1150,
        total: 12650
      }
    ],
    subtotal: 29450,
    discount: 550,
    grandTotal: 28900,
    paidAmount: 0,
    dueAmount: 28900,
    notes: 'Delivered via Kandy lorry transport',
    createdAt: '2026-07-29T11:30:00Z'
  },
  {
    id: 'sale-3',
    invoiceNumber: 'INV-2026-0003',
    date: new Date().toISOString().split('T')[0], // Today
    customerName: 'Walk-in Cash Customer',
    type: 'CASH',
    items: [
      {
        productId: 'prod-5',
        productCode: 'PROD-005',
        productName: 'Elephant House Ginger Beer 1.5L',
        quantity: 6,
        unitPrice: 380,
        total: 2280
      },
      {
        productId: 'prod-6',
        productCode: 'PROD-006',
        productName: 'Harischandra Coffee Powder 200g',
        quantity: 2,
        unitPrice: 650,
        total: 1300
      }
    ],
    subtotal: 3580,
    discount: 80,
    grandTotal: 3500,
    paidAmount: 3500,
    dueAmount: 0,
    notes: 'Paid in cash at counter',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PURCHASES: PurchaseInvoice[] = [
  {
    id: 'pur-1',
    purchaseNumber: 'PUR-2026-0001',
    date: '2026-07-25',
    supplierId: 'supp-1',
    supplierName: 'CBL Munchee Distributors',
    type: 'CREDIT',
    items: [
      {
        productId: 'prod-2',
        productCode: 'PROD-002',
        productName: 'Munchee Super Cream Cracker 190g',
        quantity: 200,
        unitCost: 160,
        total: 32000
      }
    ],
    subtotal: 32000,
    discount: 0,
    grandTotal: 32000,
    paidAmount: 0,
    dueAmount: 32000,
    notes: 'Batch #CBL-9921',
    createdAt: '2026-07-25T09:15:00Z'
  },
  {
    id: 'pur-2',
    purchaseNumber: 'PUR-2026-0002',
    date: '2026-07-26',
    supplierId: 'supp-2',
    supplierName: 'Watawala Plantations Tea Co',
    type: 'CREDIT',
    items: [
      {
        productId: 'prod-1',
        productCode: 'PROD-001',
        productName: 'Watawala Tea Bag 100s',
        quantity: 50,
        unitCost: 370,
        total: 18500
      }
    ],
    subtotal: 18500,
    discount: 0,
    grandTotal: 18500,
    paidAmount: 0,
    dueAmount: 18500,
    notes: 'Direct factory delivery',
    createdAt: '2026-07-26T14:00:00Z'
  }
];

export const INITIAL_RECEIPTS: CustomerReceipt[] = [
  {
    id: 'rec-1',
    receiptNumber: 'REC-2026-0001',
    date: '2026-07-27',
    customerId: 'cust-4',
    customerName: 'Jaffna City Corner Store',
    amount: 5000,
    paymentMode: 'BANK_TRANSFER',
    referenceNo: 'FT-20260727-8891',
    notes: 'Advance against monthly supply',
    createdAt: '2026-07-27T16:00:00Z'
  }
];

export const INITIAL_PAYMENTS: SupplierPayment[] = [];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    expenseNumber: 'EXP-2026-0001',
    date: new Date().toISOString().split('T')[0],
    category: 'Electricity / Utilities',
    amount: 4500,
    paidTo: 'CEB (Ceylon Electricity Board)',
    paymentMode: 'CASH',
    notes: 'Shop July electricity bill',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-2',
    expenseNumber: 'EXP-2026-0002',
    date: new Date().toISOString().split('T')[0],
    category: 'Transport & Delivery',
    amount: 2500,
    paidTo: 'Pettah Local Lorry Hiring',
    paymentMode: 'CASH',
    notes: 'Transport for rice sacks',
    createdAt: new Date().toISOString()
  }
];
