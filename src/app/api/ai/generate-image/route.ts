import { NextRequest, NextResponse } from "next/server";

// Image generation using OpenAI DALL-E or other providers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style = "cinematic", size = "1024x1024" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return placeholder for demo
      return NextResponse.json({
        imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop`,
        isPlaceholder: true,
        message: "Using placeholder image. Configure OPENAI_API_KEY for real generation.",
        creditCost: 0,
      });
    }

    // Call OpenAI DALL-E API
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `${style} style: ${prompt}`,
        n: 1,
        size,
        quality: "standard",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("DALL-E API error:", error);
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;

    return NextResponse.json({
      imageUrl,
      isPlaceholder: false,
      creditCost: 5, // DALL-E 3 costs ~5 credits
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
