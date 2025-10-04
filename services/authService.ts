import { User, AuthUser, UserRole } from '../types';
import { getUsers, saveUsers } from './azureBlobService';

const USERS_KEY = 'odl-cinema-users';
const CURRENT_USER_KEY = 'odl-cinema-current-user';

// Simple token generation (in real app, this would be done by backend)
const generateToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const registerUser = async (email: string, password: string, name: string, phone?: string): Promise<AuthUser> => {
  try {
    // Fetch users from Azure Blob Storage only
    let users: any[] = await getUsers();

    // Check if user already exists
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const isAdmin = email.toLowerCase() === 'admin@gmail.com' && password === 'admin123';
    const newUser: User = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      name,
      phone,
      role: isAdmin ? UserRole.ADMIN : UserRole.USER,
      createdAt: new Date().toISOString()
    };
    const userWithPassword = { ...newUser, password };
    users.push(userWithPassword);
    await saveUsers(users);

    const authUser: AuthUser = { user: newUser, token: generateToken() };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    return authUser;
  } catch (err) {
    console.error('Registration error:', err);
    throw err;
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  try {
    let users: any[] = await getUsers();

    let user: any = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      if (email.toLowerCase() === 'admin@gmail.com' && password === 'admin123') {
        const defaultAdmin = {
          id: Date.now().toString(),
          email: 'admin@gmail.com',
          password: 'admin123',
          name: 'Administrator',
          role: UserRole.ADMIN,
          createdAt: new Date().toISOString()
        };
        users.push(defaultAdmin);
        await saveUsers(users);
        user = defaultAdmin;
      } else {
        throw new Error('User not found');
      }
    }

    if (user.password !== password) {
      throw new Error('Invalid password');
    }
    const role: UserRole = user.role ?? (user.email.toLowerCase() === 'admin@gmail.com' ? UserRole.ADMIN : UserRole.USER);

    const authUser: AuthUser = {
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, createdAt: user.createdAt, role },
      token: generateToken(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    return authUser;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): AuthUser | null => {
  try {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Failed to get current user', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
