import { NextResponse } from "next/server";

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function errorHandler(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.details,
      },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: "Unknown error occurred",
    },
    { status: 500 }
  );
}

export function rateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>();

  return (req: Request) => {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    
    // Clean up old requests
    const windowStart = now - windowMs;
    const windowRequests = requests.get(ip) || [];
    const validRequests = windowRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      throw new APIError(429, "Too many requests, please try again later");
    }

    // Add current request
    validRequests.push(now);
    requests.set(ip, validRequests);

    return null; // No error
  };
}

export function withErrorHandling(handler: (req: Request) => Promise<NextResponse>) {
  return async (req: Request) => {
    try {
      // Apply rate limiting
      const rateLimitError = rateLimiter(100, 60000)(req); // 100 requests per minute
      if (rateLimitError) {
        return rateLimitError;
      }

      // Execute handler
      const response = await handler(req);
      return response;
    } catch (error) {
      return errorHandler(error);
    }
  };
}