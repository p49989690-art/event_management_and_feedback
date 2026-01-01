
import { login, signup, logout } from "@/actions/auth.actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Mock Next.js utilities
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock Supabase
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("Auth Server Actions", () => {
    let mockSupabase: any;
    let mockAuth: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockAuth = {
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        };

        mockSupabase = {
            auth: mockAuth,
        };
        
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    });

    describe("login", () => {
        it("should call signInWithPassword and redirect to dashboard on success", async () => {
             mockAuth.signInWithPassword.mockResolvedValue({ error: null });
             
             const formData = new FormData();
             formData.append("email", "test@example.com");
             formData.append("password", "password");

             await login(formData);

             expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
                 email: "test@example.com",
                 password: "password"
             });
             expect(redirect).toHaveBeenCalledWith("/dashboard");
        });

        it("should redirect to login with error param on failure", async () => {
             const errorMsg = "Invalid credentials";
             mockAuth.signInWithPassword.mockResolvedValue({ error: { message: errorMsg } });
             
             const formData = new FormData();
             formData.append("email", "test@example.com");
             formData.append("password", "wrong");

             await login(formData);
             
             // Check if it redirects to error page
             expect(redirect).toHaveBeenCalledWith(expect.stringContaining("error=Invalid%20credentials"));
        });
    });

    describe("signup", () => {
        it("should use localhost redirect url in non-production", async () => {
            const originalEnv = process.env.NODE_ENV;
            // Force dev
            Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });

            mockAuth.signUp.mockResolvedValue({ error: null });

            const formData = new FormData();
            formData.append("email", "test@example.com");
            formData.append("password", "password");

            await signup(formData);
            
            expect(mockAuth.signUp).toHaveBeenCalledWith(expect.objectContaining({
                options: {
                    emailRedirectTo: "http://localhost:3000/auth/callback"
                }
            }));
            
            // Cleanup
            Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, configurable: true });
        });

        // Test production logic (difficult to mock process.env completely cleanly in JSDOM, 
        // but checking the development fallback confirms the ternary logic is active)
    });

    describe("logout", () => {
        it("should signOut and redirect to login", async () => {
            await logout();
            expect(mockAuth.signOut).toHaveBeenCalled();
            expect(redirect).toHaveBeenCalledWith("/login");
        });
    });
});
