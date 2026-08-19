import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Product,
  Customer,
  Supplier,
  SaleInvoice,
  PurchaseInvoice,
  CustomerReceipt,
  SupplierPayment,
  Expense,
  Company,
  AppSettings
} from '../types';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getActiveSupabaseCredentials(): { url: string; key: string } {
  let url = '';
  let key = '';

  // 1. Check localStorage settings
  try {
    const rawSettings = localStorage.getItem('busy_ufo_settings');
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (parsed.supabaseUrl) url = parsed.supabaseUrl.trim();
      if (parsed.supabaseAnonKey) key = parsed.supabaseAnonKey.trim();
    }
  } catch (e) {
    console.error('Error reading Supabase settings from storage:', e);
  }

  // 2. Fallback to Vite environment variables
  if (!url) {
    url = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
  }
  if (!key) {
    key = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();
  }

  return { url, key };
}

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const finalUrl = url ? url.trim() : getActiveSupabaseCredentials().url;
  const finalKey = key ? key.trim() : getActiveSupabaseCredentials().key;

  if (!finalUrl || !finalKey) return null;

  if (cachedClient && cachedUrl === finalUrl && cachedKey === finalKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(finalUrl, finalKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    cachedUrl = finalUrl;
    cachedKey = finalKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  url: string;
  tableStatus?: {
    products: boolean;
    customers: boolean;
    suppliers: boolean;
    sales: boolean;
  };
  details?: string;
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<ConnectionTestResult> {
  const credentials = {
    url: url ? url.trim() : getActiveSupabaseCredentials().url,
    key: key ? key.trim() : getActiveSupabaseCredentials().key
  };

  if (!credentials.url || !credentials.key) {
    return {
      success: false,
      url: credentials.url,
      message: 'Supabase URL or Anon Public Key is missing.'
    };
  }

  if (!credentials.url.startsWith('https://')) {
    return {
      success: false,
      url: credentials.url,
      message: 'Supabase URL must start with https:// (e.g., https://your-project.supabase.co).'
    };
  }

  try {
    const client = createClient(credentials.url, credentials.key);
    
    // Test product table query
    const { data: prodData, error: prodError } = await client
      .from('busy_ufo_products')
      .select('id')
      .limit(1);

    if (prodError) {
      if (prodError.code === 'PGRST116' || prodError.message.includes('relation') || prodError.message.includes('does not exist')) {
        return {
          success: false,
          url: credentials.url,
          message: 'Connected to Supabase, but tables have not been created yet. Please copy and execute the SQL Schema Script in the Supabase SQL Editor.',
          details: prodError.message
        };
      }
      if (prodError.message.includes('JWT') || prodError.code === 'PGRST301') {
        return {
          success: false,
          url: credentials.url,
          message: 'Invalid Anon Public Key. Please check the anon key copied from Supabase Project Settings -> API.',
          details: prodError.message
        };
      }
      return {
        success: false,
        url: credentials.url,
        message: `Supabase query returned error: ${prodError.message}`,
        details: prodError.message
      };
    }

    return {
      success: true,
      url: credentials.url,
      message: 'Supabase connection verified successfully! Database tables are accessible.',
      tableStatus: {
        products: true,
        customers: true,
        suppliers: true,
        sales: true
      }
    };
  } catch (err: any) {
    return {
      success: false,
      url: credentials.url,
      message: `Failed to connect to Supabase: ${err?.message || 'Network error'}`,
      details: String(err)
    };
  }
}

// ==========================================
// SUPABASE REAL-TIME CLOUD SYNC ENGINE
// ==========================================

export const SupabaseSyncService = {
  // --- PRODUCTS ---
  async syncProduct(product: Product): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase not configured' };

    try {
      const payload = {
        id: product.id,
        code: product.code,
        name: product.name,
        category: product.category || 'General',
        unit: product.unit || 'Pcs',
        cost_price: Number(product.costPrice || 0),
        selling_price: Number(product.sellingPrice || 0),
        current_stock: Number(product.currentStock || 0),
        reorder_level: Number(product.reorderLevel || 10),
        company_id: product.companyId || 'comp-1',
        updated_at: new Date().toISOString()
      };

      const { error } = await client
        .from('busy_ufo_products')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase product sync error:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.warn('Supabase product sync exception:', e);
      return { success: false, error: e?.message };
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('busy_ufo_products').delete().eq('id', productId);
    } catch (e) {
      console.warn('Supabase product delete exception:', e);
    }
  },

  // --- CUSTOMERS ---
  async syncCustomer(customer: Customer): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase not configured' };

    try {
      const payload = {
        id: customer.id,
        code: customer.code,
        name: customer.name,
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        city: customer.city || 'Colombo',
        opening_balance: Number(customer.openingBalance || 0),
        current_balance: Number(customer.outstandingBalance || 0),
        company_id: customer.companyId || 'comp-1',
        updated_at: new Date().toISOString()
      };

      const { error } = await client
        .from('busy_ufo_customers')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase customer sync error:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.warn('Supabase customer sync exception:', e);
      return { success: false, error: e?.message };
    }
  },

  async deleteCustomer(customerId: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('busy_ufo_customers').delete().eq('id', customerId);
    } catch (e) {
      console.warn('Supabase customer delete exception:', e);
    }
  },

  // --- SUPPLIERS ---
  async syncSupplier(supplier: Supplier): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase not configured' };

    try {
      const payload = {
        id: supplier.id,
        code: supplier.code,
        name: supplier.name,
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        city: supplier.city || 'Colombo',
        opening_balance: Number(supplier.openingBalance || 0),
        current_balance: Number(supplier.payableBalance || 0),
        company_id: supplier.companyId || 'comp-1',
        updated_at: new Date().toISOString()
      };

      const { error } = await client
        .from('busy_ufo_suppliers')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase supplier sync error:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.warn('Supabase supplier sync exception:', e);
      return { success: false, error: e?.message };
    }
  },

  async deleteSupplier(supplierId: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('busy_ufo_suppliers').delete().eq('id', supplierId);
    } catch (e) {
      console.warn('Supabase supplier delete exception:', e);
    }
  },

  // --- SALES INVOICES ---
  async syncSaleInvoice(sale: SaleInvoice): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase not configured' };

    try {
      const salePayload = {
        id: sale.id,
        invoice_number: sale.invoiceNumber,
        invoice_date: sale.date,
        customer_id: sale.customerId || null,
        customer_name: sale.customerName,
        sale_type: sale.type,
        total_amount: Number(sale.subtotal || 0),
        overall_discount: Number(sale.discount || 0),
        vat_amount: 0,
        grand_total: Number(sale.grandTotal || 0),
        paid_amount: Number(sale.paidAmount || 0),
        due_amount: Number(sale.dueAmount || 0),
        payment_status: sale.dueAmount <= 0 ? 'PAID' : (sale.paidAmount > 0 ? 'PARTIAL' : 'UNPAID'),
        company_id: sale.companyId || 'comp-1',
        notes: sale.notes || ''
      };

      const { error: saleError } = await client
        .from('busy_ufo_sales')
        .upsert(salePayload, { onConflict: 'id' });

      if (saleError) {
        console.warn('Supabase sale sync error:', saleError);
        return { success: false, error: saleError.message };
      }

      // Upsert Items
      if (sale.items && sale.items.length > 0) {
        const itemRows = sale.items.map((item) => ({
          invoice_id: sale.id,
          product_id: item.productId || null,
          product_code: item.productCode || '',
          product_name: item.productName || '',
          quantity: Number(item.quantity || 0),
          unit_price: Number(item.unitPrice || 0),
          discount: Number(item.discount || 0),
          discount_type: item.discountType || 'PERCENT',
          total: Number(item.total || 0)
        }));

        await client.from('busy_ufo_sale_items').delete().eq('invoice_id', sale.id);
        await client.from('busy_ufo_sale_items').insert(itemRows);
      }

      return { success: true };
    } catch (e: any) {
      console.warn('Supabase sale sync exception:', e);
      return { success: false, error: e?.message };
    }
  },

  // --- PURCHASES ---
  async syncPurchaseInvoice(purchase: PurchaseInvoice): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase not configured' };

    try {
      const purchasePayload = {
        id: purchase.id,
        purchase_number: purchase.purchaseNumber,
        purchase_date: purchase.date,
        supplier_id: purchase.supplierId || null,
        supplier_name: purchase.supplierName,
        purchase_type: purchase.type,
        total_amount: Number(purchase.subtotal || 0),
        overall_discount: Number(purchase.discount || 0),
        vat_amount: 0,
        grand_total: Number(purchase.grandTotal || 0),
        paid_amount: Number(purchase.paidAmount || 0),
        due_amount: Number(purchase.dueAmount || 0),
        payment_status: purchase.dueAmount <= 0 ? 'PAID' : (purchase.paidAmount > 0 ? 'PARTIAL' : 'UNPAID'),
        company_id: purchase.companyId || 'comp-1',
        notes: purchase.notes || ''
      };

      const { error: purError } = await client
        .from('busy_ufo_purchases')
        .upsert(purchasePayload, { onConflict: 'id' });

      if (purError) {
        console.warn('Supabase purchase sync error:', purError);
        return { success: false, error: purError.message };
      }

      if (purchase.items && purchase.items.length > 0) {
        const itemRows = purchase.items.map((item) => ({
          purchase_id: purchase.id,
          product_id: item.productId || null,
          product_code: item.productCode || '',
          product_name: item.productName || '',
          quantity: Number(item.quantity || 0),
          unit_cost: Number(item.unitCost || 0),
          discount: Number(item.discount || 0),
          discount_type: item.discountType || 'PERCENT',
          total: Number(item.total || 0)
        }));

        await client.from('busy_ufo_purchase_items').delete().eq('purchase_id', purchase.id);
        await client.from('busy_ufo_purchase_items').insert(itemRows);
      }

      return { success: true };
    } catch (e: any) {
      console.warn('Supabase purchase sync exception:', e);
      return { success: false, error: e?.message };
    }
  },

  // --- BULK FETCH FROM SUPABASE ---
  async fetchAllRemoteProducts(): Promise<Product[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('busy_ufo_products')
        .select('*')
        .order('name');

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        companyId: row.company_id || 'comp-1',
        code: row.code,
        name: row.name,
        category: row.category || 'General',
        unit: row.unit || 'Pcs',
        costPrice: Number(row.cost_price || 0),
        sellingPrice: Number(row.selling_price || 0),
        currentStock: Number(row.current_stock || 0),
        reorderLevel: Number(row.reorder_level || 10),
        createdAt: row.created_at || new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error fetching products from Supabase:', e);
      return null;
    }
  },

  async fetchAllRemoteCustomers(): Promise<Customer[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('busy_ufo_customers')
        .select('*')
        .order('name');

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        companyId: row.company_id || 'comp-1',
        code: row.code,
        name: row.name,
        phone: row.phone || '',
        email: row.email || '',
        address: row.address || '',
        city: row.city || 'Colombo',
        openingBalance: Number(row.opening_balance || 0),
        outstandingBalance: Number(row.current_balance || 0),
        createdAt: row.created_at || new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error fetching customers from Supabase:', e);
      return null;
    }
  },

  async fetchAllRemoteSuppliers(): Promise<Supplier[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('busy_ufo_suppliers')
        .select('*')
        .order('name');

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        companyId: row.company_id || 'comp-1',
        code: row.code,
        name: row.name,
        phone: row.phone || '',
        email: row.email || '',
        address: row.address || '',
        city: row.city || 'Colombo',
        openingBalance: Number(row.opening_balance || 0),
        payableBalance: Number(row.current_balance || 0),
        createdAt: row.created_at || new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error fetching suppliers from Supabase:', e);
      return null;
    }
  }
};
