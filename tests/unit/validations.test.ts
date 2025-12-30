import { describe, it, expect } from "@jest/globals";
import { eventSchema } from "@/lib/validations/event.schema";
import { feedbackSchema } from "@/lib/validations/feedback.schema";

describe("Event Schema Validation", () => {
  it("should validate valid event data", () => {
    const validData = {
      title: "Test Event",
      event_type: "conference",
      location: "Test Location",
      start_date: "2025-01-01T10:00:00Z",
      end_date: "2025-01-01T17:00:00Z",
    };

    expect(() => eventSchema.parse(validData)).not.toThrow();
  });

  it("should reject event with end date before start date", () => {
    const invalidData = {
      title: "Test Event",
      event_type: "conference",
      location: "Test Location",
      start_date: "2025-01-01T17:00:00Z",
      end_date: "2025-01-01T10:00:00Z",
    };

    expect(() => eventSchema.parse(invalidData)).toThrow();
  });

  it("should reject event with short title", () => {
    const invalidData = {
      title: "Ab",
      event_type: "conference",
      location: "Test Location",
      start_date: "2025-01-01T10:00:00Z",
      end_date: "2025-01-01T17:00:00Z",
    };

    expect(() => eventSchema.parse(invalidData)).toThrow();
  });
});

describe("Feedback Schema Validation", () => {
  it("should validate valid feedback data", () => {
    const validData = {
      event_id: "123e4567-e89b-12d3-a456-426614174000",
      rating: 5,
      comment: "Great event, really enjoyed it!",
    };

    expect(() => feedbackSchema.parse(validData)).not.toThrow();
  });

  it("should reject feedback with invalid rating", () => {
    const invalidData = {
      event_id: "123e4567-e89b-12d3-a456-426614174000",
      rating: 6,
      comment: "Great event!",
    };

    expect(() => feedbackSchema.parse(invalidData)).toThrow();
  });
});
