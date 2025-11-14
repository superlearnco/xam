import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cn,
  formatCurrency,
  formatRelativeTime,
  formatDate,
  formatDateTime,
  calculatePercentage,
  calculateGrade,
  truncate,
  getInitials,
  formatFileSize,
  debounce,
  sleep,
  isValidEmail,
  generateId,
  copyToClipboard,
} from "./utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toContain("px-4");
  });
});

describe("formatCurrency", () => {
  it("should format positive numbers as USD", () => {
    expect(formatCurrency(10)).toBe("$10.00");
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("should format negative numbers", () => {
    expect(formatCurrency(-10.5)).toBe("-$10.50");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should round to 2 decimal places", () => {
    expect(formatCurrency(10.999)).toBe("$11.00");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 'just now' for recent times", () => {
    const date = new Date("2024-01-01T11:59:30Z");
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it("should return minutes ago", () => {
    const date = new Date("2024-01-01T11:30:00Z");
    expect(formatRelativeTime(date)).toBe("30 minutes ago");
  });

  it("should return hours ago", () => {
    const date = new Date("2024-01-01T09:00:00Z");
    expect(formatRelativeTime(date)).toBe("3 hours ago");
  });

  it("should return days ago", () => {
    const date = new Date("2023-12-30T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("2 days ago");
  });

  it("should return months ago", () => {
    const date = new Date("2023-11-01T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("2 months ago");
  });

  it("should return years ago", () => {
    const date = new Date("2022-01-01T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("2 years ago");
  });

  it("should handle timestamp numbers", () => {
    const timestamp = new Date("2024-01-01T11:30:00Z").getTime();
    expect(formatRelativeTime(timestamp)).toBe("30 minutes ago");
  });

  it("should use singular for 1 unit", () => {
    const date = new Date("2024-01-01T11:59:00Z");
    expect(formatRelativeTime(date)).toBe("1 minute ago");
  });
});

describe("formatDate", () => {
  it("should format date objects", () => {
    const date = new Date("2024-01-15");
    expect(formatDate(date)).toContain("January");
    expect(formatDate(date)).toContain("15");
    expect(formatDate(date)).toContain("2024");
  });

  it("should format timestamps", () => {
    const timestamp = new Date("2024-01-15").getTime();
    const result = formatDate(timestamp);
    expect(result).toContain("January");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });
});

describe("formatDateTime", () => {
  it("should format date with time", () => {
    const date = new Date("2024-01-15T14:30:00");
    const result = formatDateTime(date);
    expect(result).toContain("January");
    expect(result).toContain("15");
    expect(result).toContain("2024");
    expect(result).toMatch(/2:30|14:30/); // Could be 12h or 24h format
  });

  it("should format timestamps with time", () => {
    const timestamp = new Date("2024-01-15T14:30:00").getTime();
    const result = formatDateTime(timestamp);
    expect(result).toContain("January");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });
});

describe("calculatePercentage", () => {
  it("should calculate percentage correctly", () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(25, 50)).toBe(50);
    expect(calculatePercentage(3, 4)).toBe(75);
  });

  it("should round to nearest integer", () => {
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(2, 3)).toBe(67);
  });

  it("should return 0 when total is 0", () => {
    expect(calculatePercentage(10, 0)).toBe(0);
  });

  it("should handle 0 value", () => {
    expect(calculatePercentage(0, 100)).toBe(0);
  });

  it("should handle decimals", () => {
    expect(calculatePercentage(7.5, 10)).toBe(75);
  });
});

describe("calculateGrade", () => {
  it("should return A for 90% and above", () => {
    expect(calculateGrade(90)).toBe("A");
    expect(calculateGrade(95)).toBe("A");
    expect(calculateGrade(100)).toBe("A");
  });

  it("should return B for 80-89%", () => {
    expect(calculateGrade(80)).toBe("B");
    expect(calculateGrade(85)).toBe("B");
    expect(calculateGrade(89)).toBe("B");
  });

  it("should return C for 70-79%", () => {
    expect(calculateGrade(70)).toBe("C");
    expect(calculateGrade(75)).toBe("C");
    expect(calculateGrade(79)).toBe("C");
  });

  it("should return D for 60-69%", () => {
    expect(calculateGrade(60)).toBe("D");
    expect(calculateGrade(65)).toBe("D");
    expect(calculateGrade(69)).toBe("D");
  });

  it("should return F for below 60%", () => {
    expect(calculateGrade(59)).toBe("F");
    expect(calculateGrade(30)).toBe("F");
    expect(calculateGrade(0)).toBe("F");
  });
});

describe("truncate", () => {
  it("should truncate text longer than length", () => {
    expect(truncate("Hello World", 8)).toBe("Hello Wo...");
  });

  it("should return original text if shorter than or equal to length", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("should handle empty strings", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("should handle length of 0", () => {
    expect(truncate("Hello", 0)).toBe("...");
  });
});

describe("getInitials", () => {
  it("should return initials from first and last name", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Jane Smith")).toBe("JS");
  });

  it("should return single initial for single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("should handle multiple middle names", () => {
    expect(getInitials("John Paul Jones")).toBe("JJ");
  });

  it("should handle empty string", () => {
    expect(getInitials("")).toBe("");
  });

  it("should trim whitespace", () => {
    expect(getInitials("  John   Doe  ")).toBe("JD");
  });

  it("should convert to uppercase", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("should handle extra spaces between names", () => {
    expect(getInitials("John    Doe")).toBe("JD");
  });
});

describe("formatFileSize", () => {
  it("should format bytes", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
    expect(formatFileSize(500)).toBe("500 Bytes");
    expect(formatFileSize(1023)).toBe("1023 Bytes");
  });

  it("should format kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(10240)).toBe("10 KB");
  });

  it("should format megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(5242880)).toBe("5 MB");
  });

  it("should format gigabytes", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB");
    expect(formatFileSize(2147483648)).toBe("2 GB");
  });

  it("should round to 2 decimal places", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should delay function execution", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 1000);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("should cancel previous calls", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 1000);

    debouncedFn();
    vi.advanceTimersByTime(500);
    debouncedFn();
    vi.advanceTimersByTime(500);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("should pass arguments correctly", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 1000);

    debouncedFn("arg1", "arg2");
    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should use the latest arguments", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 1000);

    debouncedFn("first");
    vi.advanceTimersByTime(500);
    debouncedFn("second");
    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("second");
  });
});

