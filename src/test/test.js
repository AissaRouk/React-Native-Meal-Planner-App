const API_KEY = "AIzaSyCvN9HkAAnkAmETLo5U8SujqsY8pquVovc";

async function categorizeItems(items) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: `You are a grocery shopping assistant.
Given a list of shopping items, group them into categories.
Return ONLY a raw JSON object. No markdown, no explanation, no code fences.
Use these categories when possible: Produce, Dairy, Meat, Bakery, Frozen, Drinks, Snacks, Personal Care, Cleaning, Other.
Example output: {"Produce":["apples","bananas"],"Dairy":["milk","cheese"]}`,
              },
            ],
          },
          contents: [
            {
              parts: [{ text: items.join(", ") }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // 👇 This will show you exactly what came back from the API
    console.log("Full API response:", JSON.stringify(data, null, 2));

    // Guard: check for API errors
    if (data.error) {
      throw new Error(`API Error: ${data.error.message}`);
    }

    // Guard: check candidates exist
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No candidates returned from API");
    }

    let text = data.candidates[0].content.parts[0].text;

    // Guard: strip markdown code fences if the AI added them anyway
    text = text.replace(/```json|```/g, "").trim();

    console.log("Raw text from AI:", text);

    // Parse JSON
    const parsed = JSON.parse(text);
    return parsed;

  } catch (err) {
    console.error("Something went wrong:", err.message);
    // Fallback: return everything as "Other" so the app never crashes
    return { Other: items };
  }
}

// --- Run the test ---
const testItems = ["milk", "beer", "shampoo", "apples", "chicken", "bleach"];

console.log("Sending items:", testItems);
console.log("---");

categorizeItems(testItems).then((result) => {
  console.log("---");
  console.log("Final categorized result:");
  console.log(JSON.stringify(result, null, 2));
});