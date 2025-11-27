import { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
    {
        id: "greetings",
        title: "Greetings",
        icon: "👋",
        level: "Beginner",
        prompts: [
            "Hello, how are you doing today?",
            "Good morning! It's nice to meet you.",
            "Hi there! Long time no see.",
            "How is your day going so far?",
            "It's a pleasure to meet you finally.",
            "Hey! What have you been up to?"
        ]
    },
    {
        id: "travel",
        title: "Travel",
        icon: "✈️",
        level: "Intermediate",
        prompts: [
            "Excuse me, could you tell me where the train station is?",
            "I would like to check in, please.",
            "How much does a ticket to the city center cost?",
            "Is there a pharmacy nearby?",
            "Could you recommend a good local restaurant?",
            "I seem to be lost, can you help me find this address?"
        ]
    },
    {
        id: "restaurant",
        title: "Restaurant",
        icon: "🍽️",
        level: "Intermediate",
        prompts: [
            "Can I see the menu, please?",
            "I'll have the pasta with a side of salad.",
            "Could we get the check, please?",
            "Do you have any vegetarian options?",
            "This dish is delicious, compliments to the chef.",
            "I would like to make a reservation for two."
        ]
    },
    {
        id: "business",
        title: "Business",
        icon: "💼",
        level: "Advanced",
        prompts: [
            "Let's schedule a meeting for next Tuesday to discuss the project.",
            "I appreciate your feedback on the proposal.",
            "Could you please clarify the timeline for this deliverable?",
            "I'd like to introduce our new marketing strategy.",
            "Thank you all for attending this meeting today.",
            "We need to focus on increasing our quarterly revenue."
        ]
    },
    {
        id: "interview",
        title: "Job Interview",
        icon: "🤝",
        level: "Advanced",
        prompts: [
            "Tell me a little bit about yourself and your experience.",
            "What do you consider to be your greatest strength?",
            "Why do you want to work for this company?",
            "Describe a challenge you faced and how you overcame it.",
            "Where do you see yourself in five years?",
            "Do you have any questions for us?"
        ]
    },
    {
        id: "shopping",
        title: "Shopping",
        icon: "🛍️",
        level: "Beginner",
        prompts: [
            "Do you have this in a smaller size?",
            "I'm just looking, thank you.",
            "What time does the store close today?",
            "Can I pay by credit card?",
            "I'd like to return this item, please.",
            "How much is this on sale for?"
        ]
    },
    {
        id: "social",
        title: "Socializing",
        icon: "🎉",
        level: "Intermediate",
        prompts: [
            "What do you like to do in your free time?",
            "Have you seen any good movies lately?",
            "It's a beautiful day outside, isn't it?",
            "Do you have any plans for the weekend?",
            "I love your outfit, where did you get it?",
            "Let's grab a coffee sometime soon."
        ]
    }
];
