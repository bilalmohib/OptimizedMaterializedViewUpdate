"use client"

import { Toaster } from "react-hot-toast";

interface CreateToastProviderProps {
    children: React.ReactNode;
}

const CreateToastProvider = ({ children }: CreateToastProviderProps) => {
    return (
        <div>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#fff',
                        color: '#363636',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                    },
                    success: {
                        iconTheme: {
                            primary: '#059669',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#DC2626',
                            secondary: '#fff',
                        },
                    },
                    loading: {
                        iconTheme: {
                            primary: '#3B82F6',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </div>
    )
}

export default CreateToastProvider;

