// Client-side AI API helpers

export interface GenerationResult<T> {
  data?: T;
  error?: string;
  creditCost?: number;
  model?: string;
}

export async function generateSynopsis(params: {
  premise: string;
  genre?: string;
  format?: string;
  modelId?: string;
}): Promise<GenerationResult<{ synopsis: string }>> {
  try {
    const response = await fetch("/api/ai/generate-synopsis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || "Failed to generate synopsis" };
    }

    return {
      data: { synopsis: data.synopsis },
      creditCost: data.creditCost,
      model: data.model,
    };
  } catch (error) {
    return { error: "Network error" };
  }
}

export async function generateStructure(params: {
  synopsis: string;
  structure?: "hero" | "cat" | "harmon";
  modelId?: string;
}): Promise<GenerationResult<{ structureBeats: Record<string, string> }>> {
  try {
    const response = await fetch("/api/ai/generate-structure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || "Failed to generate structure" };
    }

    return {
      data: { structureBeats: data.structureBeats },
      creditCost: data.creditCost,
      model: data.model,
    };
  } catch (error) {
    return { error: "Network error" };
  }
}

export async function generateCharacter(params: {
  name: string;
  role: string;
  context?: string;
  modelId?: string;
}): Promise<GenerationResult<{ character: Record<string, unknown> }>> {
  try {
    const response = await fetch("/api/ai/generate-character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || "Failed to generate character" };
    }

    return {
      data: { character: data.character },
      creditCost: data.creditCost,
      model: data.model,
    };
  } catch (error) {
    return { error: "Network error" };
  }
}

export async function generateWantNeed(params: {
  synopsis: string;
  character?: string;
  modelId?: string;
}): Promise<GenerationResult<{ wantNeedMatrix: Record<string, unknown> }>> {
  try {
    const response = await fetch("/api/ai/generate-want-need", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || "Failed to generate Want/Need matrix" };
    }

    return {
      data: { wantNeedMatrix: data.wantNeedMatrix },
      creditCost: data.creditCost,
      model: data.model,
    };
  } catch (error) {
    return { error: "Network error" };
  }
}

export async function generateMoodboardPrompt(params: {
  beat: string;
  description: string;
  genre?: string;
  style?: string;
  modelId?: string;
}): Promise<GenerationResult<{ imagePrompt: string }>> {
  try {
    const response = await fetch("/api/ai/generate-moodboard-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || "Failed to generate moodboard prompt" };
    }

    return {
      data: { imagePrompt: data.imagePrompt },
      creditCost: data.creditCost,
      model: data.model,
    };
  } catch (error) {
    return { error: "Network error" };
  }
}

export async function generateImage(params: {
  prompt: string;
  style?: string;
  size?: string;
}): Promise<GenerationResult<{ imageUrl: string; isPlaceholder: boolean }>> {
  try {
    const response = await fetch("/api/ai/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || "Failed to generate image" };
    }

    return {
      data: { imageUrl: data.imageUrl, isPlaceholder: data.isPlaceholder },
      creditCost: data.creditCost,
    };
  } catch (error) {
    return { error: "Network error" };
  }
}
