import Groq from "groq-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize the Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const userInformation = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Please provide a question or text." });
        }

        // 1. Define Mudassir's Context
        // This tells the AI who it is representing and provides the raw data.
        const systemPrompt = `
            You are an AI assistant designed exclusively to provide information about a developer named Mudassir Ahmad.
            
            Here is the ONLY information you have about him:
            - **Name:** Mudassir Ahmad
            - **Study in:** Islamia College University Peshawar
            - **Role:** MERN Stack Developer
            - **Location:** Dalazak Road, Peshawar
            - **Phone:** 03215837843
            - **Email:** ma6386731@gmail.com
            Whenever you mention linkdin or gitub , you MUST use Markdown link syntax. 
            Here are his projects:
            // - **linkdin-account:** [click to view linkdin](https://www.linkedin.com/in/mudassir-developer123/)
            // - **Github:**  [click to view linkdin](https://github.com/Mudassir-ahmad551080)

            if the user can ask about the skill
            so provide the html,css,javascript,react.js,node.js,express,mongodb,
            postgress,typescript,Next.js,and Gen Ai 
            
           **PROJECTS (FORMAT AS LINKS):**
            Whenever you mention projects, you MUST use Markdown link syntax. 
            Here are his projects:
            - **E-Commerce Platform**: [Click to View Project](https://e-commerce-frontend-gray-ten.vercel.app/)
            - **Real Estate App**: [Click to View Project](https://dummy-link-2.com)
            - **Task Management System**: [Click to View Project](https://dummy-link-3.com)
            **Instructions for you:**
            1. If the user asks for contact info, provide the phone or email.
            2. If the user asks about his skills, mention he is a MERN stack developer.
            3. If the user asks for his portfolio/projects, provide the dummy links above.
            4. **CRITICAL:** If the user asks a question unrelated to Mudassir (e.g., "What is the capital of France?" or "Write code for me"), politely refuse and say: "I am designed only to answer questions about Mudassir Ahmad's portfolio and contact details."
        `;

        // 2. Call the Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            // You can use 'llama3-8b-8192' or 'mixtral-8x7b-32768' for fast responses
            model: process.env.GROQ_MODEL, 
            temperature: 0.6, // Keeps the answers factual but natural
        });

        // 3. Send the response back to the frontend
        const aiResponse = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't retrieve the information.";

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