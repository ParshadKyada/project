import { User } from '../types/auth';
import { getAuthHeaders } from './auth';

const roleReverseMap: Record<number, User['role']> = {
  3: 'Admin',
  2: 'Staff',
  1: 'Customer',
};

class UserService {
  private baseUrl = 'https://localhost:7267/api/Users';

  async getUsers(): Promise<User[]> {
    const res = await fetch(this.baseUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    // Map role number to string for frontend
    return data.map((u: any) => ({ ...u, role: roleReverseMap[u.role] ?? 'Customer' }));
  }

  async createUser(user: Omit<User, 'id' | 'permissions'> & { password: string; role: number }): Promise<User> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to create user');
    const data = await res.json();
    // Map role number to string for frontend
    return { ...data, role: roleReverseMap[data.role] ?? 'Customer' };
  }

  async getCustomers(): Promise<User[]> {
    const res = await fetch(this.baseUrl + '?role=Customer', {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    const data = await res.json();
    return data.map((u: any) => ({ ...u, role: roleReverseMap[u.role] ?? 'Customer' }));
  }
}

export const userService = new UserService(); 