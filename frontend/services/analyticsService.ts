import apiClient from '../lib/apiClient';

export interface TopicMastery {
    topic: string;
    mastery_score: number;
    attempts: number;
    correct_attempts: number;
    classification: 'weak' | 'moderate' | 'strong';
    last_updated: string;
}

export interface MasterySummary {
    total_topics: number;
    weak: TopicMastery[];
    moderate: TopicMastery[];
    strong: TopicMastery[];
    average_mastery: number;
}

export interface AbilityHistory {
    date: string;
    ability_before: number;
    ability_after: number;
    ability_score: number; // Current point on the trajectory
    change: number;
}

export interface PerformanceStats {
    user: {
        name: string;
        ability_score: number;
        ability_level: string;
        grade: string;
        target_exam: string;
    };
    tests: {
        total: number;
        average_score: number;
        average_accuracy: number;
        total_questions: number;
        total_correct: number;
    };
    answers: {
        total: number;
        correct: number;
        overall_accuracy: number;
        avg_response_time_ms: number;
    };
    topics: {
        total: number;
        weak: number;
        moderate: number;
        strong: number;
    };
}

export interface ImprovementMetrics {
    ability_improvement: number;
    score_improvement: number;
    tests_completed: number;
    first_test_date: string;
    latest_test_date: string;
}

export interface TopicGrowth {
    topics: {
        topic: string;
        subject: string;
        mastery_score: number;
        attempts: number;
        classification: 'weak' | 'moderate' | 'strong';
    }[];
}

class AnalyticsService {
    /**
     * Get ability score history
     */
    async getAbilityHistory(days: number = 30): Promise<{ status: string; data: { history: AbilityHistory[]; count: number } }> {
        const response = await apiClient.get(`analytics/ability-history?days=${days}`);
        return response.data;
    }

    /**
     * Get topic mastery growth
     */
    async getTopicGrowth(topic?: string): Promise<{ status: string; data: TopicGrowth }> {
        const url = topic ? `analytics/topic-growth?topic=${topic}` : 'analytics/topic-growth';
        const response = await apiClient.get(url);
        return response.data;
    }

    /**
     * Get performance statistics
     */
    async getPerformanceStats(): Promise<{ status: string; data: PerformanceStats }> {
        const response = await apiClient.get('analytics/performance');
        return response.data;
    }

    /**
     * Get improvement metrics
     */
    async getImprovementMetrics(): Promise<{ status: string; data: ImprovementMetrics }> {
        const response = await apiClient.get('analytics/improvement');
        return response.data;
    }
}

export default new AnalyticsService();
