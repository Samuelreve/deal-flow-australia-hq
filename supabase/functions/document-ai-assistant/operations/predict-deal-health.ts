
import OpenAI from "https://esm.sh/openai@4.0.0";

export async function handlePredictDealHealth(
  dealId: string,
  userId: string,
  openai: OpenAI
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a deal health prediction expert. Analyze deal patterns and predict health scores." 
        },
        { 
          role: "user", 
          content: "Analyze this deal and predict its health based on typical deal patterns and risk factors." 
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const prediction = response.choices[0]?.message?.content || "Sorry, I couldn't generate a prediction.";

    return {
      prediction,
      dealId,
      userId,
      disclaimer: "This AI-generated prediction is for informational purposes only."
    };
  } catch (error) {
    console.error('Error in predict deal health operation:', error);
    throw new Error('Failed to predict deal health');
  }
}
