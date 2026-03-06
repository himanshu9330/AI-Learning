export type ExamCategory = 'JEE' | 'NEET' | 'CLASS_12' | 'OTHER';
export type Stream = 'SCIENCE_MATH' | 'SCIENCE_BIO' | 'NONE';

export interface SubjectConfig {
    id: string;
    name: string;
    icon: string; // Lucide icon name or image path
    color: string; // Tailwind color class or hex
}

export interface ExamSubjectMapping {
    subjects: string[]; // List of subject IDs
    streams?: {
        [key in Stream]?: string[]; // List of subject IDs for each stream
    };
}

export const SUBJECTS: Record<string, SubjectConfig> = {
    mathematics: {
        id: 'mathematics',
        name: 'Mathematics',
        icon: 'Calculator',
        color: 'from-blue-500 to-indigo-600',
    },
    physics: {
        id: 'physics',
        name: 'Physics',
        icon: 'Atom',
        color: 'from-purple-500 to-pink-600',
    },
    chemistry: {
        id: 'chemistry',
        name: 'Chemistry',
        icon: 'Beaker',
        color: 'from-emerald-400 to-teal-600',
    },
    biology: {
        id: 'biology',
        name: 'Biology',
        icon: 'Dna',
        color: 'from-rose-500 to-orange-600',
    },
    // Default/Other subjects
    logic: {
        id: 'logic',
        name: 'Logical Reasoning',
        icon: 'Brain',
        color: 'from-amber-400 to-orange-500',
    },
    english: {
        id: 'english',
        name: 'English',
        icon: 'BookOpen',
        color: 'from-sky-400 to-blue-500',
    }
};

export const EXAM_SUBJECT_MAP: Record<ExamCategory, ExamSubjectMapping> = {
    JEE: {
        subjects: ['mathematics', 'physics', 'chemistry'],
    },
    NEET: {
        subjects: ['biology', 'physics', 'chemistry'],
    },
    CLASS_12: {
        subjects: [], // Depends on stream
        streams: {
            SCIENCE_MATH: ['mathematics', 'physics', 'chemistry'],
            SCIENCE_BIO: ['biology', 'physics', 'chemistry'],
        }
    },
    OTHER: {
        subjects: ['logic', 'english'],
    }
};

/**
 * Resolves subjects for a given exam and stream
 */
export const getSubjectsForExam = (exam: ExamCategory, stream: Stream = 'NONE'): SubjectConfig[] => {
    const mapping = EXAM_SUBJECT_MAP[exam];
    if (!mapping) return [];

    let subjectIds: string[] = [];

    if (exam === 'CLASS_12' && mapping.streams && stream !== 'NONE') {
        subjectIds = mapping.streams[stream] || [];
    } else {
        subjectIds = mapping.subjects;
    }

    return subjectIds.map(id => SUBJECTS[id]).filter(Boolean);
};
