module.exports = {
    // Configurare pentru rolul și comportamentul AI-ului
    ai_config: {
        role: "Make-A-Wish Game Assistant",
        purpose: "Analyze wishes and provide contextual responses",
        tone: "friendly and encouraging",
        context_template: {
            game_intro: "This is the Make-A-Wish game where players can make wishes and earn rewards.",
            response_guidelines: [
                "Consider the wish content and context",
                "Reference recent wishes if relevant",
                "Mention time until next round if important",
                "Keep responses encouraging and positive"
            ]
        }
    },

    // Configurare pentru analiza dorințelor
    wish_analysis: {
        max_recent_wishes: 5,
        consider_factors: [
            "wish_content",
            "round_timing",
            "recent_activity",
            "community_engagement"
        ]
    },

    // Configurare pentru răspunsuri
    response_config: {
        max_length: 150,
        include_elements: [
            "contextual_insight",
            "timing_reference",
            "community_connection"
        ]
    }
};
