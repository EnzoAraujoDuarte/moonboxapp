// Mock client para desenvolvimento sem Supabase
// Simula as operações básicas do Supabase em memória

class DevMockClient {
  constructor() {
    this.data = {
      shops: new Map(),
      wishlist_items: new Map(),
      shopify_sessions: new Map(),
    };
    this.nextId = 1;
  }

  from(table) {
    return new MockQueryBuilder(this.data[table] || new Map(), table, this);
  }

  generateId() {
    return `mock_${this.nextId++}_${Date.now()}`;
  }
}

class MockQueryBuilder {
  constructor(dataMap, table, client) {
    this.dataMap = dataMap;
    this.table = table;
    this.client = client;
    this.filters = [];
    this.selectFields = '*';
    this.orderBy = null;
    this.limitCount = null;
    this.single = false;
    this.maybeSingle = false;
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(field, value) {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  order(field, options = {}) {
    this.orderBy = { field, ascending: options.ascending !== false };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.single = true;
    return this;
  }

  maybeSingle() {
    this.maybeSingle = true;
    return this;
  }

  async insert(payload) {
    const id = payload.id || this.client.generateId();
    const item = { 
      ...payload, 
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.dataMap.set(id, item);
    
    if (this.selectFields !== '*') {
      return { data: item, error: null };
    }
    return { data: item, error: null };
  }

  async upsert(payload, options = {}) {
    const conflictField = options.onConflict;
    let existingId = null;
    
    if (conflictField && payload[conflictField]) {
      for (const [id, item] of this.dataMap.entries()) {
        if (item[conflictField] === payload[conflictField]) {
          existingId = id;
          break;
        }
      }
    }

    const id = existingId || payload.id || this.client.generateId();
    const item = {
      ...payload,
      id,
      created_at: existingId ? this.dataMap.get(existingId).created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.dataMap.set(id, item);
    return { data: item, error: null };
  }

  async delete() {
    const items = this._applyFilters();
    for (const item of items) {
      this.dataMap.delete(item.id);
    }
    return { data: null, error: null };
  }

  async then(resolve) {
    try {
      const items = this._applyFilters();
      
      if (this.single) {
        if (items.length === 0) {
          return resolve({ data: null, error: { message: 'No rows found' } });
        }
        if (items.length > 1) {
          return resolve({ data: null, error: { message: 'Multiple rows found' } });
        }
        return resolve({ data: items[0], error: null });
      }
      
      if (this.maybeSingle) {
        return resolve({ data: items[0] || null, error: null });
      }
      
      return resolve({ data: items, error: null });
    } catch (error) {
      return resolve({ data: null, error: { message: error.message } });
    }
  }

  _applyFilters() {
    let items = Array.from(this.dataMap.values());
    
    // Apply filters
    for (const filter of this.filters) {
      if (filter.type === 'eq') {
        items = items.filter(item => String(item[filter.field]) === String(filter.value));
      }
    }
    
    // Apply ordering
    if (this.orderBy) {
      items.sort((a, b) => {
        const aVal = a[this.orderBy.field];
        const bVal = b[this.orderBy.field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this.orderBy.ascending ? comparison : -comparison;
      });
    }
    
    // Apply limit
    if (this.limitCount) {
      items = items.slice(0, this.limitCount);
    }
    
    return items;
  }
}

// Simula algumas lojas e itens para demonstração
const mockClient = new DevMockClient();

// Adiciona uma loja demo
mockClient.data.shops.set('demo_shop', {
  id: 'demo_shop',
  shop_domain: 'demo.myshopify.com',
  access_token: 'demo_token',
  is_active: true,
  created_at: new Date().toISOString(),
});

// Adiciona alguns itens de exemplo
mockClient.data.wishlist_items.set('item1', {
  id: 'item1',
  customer_id: null,
  session_id: 'demo_session',
  shop_domain: 'demo.myshopify.com',
  product_id: '12345',
  variant_id: '67890',
  product_title: 'Produto Demo',
  product_price: 'R$ 99,90',
  product_image_url: 'https://via.placeholder.com/150',
  created_at: new Date().toISOString(),
});

export { mockClient as supabase };