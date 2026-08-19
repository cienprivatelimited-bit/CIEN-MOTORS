import {
  Customer,
  Supplier,
  Product,
  SaleInvoice,
  PurchaseInvoice,
  CustomerReceipt,
  SupplierPayment,
  Expense,
  AppSettings,
  DashboardSummary,
  TransactionRecord,
  Company,
  LedgerAccount,
  OpeningJournalVoucher,
  Warehouse,
  ImportHistoryRecord
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_RECEIPTS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_COMPANIES
} from './sampleData';

const STORAGE_KEYS = {
  COMPANIES: 'busy_ufo_companies',
  SETTINGS: 'busy_ufo_settings',
  CUSTOMERS: 'busy_ufo_customers',
  SUPPLIERS: 'busy_ufo_suppliers',
  PRODUCTS: 'busy_ufo_products',
  SALES: 'busy_ufo_sales',
  PURCHASES: 'busy_ufo_purchases',
  RECEIPTS: 'busy_ufo_receipts',
  PAYMENTS: 'busy_ufo_payments',
  EXPENSES: 'busy_ufo_expenses',
  LEDGERS: 'busy_ufo_ledgers',
  OPENING_JOURNALS: 'busy_ufo_opening_journals',
  WAREHOUSES: 'busy_ufo_warehouses',
  IMPORT_HISTORY: 'busy_ufo_import_history'
};

