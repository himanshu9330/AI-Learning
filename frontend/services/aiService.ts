import apiClient from '../lib/apiClient';

export interface MicroPracticeQuestion {
    question: string;
    options: string[];
    correct_answer: string;
}

export interface AIExplanation {
    explanation: string;
    mistake_reason: string;
    step_by_step_solution: string;
    micro_practice_questions: MicroPracticeQuestion[];
    recommended_next_step: string;
}

export interface PracticeQuestion {
    question_text: string;
    options: string[];
    correct_option: string;
    explanation: string;
    difficulty: number;
    topic_tags: string[];
}

class AIService {
    /**
     * Get AI explanation for a question
     */
    async getExplanation(
        questionId: string,
        studentAnswer: string,
        masteryLevel: number
    ): Promise<{ status: string; data: { question: any; ai_explanation: AIExplanation } }> {
        const response = await apiClient.post('ai/explain', {
            question_id: questionId,
            student_answer: studentAnswer,
            mastery_level: masteryLevel
        });
        return response.data;
    }

    /**
     * Generate practice questions
     */
    async generatePractice(
        topic: string,
        difficulty: number,
        count: number,
        masteryLevel: number
    ): Promise<{ status: string; data: { questions: PracticeQuestion[]; count: number } }> {
        const response = await apiClient.post('ai/practice', {
            topic,
            difficulty,
            count,
            mastery_level: masteryLevel
        });
        return response.data;
    }

    /**
     * Check AI service health
     */
    async checkHealth(): Promise<{ status: string; data: { ai_service_available: boolean; message: string } }> {
        const response = await apiClient.get('ai/health');
        return response.data;
    }
}

export default new AIService();
