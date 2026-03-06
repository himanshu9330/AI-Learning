import apiClient from '../lib/apiClient';

export interface Question {
    id: string;
    subject: string;
    chapter?: string;
    topic_tags?: string[];
    difficulty: number | string;
    text: string;
    options: string[];
    correct_option?: string;
    explanation?: string;
}

export interface TestSession {
    user_id: string;
    test_id: string;
    subject: string;
    exam: string;
    currentLevel: number;
    attemptedQuestionIds: string[];
    batchCount: number;
    batchTotal: number;
    batchCorrect: number;
    batchIncorrect: number;
    totalScore: number;
    status: 'active' | 'paused' | 'completed' | 'reset';
    currentQuestionId: string | null;
}

export interface Test {
    test_id: string;
    subject: string;
    chapter?: string;
    topic?: string;
    final_score: number | null;
    status: 'active' | 'completed' | 'abandoned';
    start_time: string;
    questions_attempted: number;
    correct_answers: number;
    ability_after?: number;
}

export interface StartTestResponse {
    status: string;
    message: string;
    data: {
        session: TestSession;
        question: Question;
        ability_score: number;
    };
}

export interface SubmitAnswerResponse {
    status: string;
    data: {
        isCorrect: boolean;
        correctOption: string;
        explanation: string;
        batchProgress: number;
        currentLevel: number;
        evalResult: {
            promoted: boolean;
            nextLevel?: number;
            nextAction: 'continue' | 'level_up' | 'stay_level' | 'terminate';
            terminated?: boolean;
            reason?: string;
        };
    };
}

export interface AIExplanationResponse {
    status: string;
    data: {
        question: {
            text: string;
            correct_answer: string;
            student_answer: string;
        };
        explanation: string;
        mistake_reason: string;
        step_by_step_solution: string;
        micro_practice_questions: Array<{
            question: string;
            options: string[];
            correct_answer: string;
        }>;
        recommended_next_step: string;
        youtube_link?: string;
    };
}

class TestService {
    /**
     * Get AI explanation for an incorrect answer
     */
    async getAIExplanation(params: {
        question_id: string;
        student_answer: string;
        exam?: string;
        mastery_level?: number;
    }): Promise<AIExplanationResponse> {
        const response = await apiClient.post<AIExplanationResponse>('ai/explain', params);
        return response.data;
    }

    /**
     * Start or Resume adaptive test
     */
    async startTest(subject: string, chapter?: string, topic?: string): Promise<StartTestResponse> {
        const response = await apiClient.post<StartTestResponse>('test/start', {
            subject,
            chapter,
            topic
        });
        return response.data;
    }

    /**
     * Get test metadata (subjects, chapters, topics)
     */
    async getMetadata(): Promise<{ status: string; data: any }> {
        const response = await apiClient.get('test/metadata');
        return response.data;
    }

    /**
     * Submit answer for active session
     */
    async submitAnswer(
        questionId: string,
        selectedOption: string,
        responseTime?: number,
        testId?: string
    ): Promise<SubmitAnswerResponse> {
        const response = await apiClient.post<SubmitAnswerResponse>('test/answer', {
            questionId,
            selectedOption,
            responseTime,
            testId
        });
        return response.data;
    }

    /**
     * Get next question for active session
     */
    async getNextQuestion(testId?: string): Promise<{ status: string; data: Question }> {
        const url = testId ? `test/next/${testId}` : 'test/next';
        const response = await apiClient.get<{ status: string; data: Question }>(url);
        return response.data;
    }

    /**
     * Resume existing active session
     */
    async resumeSession(): Promise<{ status: string; data: { session: TestSession; message: string } }> {
        const response = await apiClient.get('test/resume');
        return response.data;
    }

    /**
     * Get specific session by ID
     */
    async getSessionByTestId(testId: string): Promise<{ status: string; data: TestSession }> {
        const response = await apiClient.get(`test/session/${testId}`);
        return response.data;
    }

    /**
     * Reset active session
     */
    async resetSession(): Promise<{ status: string; data: { message: string } }> {
        const response = await apiClient.post('test/reset');
        return response.data;
    }

    /**
     * Get user test history (Legacy support or extended)
     */
    async getTestHistory(limit: number = 10): Promise<{ status: string; data: { tests: Test[]; count: number } }> {
        const response = await apiClient.get(`test/history?limit=${limit}`);
        return response.data;
    }
}

export default new TestService();
