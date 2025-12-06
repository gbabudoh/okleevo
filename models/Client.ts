// Client/Customer model types
export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'lead';
  tags: string[];
  notes?: string;
  totalRevenue: number;
  lastContactDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: Client['address'];
  tags?: string[];
  notes?: string;
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: Client['address'];
  status?: Client['status'];
  tags?: string[];
  notes?: string;
}

export function isActiveClient(client: Client): boolean {
  return client.status === 'active';
}

export function getClientsByTag(clients: Client[], tag: string): Client[] {
  return clients.filter(client => client.tags.includes(tag));
}
