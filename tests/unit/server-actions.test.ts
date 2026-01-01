
import { submitFeedbackBatch, getFeedbackByEvent } from "@/actions/feedback.actions";
import { getEvents } from "@/actions/events.actions";
import { createClient } from "@/lib/supabase/server";

// Mock Next.js utilities
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock Supabase
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("Server Actions Security & Logic", () => {
  let mockSupabase: any;
  let mockAuth: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup generic mock chain
    const mockReturnThis = jest.fn().mockReturnThis();

    mockAuth = {
        getUser: jest.fn()
    };

    mockSupabase = {
      auth: mockAuth,
      from: jest.fn().mockImplementation(() => ({
          select: mockReturnThis,
          insert: jest.fn().mockReturnValue({ select: mockReturnThis }),
          update: mockReturnThis,
          delete: mockReturnThis,
          eq: mockReturnThis,
          in: mockReturnThis,
          order: mockReturnThis,
          limit: mockReturnThis,
          single: jest.fn().mockResolvedValue({ data: null, error: null })
      })),
      rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("Authentication Redirects (Implicit)", () => {
       // Since redirects happen in middleware, unit testing actions primarily tests
       // that they enforce the auth check if they are called directly.
  });

  describe("getEvents (Data Isolation)", () => {
    it("should throw error if user is not authenticated", async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: null } });
      await expect(getEvents()).rejects.toThrow("Unauthorized");
    });

    it("should filter events by created_by if user is authenticated", async () => {
      const mockUser = { id: "user-123" };
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });

      // Mock chain for success
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });

      mockSupabase.from.mockImplementation(() => ({
          select: mockSelect,
          eq: mockEq,
          order: mockOrder
      }));

      await getEvents();
      
      expect(mockSupabase.from).toHaveBeenCalledWith("events");
      // Verify isolation filter
      expect(mockEq).toHaveBeenCalledWith("created_by", "user-123");
    });
  });

  describe("getFeedbackByEvent (Ownership Check)", () => {
      it("should throw error if user does not own the event", async () => {
          const mockUser = { id: "user-123" };
          mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });
          
          // Mock event lookup returning null (not found/not owned)
          mockSupabase.from.mockImplementation((table: string) => {
              if (table === 'events') {
                  return {
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockResolvedValue({ data: null, error: null })
                  }
              }
              return mockSupabase;
          });

          await expect(getFeedbackByEvent("event-999")).rejects.toThrow("Unauthorized or Event not found");
      });

      it("should return feedback if user owns the event", async () => {
        const mockUser = { id: "user-123" };
        mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });
        
        // Mock event lookup returning event
        // Mock feedback lookup returning data
        const mockEventsChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { id: "event-999" }, error: null })
        };

        const mockFeedbackChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null })
        };

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'events') return mockEventsChain;
            if (table === 'feedback') return mockFeedbackChain;
            return {};
        });

        const result = await getFeedbackByEvent("event-999");
        expect(result).toHaveLength(1);
        expect(mockEventsChain.eq).toHaveBeenCalledWith("id", "event-999");
        expect(mockEventsChain.eq).toHaveBeenCalledWith("created_by", "user-123");
    });
  });

  describe("submitFeedbackBatch (Guest Logic)", () => {
      it("should allow guest submission (no user, not anonymous)", async () => {
          mockAuth.getUser.mockResolvedValue({ data: { user: null } });

          // Mock insert returning valid data
          const mockInsert = jest.fn().mockReturnThis();
          const mockSelect = jest.fn().mockResolvedValue({ data: [], error: null });

          mockSupabase.from.mockImplementation(() => ({
              insert: mockInsert,
              select: mockSelect
          }));
          mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

          const commonData = { event_id: "evt-1", name: "Guest", is_anonymous: false };
          const items = [{ category: "Content", rating: 5, comment: "Good" }];

          await expect(submitFeedbackBatch(commonData, items)).resolves.not.toThrow();
          
          // Verify insert payload has user_id: null and valid submission_id
          const insertCall = mockInsert.mock.calls[0][0]; 
          expect(insertCall[0].user_id).toBeNull();
          expect(insertCall[0].is_anonymous).toBe(false);
          
          // Verify submission_id is generated and consistent
          expect(insertCall[0].submission_id).toBeDefined();
          expect(insertCall[0].submission_id).toBe(insertCall[insertCall.length - 1].submission_id);
      });
  });
});
