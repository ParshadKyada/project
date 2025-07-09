import { LoginRequest, LoginResponse } from '../types/auth';

class AuthService {
  private baseUrl = 'https://localhost:7267/api/Auth';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (res.status === 401) throw new Error('Invalid credentials');
    if (!res.ok) throw new Error('Failed to login');
    return res.json();
  }
}

export const authService = new AuthService();