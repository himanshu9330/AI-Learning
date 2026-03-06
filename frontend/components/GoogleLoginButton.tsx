'use client';

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function GoogleLoginButton() {
    const { googleLogin } = useAuth();
    const router = useRouter();

    const handleSuccess = async (credentialResponse: any) => {
        try {
            if (credentialResponse.credential) {
                await googleLogin(credentialResponse.credential);
                toast.success('Login successful!');
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Login Failed', error);
            if (error.response?.status === 404) {
                toast.error('Account not found. Please sign up first.');
                router.push('/register');
            } else {
                toast.error(error.response?.data?.message || 'Login failed');
            }
        }
    };

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => {
                    console.log('Login Failed');
                    toast.error('Google Login Failed');
                }}
                useOneTap
                theme="filled_blue"
                shape="pill"
                width="300"
            />
        </div>
    );
}
