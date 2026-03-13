import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'white';
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = "px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1";
  
  const variants = {
    primary: "bg-brand-white text-brand-black hover:bg-brand-lime hover:shadow-lg hover:shadow-brand-lime/20",
    secondary: "bg-brand-black text-white hover:bg-gray-900",
    outline: "border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white",
    white: "bg-white text-brand-blue hover:bg-brand-lime hover:text-brand-black shadow-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};