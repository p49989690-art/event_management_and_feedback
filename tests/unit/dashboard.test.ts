
import { getDashboardData } from "@/app/(dashboard)/dashboard/page";
import { createClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock child components to avoid render issues if we were testing the page component
jest.mock("@/components/dashboard/stats-card", () => ({ StatsCard: () => "StatsCard" }));
jest.mock("@/components/dashboard/analytics-chart", () => ({ AnalyticsChart: () => "AnalyticsChart" }));
jest.mock("@/components/dashboard/recent-feedback", () => ({ RecentFeedback: () => "RecentFeedback" }));
jest.mock("@/components/dashboard/event-overview", () => ({ EventOverview: () => "EventOverview" }));

describe("getDashboardData", () => {
    let mockSupabase: any;
    let mockAuth: any;
    let mockFrom: any;
    let mockRpc: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockAuth = {
            getUser: jest.fn(),
        };
        
        mockFrom = jest.fn().mockImplementation((table) => {
            const baseMock: any = {
                select: jest.fn(),
                eq: jest.fn(),
                in: jest.fn(),
                order: jest.fn(),
                limit: jest.fn(),
            };
            
            // Chain methods return baseMock for fluent API
            baseMock.eq.mockReturnValue(baseMock);
            baseMock.in.mockReturnValue(baseMock);
            baseMock.order.mockReturnValue(baseMock);
            
            if (table === "events") {
                 baseMock.select.mockImplementation((columns: string, options?: any) => {
                    if (columns === "id") {
                         // First call: get event IDs - returns promise directly after .eq()
                         const chain = {
                             eq: jest.fn().mockResolvedValue({ data: [{ id: "evt-1" }] })
                         };
                         return chain;
                    }
                    if (options?.count === "exact") {
                        // Second call: count events - returns promise after .eq()
                        const chain = {
                            eq: jest.fn().mockResolvedValue({ count: 10, data: [] })
                        };
                        return chain;
                    }
                    return Promise.resolve({ data: [] });
                });
            } else if (table === "feedback_analytics") {
                baseMock.select.mockReturnValue(baseMock);
                baseMock.limit.mockResolvedValue({ data: [{ event_id: "evt-1", avg_rating: 4.5 }] });
            } else if (table === "feedback") {
                 baseMock.select.mockReturnValue(baseMock);
                 baseMock.limit.mockResolvedValue({ data: [] });
            }
            
            return baseMock;
        });

        mockRpc = jest.fn();

        mockSupabase = {
            auth: mockAuth,
            from: mockFrom,
            rpc: mockRpc
        };
        
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    });

    it("should return correct aggregated stats for authenticated user", async () => {
        mockAuth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
        
        // Mock RPC for unique feedback count
        mockRpc.mockResolvedValue({ data: 42, error: null });

        const data = await getDashboardData();
        
        // Assertions
        expect(mockAuth.getUser).toHaveBeenCalled();
        
        // Verify RPC call
        expect(mockRpc).toHaveBeenCalledWith("get_unique_feedback_count", { uid: "user-123" });
        
        // Verify results
        expect(data.totalEvents).toBe(10);
        expect(data.totalFeedback).toBe(42); // Matches RPC return
        expect(data.topEvents).toHaveLength(1); // One event from analytics
    });

    it("should return empty stats if unauthenticated", async () => {
        mockAuth.getUser.mockResolvedValue({ data: { user: null } });
        
        const data = await getDashboardData();
        
        expect(data.totalEvents).toBe(0);
        expect(data.totalFeedback).toBe(0);
    });
});