describe("sleep", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should resolve after specified time", async () => {
    const promise = sleep(1000);
    let resolved = false;

    promise.then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    vi.advanceTimersByTime(1000);
    await promise;

    expect(resolved).toBe(true);
  });

  it("should handle zero delay", async () => {
    const promise = sleep(0);
    vi.advanceTimersByTime(0);
    await promise;
    expect(true).toBe(true);
  });
});

describe("isValidEmail", () => {
  it("should validate correct email addresses", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name@example.com")).toBe(true);
    expect(isValidEmail("user+tag@example.co.uk")).toBe(true);
  });

  it("should reject invalid email addresses", () => {
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("invalid@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("test@.com")).toBe(false);
    expect(isValidEmail("test @example.com")).toBe(false);
  });

  it("should reject empty strings", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("generateId", () => {
  it("should generate ID of default length", () => {
    const id = generateId();
    expect(id).toHaveLength(8);
  });

  it("should generate ID of specified length", () => {
    expect(generateId(4)).toHaveLength(4);
    expect(generateId(16)).toHaveLength(16);
    expect(generateId(32)).toHaveLength(32);
  });

  it("should generate alphanumeric IDs", () => {
    const id = generateId(100);
    expect(id).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("should generate different IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe("copyToClipboard", () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  it("should copy text to clipboard successfully", async () => {
    (navigator.clipboard.writeText as any).mockResolvedValue(undefined);

    const result = await copyToClipboard("test text");
    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test text");
  });

  it("should handle clipboard errors", async () => {
    (navigator.clipboard.writeText as any).mockRejectedValue(
      new Error("Permission denied")
    );

    const result = await copyToClipboard("test text");
    expect(result).toBe(false);
  });
});

