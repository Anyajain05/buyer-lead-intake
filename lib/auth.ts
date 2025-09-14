// Mock authentication system - can be replaced with real auth later
export interface User {
  id: string
  email: string
  name: string
}

// Mock current user - in real app this would come from session/JWT
let currentUser: User | null = {
  id: "user_123",
  email: "agent@realestate.com",
  name: "Real Estate Agent",
}

export const auth = {
  getCurrentUser: async (): Promise<User | null> => {
    return currentUser
  },

  signIn: async (email: string, password: string): Promise<User | null> => {
    // Mock sign in - always succeeds for demo
    currentUser = {
      id: "user_123",
      email: email,
      name: "Real Estate Agent",
    }
    return currentUser
  },

  signOut: async (): Promise<void> => {
    currentUser = null
  },

  requireAuth: async (): Promise<User> => {
    const user = await auth.getCurrentUser()
    if (!user) {
      throw new Error("Authentication required")
    }
    return user
  },
}
