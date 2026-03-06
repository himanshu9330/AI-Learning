import apiClient from '../lib/apiClient';
import { MasterySummary, TopicMastery } from './analyticsService';

export interface DayTask {
    _id: string;
    type: string;
    topic: string;
    difficulty: string;
    question_count?: number;
    duration: string;
    description: string;
    completed: boolean;
    priority?: string;
}

export interface DayPlan {
    day: string;
    date: string;
    total_study_time: string;
    tasks: DayTask[];
    focus_topic: string;
    current_mastery: number;
    target_mastery: number;
}

export interface WeeklyRoadmap {
    week_plan: DayPlan[];
    summary: {
        total_topics: number;
        weak_topics: Array<{
            topic: string;
            mastery: number;
            priority: string;
        }>;
        total_practice_questions: number;
        total_study_hours: number;
        goal: string;
    };
}

export interface FocusTopic {
    topic: string;
    mastery_score: number;
    attempts: number;
    priority: string;
    recommended_practice_count: number;
}

export interface ChapterProgress {
    subject: string;
    chapter: string;
    status: 'not_started' | 'in_progress' | 'mastered' | 'weak';
    mastery: number;
    prerequisites: string[];
}

export interface Revision {
    chapter: string;
    subject: string;
    next_revision_date: string;
    interval_days: number;
    completed_count: number;
}

class RoadmapService {
    /**
     * Generate weekly roadmap
     */
    async generateRoadmap(testSessionId?: string): Promise<{ status: string; message: string; data: WeeklyRoadmap }> {
        const url = testSessionId ? `roadmap/generate?testSessionId=${testSessionId}` : 'roadmap/generate';
        const response = await apiClient.get(url);
        return response.data;
    }

    /**
     * Get latest roadmap
     */
    async getLatestRoadmap(): Promise<{ status: string; data: WeeklyRoadmap }> {
        const response = await apiClient.get('roadmap/latest');
        return response.data;
    }

    /**
     * Get topic mastery summary
     */
    async getTopicMastery(): Promise<{ status: string; data: MasterySummary }> {
        const response = await apiClient.get('roadmap/mastery');
        return response.data;
    }

    /**
     * Get recommended focus topics
     */
    async getFocusTopics(): Promise<{ status: string; data: { focus_topics: FocusTopic[] } }> {
        const response = await apiClient.get('roadmap/focus-topics');
        return response.data;
    }

    /**
     * Get chapter-level progress (Skill Map)
     */
    async getChapterProgress(): Promise<{ status: string; data: { chapters: ChapterProgress[] } }> {
        const response = await apiClient.get('roadmap/chapters');
        return response.data;
    }

    /**
     * Get revisions due today
     */
    async getRevisions(): Promise<{ status: string; data: { revisions: Revision[] } }> {
        const response = await apiClient.get('roadmap/revisions');
        return response.data;
    }

    /**
     * Update task status
     */
    async updateTaskStatus(taskId: string, completed: boolean): Promise<{ status: string; data: { task: DayTask } }> {
        const response = await apiClient.patch(`roadmap/tasks/${taskId}`, { completed });
        return response.data;
    }
}

export default new RoadmapService();
