
import { render, screen } from "@testing-library/react";
import { FeedbackList } from "@/components/feedback/feedback-list";
import "@testing-library/jest-dom";

// Mock child components to simplify visual testing
// We only care about the grouping logic which creates the Cards
jest.mock("@/components/ui/card", () => ({
    Card: ({ children }: any) => <div data-testid="feedback-group-card">{children}</div>,
    CardHeader: ({ children }: any) => <div className="card-header">{children}</div>,
    CardTitle: ({ children }: any) => <div className="card-title">{children}</div>,
    CardDescription: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/badge", () => ({
    Badge: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ui/separator", () => ({
    Separator: () => <hr />,
}));

describe("FeedbackList Grouping Logic", () => {
    it("should group feedback items from the same submission (same user & time) into one card", () => {
        const mockTime = new Date().toISOString();

        const mockFeedbackData = [
            // Submission 1 (User A) - 2 items
            {
                id: 1,
                event_id: "evt-1",
                created_at: mockTime,
                user_id: "user-A",
                profiles: { full_name: "User A" },
                rating: 5,
                category: "Venue",
                comment: "Great venue",
                sentiment: "positive"
            },
            {
                id: 2,
                event_id: "evt-1",
                created_at: mockTime, // Same time
                user_id: "user-A",    // Same user
                profiles: { full_name: "User A" },
                rating: 5,
                category: "Content",
                comment: "Great content",
                sentiment: "positive"
            },
            // Submission 2 (User B) - 1 item
            {
                id: 3,
                event_id: "evt-1",
                created_at: new Date(Date.now() - 10000).toISOString(), // Different time
                user_id: "user-B",
                profiles: { full_name: "User B" },
                rating: 3,
                category: "General",
                comment: "Okay",
                sentiment: "neutral"
            }
        ];

        render(<FeedbackList feedback={mockFeedbackData} />);

        // We passed 3 items, but only 2 submissions.
        // Expect 2 groupings (Cards)
        const cards = screen.getAllByTestId("feedback-group-card");
        expect(cards).toHaveLength(2);

        // Verify User A is present
        expect(screen.getByText("User A")).toBeInTheDocument();
        // Verify User B is present
        expect(screen.getByText("User B")).toBeInTheDocument();
    });

    it("should handle guest submissions correctly", () => {
        const mockTime = new Date().toISOString();
        const mockFeedbackData = [
            {
                id: 1,
                event_id: "evt-1",
                created_at: mockTime,
                user_id: null,
                name: "Guest User",
                is_anonymous: false,
                rating: 4,
                category: "General",
                sentiment: "positive"
            }
        ];

        render(<FeedbackList feedback={mockFeedbackData} />);

        expect(screen.getByText("Guest User")).toBeInTheDocument();
    });
});
