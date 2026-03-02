import Groq from "groq-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize the Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Store conversation history per session
const conversationHistory = new Map();

export const userInformation = async (req, res) => {
    try {
        const { text, sessionId } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Please provide a question or text." });
        }

        // Get or initialize conversation history for this session
        if (!conversationHistory.has(sessionId)) {
            conversationHistory.set(sessionId, []);
        }
        const history = conversationHistory.get(sessionId);

        // --- IMPROVED SYSTEM PROMPT ---
        const systemPrompt = `
            You are a professional AI Portfolio Assistant for **Mudassir Ahmad**. 
            Your goal is to answer questions about Mudassir professionally, concisely, and accurately based *strictly* on the context provided below.

            --- 
            **MUDASSIR'S DATA:**
            - **Name:** Mudassir Ahmad
            - **Education:** Islamia College University Peshawar
            - **Role:** MERN Stack Developer
            - **Location:** Dalazak Road, Peshawar
            - **Phone:** 03215837843
            - **Email:** ma6386731@gmail.com
            
            **Social Links if anyone can ask about the social link so provide the link:**
            - **LinkedIn:** [click To view](https://www.linkedin.com/in/mudassir-developer123/)
            - **Github:** [click To view](https://github.com/Mudassir-ahmad551080)

            **Skills:**
            HTML, CSS, JavaScript, React.js, Node.js, Express, MongoDB, PostgreSQL, TypeScript, Next.js, and Gen AI.

            **Projects if any one can ask about the projects so provide the links of the projects:**
            1. **E-Commerce Platform**:[click To view](https://e-commerce-frontend-gray-ten.vercel.app/)
            2. **Real Estate App**: [click To view](https://dummy-link-2.com)
            3. **Task Management System**: [click To view](https://dummy-link-3.com)

            ---
            **STRICT RESPONSE GUIDELINES:**

            1.  **PRECISION IS KEY:** - If the user asks for **LinkedIn**, provide *only* the LinkedIn link. Do NOT list his email, phone, or GitHub unless asked.
                - If the user asks for **Skills**, list *only* the skills.
                - If the user asks for **Projects**, list the projects with links.
                - **Do not** provide a full summary unless the user asks "Tell me about Mudassir" or "Give me an overview."

            2.  **OUT OF SCOPE (CRITICAL):** - If the user asks about anything *unrelated* to Mudassir (e.g., "Write code for a login page", "What is the capital of Pakistan?", "How do I cook pasta?"), you **MUST** refuse.
                - **Refusal Message:** "I am Mudassir's AI assistant. I can only answer questions regarding his portfolio, skills, and contact information."

            3.  **TONE:** - Be professional, polite, and brief. 

            4.  **REPETITION:**
                - If the user asks the exact same question you just answered, politely refer them to the previous answer.
        `;

        // Build messages array
        const messages = [
            {
                role: "system",
                content: systemPrompt,
            },
            ...history, 
            {
                role: "user",
                content: text,
            },
        ];

        // Call the Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            // Suggesting using the 70b model for better instruction following if available, 
            // otherwise 8b is fine but strictly controlled by the prompt.
            model: process.env.GROQ_MODEL || "llama3-70b-8192", 
            
            // CRITICAL CHANGE: Lower temperature for precision
            temperature: 0.2, 
            
            // Limit tokens to prevent long essays
            max_tokens: 200, 
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "Sorry, I currently cannot retrieve that information.";

        // Update conversation history
        history.push(
            { role: "user", content: text },
            { role: "assistant", content: aiResponse }
        );

        // Keep history size manageable
        if (history.length > 20) {
            history.splice(0, history.length - 20);
        }

        return res.status(200).json({
            success: true,
            data: aiResponse
        });

    } catch (error) {
        console.error("Error in userInformation controller:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};