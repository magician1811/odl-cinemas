import { User, AuthUser, UserRole } from '../types';

const USERS_KEY = 'odl-cinema-users';
const CURRENT_USER_KEY = 'odl-cinema-current-user';

// Simple token generation (in real app, this would be done by backend)
const generateToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const registerUser = (email: string, password: string, name: string, phone?: string): Promise<AuthUser> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Registering user:', { email, name, phone });
      
      // Get existing users
      const usersJson = localStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      console.log('Existing users:', users);

      // Check if user already exists
      const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        console.log('User already exists');
        reject(new Error('User with this email already exists'));
        return;
      }

      // Create new user
      // Check if this is the admin user
      const isAdmin = email.toLowerCase() === 'admin@gmail.com' && password === 'admin123';
      
      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        name,
        phone,
        role: isAdmin ? UserRole.ADMIN : UserRole.USER,
        createdAt: new Date().toISOString()
      };

      // Add password to users array (in real app, password would be hashed)
      const userWithPassword = { ...newUser, password };
      users.push(userWithPassword as any);

      // Save users
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      console.log('Users saved to localStorage');

      // Create auth user
      const authUser: AuthUser = {
        user: newUser,
        token: generateToken()
      };

      // Save current user
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      console.log('Current user saved to localStorage');

      resolve(authUser);
    } catch (error) {
      console.error('Registration error:', error);
      reject(new Error('Failed to register user'));
    }
  });
};

export const loginUser = (email: string, password: string): Promise<AuthUser> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Logging in user:', { email });
      
      // Get existing users
      const usersJson = localStorage.getItem(USERS_KEY);
      const users: any[] = usersJson ? JSON.parse(usersJson) : [];
      console.log('Available users:', users);

      // Find user by email
      let user: any = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        // Auto-create default admin user if credentials match
        if (email.toLowerCase() === 'admin@gmail.com' && password === 'admin123') {
          const defaultAdmin: any = {
            id: Date.now().toString(),
            email: 'admin@gmail.com',
            password: 'admin123',
            name: 'Administrator',
            role: UserRole.ADMIN,
            createdAt: new Date().toISOString()
          };
          users.push(defaultAdmin);
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
          console.log('Default admin user created');
          user = defaultAdmin;
        } else {
          console.log('User not found');
          reject(new Error('User not found'));
          return;
        }
      }

      console.log('Found user:', user);

      // Check password (in real app, this would be hashed comparison)
      if (user.password !== password) {
        console.log('Invalid password');
        reject(new Error('Invalid password'));
        return;
      }

      // Determine role (ensure admin credentials are respected even if not stored with role)
      let role: UserRole;
      if ((user.role && (user.role === UserRole.ADMIN || user.role === UserRole.USER))) {
        role = user.role;
      } else {
        // Fallback based on credentials
        role = (user.email.toLowerCase() === 'admin@gmail.com' && password === 'admin123') ? UserRole.ADMIN : UserRole.USER;
      }

      // Create auth user with role
      const authUser: AuthUser = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          createdAt: user.createdAt,
          role
        },
        token: generateToken()
      };

      // Save current user
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      console.log('Login successful, user saved to localStorage');

      resolve(authUser);
    } catch (error) {
      console.error('Login error:', error);
      reject(new Error('Failed to login'));
    }
  });
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
