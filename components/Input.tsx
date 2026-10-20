import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ className, label, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-bridge-subtext mb-2">{label}</label>}
      <div className="relative group">
        <input
          className={twMerge(
            "w-full bg-bridge-dark/50 border border-white/10 text-xl md:text-2xl py-4 px-6 text-white placeholder-white/20 rounded-sm focus:outline-none focus:border-bridge-gold/50 focus:ring-1 focus:ring-bridge-gold/20 transition-all duration-300",
            "group-hover:border-white/20",
            className
          )}
          {...props}
        />
        {/* Underglow */}
        <div className="absolute inset-0 -z-10 bg-bridge-gold/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ className, label, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-bridge-subtext mb-2">{label}</label>}
      <div className="relative group">
        <textarea
          className={twMerge(
            "w-full bg-bridge-dark/50 border border-white/10 text-lg md:text-xl py-4 px-6 text-white placeholder-white/20 rounded-sm focus:outline-none focus:border-bridge-gold/50 focus:ring-1 focus:ring-bridge-gold/20 transition-all duration-300 resize-none min-h-[120px]",
            "group-hover:border-white/20",
            className
          )}
          {...props}
        />
        {/* Underglow */}
        <div className="absolute inset-0 -z-10 bg-bridge-gold/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
};
