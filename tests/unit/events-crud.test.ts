
import { createEvent, updateEvent, deleteEvent } from "@/actions/events.actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Mock Next.js
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

describe("Event CRUD Actions", () => {
  let mockSupabase: any;
  let mockAuth: any;
  let mockFrom: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockReturnThis = jest.fn().mockReturnThis();

    mockAuth = {
      getUser: jest.fn(),
    };

    mockFrom = jest.fn().mockImplementation(() => ({
      insert: jest.fn().mockReturnValue({ select: mockReturnThis, single: jest.fn().mockResolvedValue({ data: { id: "evt-1" }, error: null }) }),
      update: jest.fn().mockReturnValue({ eq: mockReturnThis, select: mockReturnThis, single: jest.fn().mockResolvedValue({ data: { id: "evt-1" }, error: null }) }),
      delete: mockReturnThis,
      select: mockReturnThis,
      eq: mockReturnThis,
      single: jest.fn().mockResolvedValue({ data: { id: "evt-1" }, error: null })
    }));

    mockSupabase = {
      auth: mockAuth,
      from: mockFrom
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("createEvent", () => {
    it("should create event with current user id", async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
      
      const eventData: any = {
        title: "New Event",
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        location: "Test",
        event_type: "conference",
        target_audience: "all"
      };

      await createEvent(eventData);

      const insertCall = mockFrom.mock.results[0].value.insert.mock.calls[0][0];
      expect(insertCall.created_by).toBe("user-123");
      expect(redirect).toHaveBeenCalledWith("/events/evt-1");
    });

    it("should throw error if unauthenticated", async () => {
        mockAuth.getUser.mockResolvedValue({ data: { user: null } });
        await expect(createEvent({} as any)).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateEvent", () => {
    it("should enforce ownership check query", async () => {
       mockAuth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
       
       const eventData: any = {
         title: "Updated Event",
         description: "Test",
         start_date: new Date().toISOString(),
         end_date: new Date().toISOString(),
         location: "Test Location",
         event_type: "conference",
         target_audience: "all",
         status: "draft"
       };
       const mockChain = mockFrom();
       mockFrom.mockReturnValue(mockChain); 
       
       await updateEvent("evt-1", eventData);

       const eqMock = mockChain.update().eq;
       
       // Verify we are filtering by user.id
       expect(eqMock).toHaveBeenCalledWith("created_by", "user-123");
    });
  });

  describe("deleteEvent", () => {
    it("should enforce ownership check query", async () => {
        mockAuth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
        
        const mockChain = mockFrom();
        mockFrom.mockReturnValue(mockChain);

        await deleteEvent("evt-1");
        
        const eqMock = mockChain.delete().eq;
        
        // Expect strict filter by created_by
        expect(eqMock).toHaveBeenCalledWith("created_by", "user-123");
    });
  });
});
