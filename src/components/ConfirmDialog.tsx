import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'danger',
    isLoading = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm overflow-hidden bg-background border border-border shadow-2xl rounded-2xl flex flex-col"
                    >
                        <div className="p-6 pb-4">
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-full mb-4 ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 -mr-2 -mt-2">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>

                        <div className="p-4 bg-white/5 border-t border-border flex justify-end gap-3 rounded-b-2xl">
                            <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                                {cancelText}
                            </Button>
                            <Button
                                variant={variant === 'danger' ? 'destructive' : 'primary'}
                                className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white border-transparent' : ''}
                                onClick={onConfirm}
                                isLoading={isLoading}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
