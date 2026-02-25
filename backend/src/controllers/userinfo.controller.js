import Groq from "groq-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize the Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Store conversation history per session (in-memory for demo)
// In production, use Redis, MongoDB, or session storage
const conversationHistory = new Map();

export const userInformation = async (req, res) => {
    try {
        const { text, sessionId } = req.body; // Add sessionId to track conversations

        if (!text) {
            return res.status(400).json({ message: "Please provide a question or text." });
        }

        // Get or initialize conversation history for this session
        if (!conversationHistory.has(sessionId)) {
            conversationHistory.set(sessionId, []);
        }
        const history = conversationHistory.get(sessionId);

        // System prompt (only sent once at the start)
        const systemPrompt = `
            You are an AI assistant designed exclusively to provide information about a developer named Mudassir Ahmad.
           
            Here is the ONLY information you have about him:
            - **Name:** Mudassir Ahmad
            - **Study in:** Islamia College University Peshawar
            - **Role:** MERN Stack Developer
            - **Location:** Dalazak Road, Peshawar
            - **Phone:** 03215837843
            - **Email:** ma6386731@gmail.com
            
            **Social Links:**
            - **LinkedIn:** [click to view LinkedIn](https://www.linkedin.com/in/mudassir-developer123/)
            - **Github:** [click to view Github](https://github.com/Mudassir-ahmad551080)

            **Skills:**
            HTML, CSS, JavaScript, React.js, Node.js, Express, MongoDB, PostgreSQL, TypeScript, Next.js, and Gen AI
           
            **PROJECTS (FORMAT AS LINKS):**
            - **E-Commerce Platform**: [Click to View Project](https://e-commerce-frontend-gray-ten.vercel.app/)
            - **Real Estate App**: [Click to View Project](https://dummy-link-2.com)
            - **Task Management System**: [Click to View Project](https://dummy-link-3.com)
            
            **Instructions:**
            1. If the user asks for contact info, provide the phone or email.
            2. If the user asks about his skills, mention the skills listed above.
            3. If the user asks for his portfolio/projects, provide the links above.
            4. **If the user asks the same or very similar question again**, politely say: "I already answered this question above. Please scroll up to see my previous response."
            5. **CRITICAL:** If the user asks a question unrelated to Mudassir (e.g., "What is the capital of France?" or "Write code for me"), politely refuse and say: "I am designed only to answer questions about Mudassir Ahmad's portfolio and contact details."
            6. Keep track of the conversation context and avoid repeating the same detailed answers.
            7. if the user can ask any other kind of question without mudassir information 
            so provide the answer i am mudassir ai assistan how we can assist regarding to mudassir
        `;

        // Build messages array with history
        const messages = [
            {
                role: "system",
                content: systemPrompt,
            },
            ...history, // Add previous conversation
            {
                role: "user",
                content: text,
            },
        ];

        // Call the Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: process.env.GROQ_MODEL || "llama3-8b-8192",
            temperature: 0.6,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't retrieve the information.";

        // Update conversation history
        history.push(
            { role: "user", content: text },
            { role: "assistant", content: aiResponse }
        );

        // Optional: Limit history to last 20 messages to avoid token limits
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