const DEFAULT_COMPANY_ID = 'comp-abc-traders';

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export const StorageService = {
  // --- COMPANIES ---
  getCompanies(): Company[] {
    const stored = getItem<Company[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    if (!stored || stored.length === 0) {
      setItem(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
      return INITIAL_COMPANIES;
    }
    return stored;
  },

  getCompanyById(companyId: string): Company | null {
    const companies = this.getCompanies();
    return companies.find((c) => c.id === companyId) || null;
  },

  saveCompany(compData: Partial<Company>): Company {
    const companies = this.getCompanies();
    const now = new Date().toISOString();

    if (compData.id) {
      const index = companies.findIndex((c) => c.id === compData.id);
      if (index !== -1) {
        const updated: Company = {
          ...companies[index],
          ...compData,
          updatedAt: now
        } as Company;
        companies[index] = updated;
        setItem(STORAGE_KEYS.COMPANIES, companies);
        return updated;
      }
    }

    const newCompany: Company = {
      id: compData.id || `comp-${Date.now()}`,
      companyName: compData.companyName?.trim() || 'New Company',
      shortName: compData.shortName?.trim().toUpperCase() || 'NEW',
      address: compData.address?.trim() || '',
      city: compData.city?.trim() || 'Colombo',
      district: compData.district?.trim() || 'Colombo',
      country: compData.country?.trim() || 'Sri Lanka',
      telephone: compData.telephone?.trim() || '',
      mobile: compData.mobile?.trim() || '',
      companyEmail: compData.companyEmail?.trim() || '',
      taxRegistrationNo: compData.taxRegistrationNo?.trim() || '',
      currency: compData.currency?.trim() || 'Rs.',
      financialYearStart: compData.financialYearStart || '2026-01-01',
      financialYearEnd: compData.financialYearEnd || '2026-12-31',
      invoicePrefix: compData.invoicePrefix?.trim() || 'INV',
      invoiceNumber: compData.invoiceNumber || 1001,
      isActive: compData.isActive !== undefined ? compData.isActive : true,
      isVatEnabled: compData.isVatEnabled !== undefined ? compData.isVatEnabled : true,
      vatNumber: compData.vatNumber?.trim() || compData.taxRegistrationNo?.trim() || '',
      defaultVatRate: compData.defaultVatRate !== undefined ? compData.defaultVatRate : 18,
      vatType: compData.vatType || 'EXCLUSIVE',
      isItemDiscountEnabled: compData.isItemDiscountEnabled !== undefined ? compData.isItemDiscountEnabled : true,
      defaultDiscountType: compData.defaultDiscountType || 'PERCENT',
      createdAt: now,
      updatedAt: now
    };

    companies.push(newCompany);
    setItem(STORAGE_KEYS.COMPANIES, companies);
    return newCompany;
  },

  disableCompany(companyId: string, disable: boolean): void {
    const companies = this.getCompanies();
    const idx = companies.findIndex((c) => c.id === companyId);
    if (idx !== -1) {
      companies[idx].isActive = !disable;
      companies[idx].updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.COMPANIES, companies);
    }
  },
  // --- SETTINGS ---
  getSettings(): AppSettings {
    return getItem<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  saveSettings(settings: AppSettings): void {
    setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  // --- CUSTOMERS ---
  getCustomers(companyId?: string): Customer[] {
    const all = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    if (!companyId) return all;
    return all.filter((c) => (c.companyId || DEFAULT_COMPANY_ID) === companyId);
  },

  saveCustomer(customer: Partial<Customer>, companyId?: string): Customer {
    const all = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const targetCompId = companyId || customer.companyId || DEFAULT_COMPANY_ID;
    const now = new Date().toISOString();

    if (customer.id) {
      // Edit
      const index = all.findIndex((c) => c.id === customer.id);
      if (index !== -1) {
        const updated: Customer = {
          ...all[index],
          ...customer,
          companyId: targetCompId
        } as Customer;
        all[index] = updated;
        setItem(STORAGE_KEYS.CUSTOMERS, all);
        return updated;
      }
    }

    // Add
    const compCustomers = all.filter((c) => (c.companyId || DEFAULT_COMPANY_ID) === targetCompId);
    const codeCount = compCustomers.length + 1;
    const autoCode = `CUST-${String(codeCount).padStart(3, '0')}`;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      companyId: targetCompId,
      code: customer.code?.trim() || autoCode,
      name: customer.name?.trim() || 'New Customer',
      phone: customer.phone?.trim() || '',
      email: customer.email?.trim() || '',
      address: customer.address?.trim() || '',
      city: customer.city?.trim() || 'Colombo',
      openingBalance: Number(customer.openingBalance || 0),
      outstandingBalance: Number(customer.openingBalance || 0),
      createdAt: now
    };

    all.unshift(newCust);
    setItem(STORAGE_KEYS.CUSTOMERS, all);
    return newCust;
  },

  deleteCustomer(id: string): void {
    const all = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS).filter((c) => c.id !== id);
    setItem(STORAGE_KEYS.CUSTOMERS, all);
  },

  // --- SUPPLIERS ---
  getSuppliers(companyId?: string): Supplier[] {
    const all = getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    if (!companyId) return all;
    return all.filter((s) => (s.companyId || DEFAULT_COMPANY_ID) === companyId);
  },

  saveSupplier(supplier: Partial<Supplier>, companyId?: string): Supplier {
    const all = getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const targetCompId = companyId || supplier.companyId || DEFAULT_COMPANY_ID;
    const now = new Date().toISOString();

    if (supplier.id) {
      const index = all.findIndex((s) => s.id === supplier.id);
      if (index !== -1) {
        const updated: Supplier = {
          ...all[index],
          ...supplier,
          companyId: targetCompId
        } as Supplier;
        all[index] = updated;
        setItem(STORAGE_KEYS.SUPPLIERS, all);
        return updated;
      }
    }

    const compSuppliers = all.filter((s) => (s.companyId || DEFAULT_COMPANY_ID) === targetCompId);
    const codeCount = compSuppliers.length + 1;
    const autoCode = `SUPP-${String(codeCount).padStart(3, '0')}`;

    const newSupp: Supplier = {
      id: `supp-${Date.now()}`,
      companyId: targetCompId,
      code: supplier.code?.trim() || autoCode,
      name: supplier.name?.trim() || 'New Supplier',
      companyName: supplier.companyName?.trim() || '',
      phone: supplier.phone?.trim() || '',
      email: supplier.email?.trim() || '',
      address: supplier.address?.trim() || '',
      openingBalance: Number(supplier.openingBalance || 0),
      payableBalance: Number(supplier.openingBalance || 0),
      createdAt: now
    };

    all.unshift(newSupp);
    setItem(STORAGE_KEYS.SUPPLIERS, all);
    return newSupp;
  },

  deleteSupplier(id: string): void {
    const all = getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS).filter((s) => s.id !== id);
    setItem(STORAGE_KEYS.SUPPLIERS, all);
  },

  // --- PRODUCTS ---
  getProducts(companyId?: string): Product[] {
    const all = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    if (!companyId) return all;
    return all.filter((p) => (p.companyId || DEFAULT_COMPANY_ID) === companyId);
  },

  // Duplicate Check
  validateProduct(code: string, name: string, excludeId?: string, companyId?: string): string | null {
    const products = this.getProducts(companyId);
    const cleanCode = code.trim().toLowerCase();
    const cleanName = name.trim().toLowerCase();

    const codeMatch = products.find(
      (p) => p.code.trim().toLowerCase() === cleanCode && p.id !== excludeId
    );
    if (codeMatch) {
      return `Product Code "${code}" is already in use by another product!`;
    }

    const nameMatch = products.find(
      (p) => p.name.trim().toLowerCase() === cleanName && p.id !== excludeId
    );
    if (nameMatch) {
      return `Product Name "${name}" already exists in the inventory!`;
    }

    return null;
  },

  saveProduct(product: Partial<Product>, companyId?: string): Product {
    const all = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const targetCompId = companyId || product.companyId || DEFAULT_COMPANY_ID;
    const now = new Date().toISOString();

    if (product.id) {
      const index = all.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        const updated: Product = {
          ...all[index],
          ...product,
          companyId: targetCompId
        } as Product;
        all[index] = updated;
        setItem(STORAGE_KEYS.PRODUCTS, all);
        return updated;
      }
    }

    const compProducts = all.filter((p) => (p.companyId || DEFAULT_COMPANY_ID) === targetCompId);
    const codeCount = compProducts.length + 1;
    const autoCode = `PROD-${String(codeCount).padStart(3, '0')}`;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      companyId: targetCompId,
      code: product.code?.trim() || autoCode,
      name: product.name?.trim() || 'New Product',
      category: product.category?.trim() || 'General',
      costPrice: Number(product.costPrice || 0),
      sellingPrice: Number(product.sellingPrice || 0),
      currentStock: Number(product.currentStock || 0),
      reorderLevel: Number(product.reorderLevel || 10),
      createdAt: now
    };

    all.unshift(newProd);
    setItem(STORAGE_KEYS.PRODUCTS, all);
    return newProd;
  },

  deleteProduct(id: string): void {
    const all = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS).filter((p) => p.id !== id);
    setItem(STORAGE_KEYS.PRODUCTS, all);
  },

  // --- SALES & INVOICES ---
  getSales(companyId?: string): SaleInvoice[] {
    const all = getItem<SaleInvoice[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
    if (!companyId) return all;
    return all.filter((s) => (s.companyId || DEFAULT_COMPANY_ID) === companyId);
  },

  createSaleInvoice(invoiceData: Omit<SaleInvoice, 'id' | 'invoiceNumber' | 'createdAt'>): SaleInvoice {
    const sales = this.getSales();
    const products = this.getProducts();
    const customers = this.getCustomers();
    const settings = this.getSettings();

    // 1. Stock Check if negative stock disabled
    if (!settings.allowNegativeStock) {
      for (const item of invoiceData.items) {
        const prod = products.find((p) => p.id === item.productId || p.code === item.productCode);
        if (prod) {
          if (prod.currentStock < item.quantity) {
            throw new Error(
              `Insufficient stock for "${prod.name}". Available: ${prod.currentStock}, Requested: ${item.quantity}. Enable 'Allow Negative Stock' in Settings to override.`
            );
          }
        }
      }
    }

    // 2. Generate Invoice Number
    const count = sales.length + 1;
    const invNumber = `INV-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newInvoice: SaleInvoice = {
      ...invoiceData,
      id: `sale-${Date.now()}`,
      invoiceNumber: invNumber,
      createdAt: new Date().toISOString()
    };

    // 3. Reduce Product Stock
    for (const item of invoiceData.items) {
      const pIndex = products.findIndex((p) => p.id === item.productId || p.code === item.productCode);
      if (pIndex !== -1) {
        products[pIndex].currentStock -= Number(item.quantity);
      }
    }
    setItem(STORAGE_KEYS.PRODUCTS, products);

    // 4. Update Customer Outstanding if credit or remaining due
    if (invoiceData.customerId && invoiceData.dueAmount > 0) {
      const cIndex = customers.findIndex((c) => c.id === invoiceData.customerId);
      if (cIndex !== -1) {
        customers[cIndex].outstandingBalance += Number(invoiceData.dueAmount);
        setItem(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    // 5. Save Sales
    sales.unshift(newInvoice);
    setItem(STORAGE_KEYS.SALES, sales);

    return newInvoice;
  },

  deleteSaleInvoice(id: string): void {
    const sales = this.getSales();
    const products = this.getProducts();
    const customers = this.getCustomers();

    const targetIndex = sales.findIndex((s) => s.id === id);
    if (targetIndex === -1) return;

    const target = sales[targetIndex];

    // Restore stock
    for (const item of target.items) {
      const pIndex = products.findIndex((p) => p.id === item.productId || p.code === item.productCode);
      if (pIndex !== -1) {
        products[pIndex].currentStock += Number(item.quantity);
      }
    }
    setItem(STORAGE_KEYS.PRODUCTS, products);

    // Revert Customer Outstanding
    if (target.customerId && target.dueAmount > 0) {
      const cIndex = customers.findIndex((c) => c.id === target.customerId);
      if (cIndex !== -1) {
        customers[cIndex].outstandingBalance = Math.max(
          0,
          customers[cIndex].outstandingBalance - Number(target.dueAmount)
        );
        setItem(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    sales.splice(targetIndex, 1);
    setItem(STORAGE_KEYS.SALES, sales);
  },

  // --- PURCHASES ---
  getPurchases(companyId?: string): PurchaseInvoice[] {
    const all = getItem<PurchaseInvoice[]>(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    if (!companyId) return all;
    return all.filter((p) => (p.companyId || DEFAULT_COMPANY_ID) === companyId);
  },

  createPurchaseInvoice(
    purchaseData: Omit<PurchaseInvoice, 'id' | 'purchaseNumber' | 'createdAt'>
  ): PurchaseInvoice {
    const purchases = this.getPurchases();
    const products = this.getProducts();
    const suppliers = this.getSuppliers();

    // 1. Generate Purchase Number
    const count = purchases.length + 1;
    const purNumber = `PUR-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newPurchase: PurchaseInvoice = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
      purchaseNumber: purNumber,
      createdAt: new Date().toISOString()
    };

    // 2. Increase Product Stock
    for (const item of purchaseData.items) {
      const pIndex = products.findIndex((p) => p.id === item.productId || p.code === item.productCode);
      if (pIndex !== -1) {
        products[pIndex].currentStock += Number(item.quantity);
        // Update cost price if provided
        if (item.unitCost > 0) {
          products[pIndex].costPrice = Number(item.unitCost);
        }
      }
    }
    setItem(STORAGE_KEYS.PRODUCTS, products);

    // 3. Update Supplier Payable
    if (purchaseData.supplierId && purchaseData.dueAmount > 0) {
      const sIndex = suppliers.findIndex((s) => s.id === purchaseData.supplierId);
      if (sIndex !== -1) {
        suppliers[sIndex].payableBalance += Number(purchaseData.dueAmount);
        setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
      }
    }

    purchases.unshift(newPurchase);
    setItem(STORAGE_KEYS.PURCHASES, purchases);

    return newPurchase;
  },

  deletePurchaseInvoice(id: string): void {
    const purchases = this.getPurchases();
    const products = this.getProducts();
    const suppliers = this.getSuppliers();

    const targetIndex = purchases.findIndex((p) => p.id === id);
    if (targetIndex === -1) return;

    const target = purchases[targetIndex];

    // Revert stock (subtract added stock)
    for (const item of target.items) {
      const pIndex = products.findIndex((p) => p.id === item.productId || p.code === item.productCode);
      if (pIndex !== -1) {
        products[pIndex].currentStock -= Number(item.quantity);
      }
    }
    setItem(STORAGE_KEYS.PRODUCTS, products);

    // Revert Supplier Payable
    if (target.supplierId && target.dueAmount > 0) {
      const sIndex = suppliers.findIndex((s) => s.id === target.supplierId);
      if (sIndex !== -1) {
        suppliers[sIndex].payableBalance = Math.max(
          0,
          suppliers[sIndex].payableBalance - Number(target.dueAmount)
        );
        setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
      }
    }

    purchases.splice(targetIndex, 1);
    setItem(STORAGE_KEYS.PURCHASES, purchases);
  },

  // --- CUSTOMER RECEIPTS ---
  getReceipts(companyId?: string): CustomerReceipt[] {
    const all = getItem<CustomerReceipt[]>(STORAGE_KEYS.RECEIPTS, INITIAL_RECEIPTS);
    if (!companyId) return all;
    return all.filter((r) => (r.companyId || DEFAULT_COMPANY_ID) === companyId);
  },

  createCustomerReceipt(receiptData: Omit<CustomerReceipt, 'id' | 'receiptNumber' | 'createdAt'>): CustomerReceipt {
    const receipts = this.getReceipts();
    const customers = this.getCustomers();
    const sales = this.getSales();

    const count = receipts.length + 1;
    const recNumber = `REC-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newReceipt: CustomerReceipt = {
      ...receiptData,
      id: `rec-${Date.now()}`,
      receiptNumber: recNumber,
      createdAt: new Date().toISOString()
    };

    // 1. Reduce Customer Outstanding
    const cIndex = customers.findIndex((c) => c.id === receiptData.customerId);
    if (cIndex !== -1) {
      customers[cIndex].outstandingBalance = Math.max(
        0,
        customers[cIndex].outstandingBalance - Number(receiptData.amount)
      );
      setItem(STORAGE_KEYS.CUSTOMERS, customers);
    }

    // 2. Adjust specific allocated Sales Invoices if provided
    if (receiptData.allocations && receiptData.allocations.length > 0) {
      for (const alloc of receiptData.allocations) {
        if (alloc.allocatedAmount > 0) {
          const sIndex = sales.findIndex((s) => s.id === alloc.invoiceId);
          if (sIndex !== -1) {
            sales[sIndex].paidAmount = Number((sales[sIndex].paidAmount + alloc.allocatedAmount).toFixed(2));
            sales[sIndex].dueAmount = Math.max(0, Number((sales[sIndex].grandTotal - sales[sIndex].paidAmount).toFixed(2)));
          }
        }
      }
      setItem(STORAGE_KEYS.SALES, sales);
    }

    receipts.unshift(newReceipt);
    setItem(STORAGE_KEYS.RECEIPTS, receipts);

    return newReceipt;
  },

  deleteCustomerReceipt(id: string): void {
    const receipts = this.getReceipts();
    const customers = this.getCustomers();
    const sales = this.getSales();

    const targetIndex = receipts.findIndex((r) => r.id === id);
    if (targetIndex === -1) return;

    const target = receipts[targetIndex];

    // Revert Customer Outstanding (add back received amount)
    const cIndex = customers.findIndex((c) => c.id === target.customerId);
    if (cIndex !== -1) {
      customers[cIndex].outstandingBalance += Number(target.amount);
      setItem(STORAGE_KEYS.CUSTOMERS, customers);
    }

    // Revert invoice allocations
    if (target.allocations && target.allocations.length > 0) {
      for (const alloc of target.allocations) {
        if (alloc.allocatedAmount > 0) {
          const sIndex = sales.findIndex((s) => s.id === alloc.invoiceId);
          if (sIndex !== -1) {
            sales[sIndex].paidAmount = Math.max(0, Number((sales[sIndex].paidAmount - alloc.allocatedAmount).toFixed(2)));
            sales[sIndex].dueAmount = Math.max(0, Number((sales[sIndex].grandTotal - sales[sIndex].paidAmount).toFixed(2)));
          }
        }
      }
      setItem(STORAGE_KEYS.SALES, sales);
    }

    receipts.splice(targetIndex, 1);
    setItem(STORAGE_KEYS.RECEIPTS, receipts);
  },

  // --- SUPPLIER PAYMENTS ---
  getPayments(companyId?: string): SupplierPayment[] {
    const all = getItem<SupplierPayment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    if (!companyId) return all;
    return all.filter((p) => (p.companyId || DEFAULT_COMPANY_ID) === companyId);
  },

  createSupplierPayment(paymentData: Omit<SupplierPayment, 'id' | 'paymentNumber' | 'createdAt'>): SupplierPayment {
    const payments = this.getPayments();
    const suppliers = this.getSuppliers();
    const purchases = this.getPurchases();

    const count = payments.length + 1;
    const payNumber = `PAY-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newPayment: SupplierPayment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      paymentNumber: payNumber,
      createdAt: new Date().toISOString()
    };

    // 1. Reduce Supplier Payable
    const sIndex = suppliers.findIndex((s) => s.id === paymentData.supplierId);
    if (sIndex !== -1) {
      suppliers[sIndex].payableBalance = Math.max(
        0,
        suppliers[sIndex].payableBalance - Number(paymentData.amount)
      );
      setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
    }

    // 2. Adjust specific allocated Purchase Bills if provided
    if (paymentData.allocations && paymentData.allocations.length > 0) {
      for (const alloc of paymentData.allocations) {
        if (alloc.allocatedAmount > 0) {
          const pIndex = purchases.findIndex((p) => p.id === alloc.purchaseId);
          if (pIndex !== -1) {
            purchases[pIndex].paidAmount = Number((purchases[pIndex].paidAmount + alloc.allocatedAmount).toFixed(2));
            purchases[pIndex].dueAmount = Math.max(0, Number((purchases[pIndex].grandTotal - purchases[pIndex].paidAmount).toFixed(2)));
          }
        }
      }
      setItem(STORAGE_KEYS.PURCHASES, purchases);
    }

    payments.unshift(newPayment);
    setItem(STORAGE_KEYS.PAYMENTS, payments);

    return newPayment;
  },

  deleteSupplierPayment(id: string): void {
    const payments = this.getPayments();
    const suppliers = this.getSuppliers();
    const purchases = this.getPurchases();

    const targetIndex = payments.findIndex((p) => p.id === id);
    if (targetIndex === -1) return;

    const target = payments[targetIndex];

    // Revert Supplier Payable (add back paid amount)
    const sIndex = suppliers.findIndex((s) => s.id === target.supplierId);
    if (sIndex !== -1) {
      suppliers[sIndex].payableBalance += Number(target.amount);
      setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
    }

    // Revert purchase bill allocations
    if (target.allocations && target.allocations.length > 0) {
      for (const alloc of target.allocations) {
        if (alloc.allocatedAmount > 0) {
          const pIndex = purchases.findIndex((p) => p.id === alloc.purchaseId);
          if (pIndex !== -1) {
            purchases[pIndex].paidAmount = Math.max(0, Number((purchases[pIndex].paidAmount - alloc.allocatedAmount).toFixed(2)));
            purchases[pIndex].dueAmount = Math.max(0, Number((purchases[pIndex].grandTotal - purchases[pIndex].paidAmount).toFixed(2)));
          }
        }
      }
      setItem(STORAGE_KEYS.PURCHASES, purchases);
    }

    payments.splice(targetIndex, 1);
    setItem(STORAGE_KEYS.PAYMENTS, payments);
  },

  // --- EXPENSES ---
  getExpenses(companyId?: string): Expense[] {
    const all = getItem<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    if (!companyId) return all;
    return all.filter((e) => (e.companyId || DEFAULT_COMPANY_ID) === companyId);
  },

  createExpense(expenseData: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>): Expense {
    const expenses = this.getExpenses();

    const count = expenses.length + 1;
    const expNumber = `EXP-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      expenseNumber: expNumber,
      createdAt: new Date().toISOString()
    };

    expenses.unshift(newExpense);
    setItem(STORAGE_KEYS.EXPENSES, expenses);

    return newExpense;
  },

  deleteExpense(id: string): void {
    const expenses = this.getExpenses();
    const targetIndex = expenses.findIndex((e) => e.id === id);
    if (targetIndex === -1) return;

    expenses.splice(targetIndex, 1);
    setItem(STORAGE_KEYS.EXPENSES, expenses);
  },

  // --- CASH BALANCE & DASHBOARD STATS ---
  calculateCashBalance(companyId?: string): number {
    const settings = this.getSettings();
    let balance = Number(settings.initialCashBalance || 0);

    // Add Cash Sales paid amounts
    const sales = this.getSales(companyId);
    sales.forEach((s) => {
      balance += Number(s.paidAmount || 0);
    });

    // Add Customer Receipts
    const receipts = this.getReceipts(companyId);
    receipts.forEach((r) => {
      if (r.paymentMode === 'CASH') {
        balance += Number(r.amount || 0);
      }
    });

    // Subtract Cash Purchases paid amounts
    const purchases = this.getPurchases(companyId);
    purchases.forEach((p) => {
      balance -= Number(p.paidAmount || 0);
    });

    // Subtract Supplier Payments
    const payments = this.getPayments(companyId);
    payments.forEach((p) => {
      if (p.paymentMode === 'CASH') {
        balance -= Number(p.amount || 0);
      }
    });

    // Subtract Expenses
    const expenses = this.getExpenses(companyId);
    expenses.forEach((e) => {
      if (e.paymentMode === 'CASH') {
        balance -= Number(e.amount || 0);
      }
    });

    return balance;
  },

  getDashboardSummary(companyId?: string): DashboardSummary {
    const todayStr = new Date().toISOString().split('T')[0];

    const sales = this.getSales(companyId);
    const purchases = this.getPurchases(companyId);
    const customers = this.getCustomers(companyId);
    const suppliers = this.getSuppliers(companyId);
    const products = this.getProducts(companyId);

    const todaySalesTotal = sales
      .filter((s) => s.date === todayStr)
      .reduce((sum, s) => sum + Number(s.grandTotal || 0), 0);

    const todayPurchasesTotal = purchases
      .filter((p) => p.date === todayStr)
      .reduce((sum, p) => sum + Number(p.grandTotal || 0), 0);

    const totalCustOutstanding = customers.reduce(
      (sum, c) => sum + Number(c.outstandingBalance || 0),
      0
    );

    const totalSuppPayable = suppliers.reduce(
      (sum, s) => sum + Number(s.payableBalance || 0),
      0
    );

    const lowStockItems = products.filter(
      (p) => p.currentStock <= p.reorderLevel
    );

    return {
      todaySales: todaySalesTotal,
      todayPurchases: todayPurchasesTotal,
      cashBalance: this.calculateCashBalance(companyId),
      customerOutstanding: totalCustOutstanding,
      supplierPayable: totalSuppPayable,
      totalProducts: products.length,
      lowStockCount: lowStockItems.length
    };
  },

  getRecentTransactions(companyId?: string): TransactionRecord[] {
    const transactions: TransactionRecord[] = [];

    const sales = this.getSales(companyId);
    sales.forEach((s) => {
      transactions.push({
        id: s.id,
        type: 'SALE',
        refNumber: s.invoiceNumber,
        partyName: s.customerName,
        date: s.date,
        amount: s.grandTotal,
        paymentType: s.type
      });
    });

    const purchases = this.getPurchases(companyId);
    purchases.forEach((p) => {
      transactions.push({
        id: p.id,
        type: 'PURCHASE',
        refNumber: p.purchaseNumber,
        partyName: p.supplierName,
        date: p.date,
        amount: p.grandTotal,
        paymentType: p.type
      });
    });

    const receipts = this.getReceipts(companyId);
    receipts.forEach((r) => {
      transactions.push({
        id: r.id,
        type: 'RECEIPT',
        refNumber: r.receiptNumber,
        partyName: r.customerName,
        date: r.date,
        amount: r.amount,
        paymentType: r.paymentMode
      });
    });

    const payments = this.getPayments(companyId);
    payments.forEach((p) => {
      transactions.push({
        id: p.id,
        type: 'PAYMENT',
        refNumber: p.paymentNumber,
        partyName: p.supplierName,
        date: p.date,
        amount: p.amount,
        paymentType: p.paymentMode
      });
    });

    const expenses = this.getExpenses(companyId);
    expenses.forEach((e) => {
      transactions.push({
        id: e.id,
        type: 'EXPENSE',
        refNumber: e.expenseNumber,
        partyName: e.category,
        date: e.date,
        amount: e.amount,
        paymentType: e.paymentMode
      });
    });

    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  },

  // --- LEDGER ACCOUNTS ---
  getLedgers(companyId?: string): LedgerAccount[] {
    const all = getItem<LedgerAccount[]>(STORAGE_KEYS.LEDGERS, []);
    if (!companyId) return all;
    return all.filter((l) => (l.companyId || DEFAULT_COMPANY_ID) === companyId);
  },

  saveLedger(ledgerData: Partial<LedgerAccount>, companyId?: string): LedgerAccount {
    const all = getItem<LedgerAccount[]>(STORAGE_KEYS.LEDGERS, []);
    const targetCompId = companyId || ledgerData.companyId || DEFAULT_COMPANY_ID;
    const now = new Date().toISOString();

    if (ledgerData.id) {
      const idx = all.findIndex((l) => l.id === ledgerData.id);
      if (idx !== -1) {
        const updated: LedgerAccount = {
          ...all[idx],
          ...ledgerData,
          companyId: targetCompId
        } as LedgerAccount;
        all[idx] = updated;
        setItem(STORAGE_KEYS.LEDGERS, all);
        return updated;
      }
    }

    const newLedger: LedgerAccount = {
      id: `ledg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      companyId: targetCompId,
      code: ledgerData.code || `ACC-${String(all.length + 1).padStart(4, '0')}`,
      name: ledgerData.name || 'General Ledger',
      accountGroup: ledgerData.accountGroup || 'General Expenses',
      accountType: ledgerData.accountType || 'GENERAL',
      openingDebit: Number(ledgerData.openingDebit || 0),
      openingCredit: Number(ledgerData.openingCredit || 0),
      currentBalance: Number((ledgerData.openingDebit || 0) - (ledgerData.openingCredit || 0)),
      createdAt: now
    };

    all.unshift(newLedger);
    setItem(STORAGE_KEYS.LEDGERS, all);
    return newLedger;
  },

  // --- WAREHOUSES / MATERIAL CENTERS ---
  getWarehouses(companyId?: string): Warehouse[] {
    const all = getItem<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, []);
    const targetCompId = companyId || DEFAULT_COMPANY_ID;
    const compWarehouses = all.filter((w) => (w.companyId || DEFAULT_COMPANY_ID) === targetCompId);
    if (compWarehouses.length === 0) {
      // Create Default Main Warehouse for this company
      const defaultWh: Warehouse = {
        id: `wh-main-${targetCompId}`,
        companyId: targetCompId,
        code: 'WH-MAIN',
        name: 'Main Warehouse',
        location: 'Main Branch',
        isDefault: true,
        createdAt: new Date().toISOString()
      };
      all.push(defaultWh);
      setItem(STORAGE_KEYS.WAREHOUSES, all);
      return [defaultWh];
    }
    return compWarehouses;
  },

  saveWarehouse(warehouseData: Partial<Warehouse>, companyId?: string): Warehouse {
    const all = getItem<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, []);
    const targetCompId = companyId || warehouseData.companyId || DEFAULT_COMPANY_ID;
    const now = new Date().toISOString();

    if (warehouseData.id) {
      const idx = all.findIndex((w) => w.id === warehouseData.id);
      if (idx !== -1) {
        const updated: Warehouse = {
          ...all[idx],
          ...warehouseData,
          companyId: targetCompId
        } as Warehouse;
        all[idx] = updated;
        setItem(STORAGE_KEYS.WAREHOUSES, all);
        return updated;
      }
    }

    const newWh: Warehouse = {
      id: `wh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      companyId: targetCompId,
      code: warehouseData.code || `WH-${String(all.length + 1).padStart(3, '0')}`,
      name: warehouseData.name || 'Branch Warehouse',
      location: warehouseData.location || '',
      isDefault: Boolean(warehouseData.isDefault),
      createdAt: now
    };

    all.unshift(newWh);
    setItem(STORAGE_KEYS.WAREHOUSES, all);
    return newWh;
  },

  // --- OPENING JOURNALS ---
  getOpeningJournals(companyId?: string): OpeningJournalVoucher[] {
    const all = getItem<OpeningJournalVoucher[]>(STORAGE_KEYS.OPENING_JOURNALS, []);
    if (!companyId) return all;
    return all.filter((j) => j.companyId === companyId);
  },

  saveOpeningJournal(journal: OpeningJournalVoucher): void {
    const all = getItem<OpeningJournalVoucher[]>(STORAGE_KEYS.OPENING_JOURNALS, []);
    const idx = all.findIndex((j) => j.id === journal.id);
    if (idx !== -1) {
      all[idx] = journal;
    } else {
      all.unshift(journal);
    }
    setItem(STORAGE_KEYS.OPENING_JOURNALS, all);
  },

  // --- IMPORT HISTORY ---
  getImportHistory(companyId?: string): ImportHistoryRecord[] {
    const all = getItem<ImportHistoryRecord[]>(STORAGE_KEYS.IMPORT_HISTORY, []);
    if (!companyId) return all;
    return all.filter((h) => h.companyId === companyId);
  },

  saveImportHistory(record: ImportHistoryRecord): void {
    const all = getItem<ImportHistoryRecord[]>(STORAGE_KEYS.IMPORT_HISTORY, []);
    all.unshift(record);
    setItem(STORAGE_KEYS.IMPORT_HISTORY, all);
  },

  // --- SEED & RESET ---
  resetDataToSample(): void {
    setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    setItem(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setItem(STORAGE_KEYS.SALES, INITIAL_SALES);
    setItem(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    setItem(STORAGE_KEYS.RECEIPTS, INITIAL_RECEIPTS);
    setItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  },

  clearAllData(): void {
    setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setItem(STORAGE_KEYS.CUSTOMERS, []);
    setItem(STORAGE_KEYS.SUPPLIERS, []);
    setItem(STORAGE_KEYS.PRODUCTS, []);
    setItem(STORAGE_KEYS.SALES, []);
    setItem(STORAGE_KEYS.PURCHASES, []);
    setItem(STORAGE_KEYS.RECEIPTS, []);
    setItem(STORAGE_KEYS.PAYMENTS, []);
    setItem(STORAGE_KEYS.EXPENSES, []);
  }
};
