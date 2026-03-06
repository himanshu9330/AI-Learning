'use client';

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import TimetableForm from '@/components/dashboard/TimetableForm';

export default function TimetablePage() {
    return (
        <PageContainer>
            <div className="space-y-6">
                <TimetableForm />
            </div>
        </PageContainer>
    );
}
