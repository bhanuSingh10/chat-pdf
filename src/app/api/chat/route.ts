export async function POST(req: Request) {
  try {
    const { messages } = await req.json();  // Receive messages from the frontend

    const response = await fetch("http://127.0.0.1:11435/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt: messages.map((m: any) => m.content).join("\n"),  // Combine all messages into one prompt
      }),
    });

    // Read the raw response as text to inspect the content
    const rawResponse = await response.text();
    console.log("Raw response from Ollama:", rawResponse);  // Log raw response

    // Split the raw response if it contains multiple JSON objects
    const parts = rawResponse.split("\n").filter(Boolean);  // Split by newline and filter empty strings
    let finalResponse = "";

    // Process each part individually
    for (const part of parts) {
      try {
        const data = JSON.parse(part);
        if (data.response) {
          finalResponse += data.response;  // Concatenate the responses
        }
      } catch (e) {
        console.error("Error parsing individual response:", e);
      }
    }

    // If no valid response content, return an error
    if (!finalResponse) {
      console.error("No valid response content.");
      return new Response(JSON.stringify({ error: "No response from AI" }), { status: 500 });
    }

    // Return the final response containing the concatenated text
    return new Response(JSON.stringify({ text: finalResponse }), { status: 200 });
    
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
