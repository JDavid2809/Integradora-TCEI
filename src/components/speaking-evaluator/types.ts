export interface Scenario {
    id: string;
    title: string;
    icon: string;
    level: string;
    prompts: string[];
}

export interface Feedback {
    score: number;
    suggestions: string;
    issues: any[];
}
