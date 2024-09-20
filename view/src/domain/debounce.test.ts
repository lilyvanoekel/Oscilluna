import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should call the function after the specified delay", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200);
    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should not call the function multiple times if invoked within the delay", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200);
    debouncedFn();
    debouncedFn();
    debouncedFn();
    vi.advanceTimersByTime(100);
    expect(mockFn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should call the function with the correct arguments", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200);
    debouncedFn("arg1", "arg2");
    vi.advanceTimersByTime(200);
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should preserve the correct `this` context", () => {
    const context = { value: 42 };

    function mockFn(this: any) {
      expect(this).toEqual(context);
    }

    const debouncedFn = debounce(mockFn.bind(context), 200);
    debouncedFn();
    vi.advanceTimersByTime(200);
  });
});
