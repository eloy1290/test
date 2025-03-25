import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

const Card = ({ className = '', children }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ className = '', children }: CardHeaderProps) => {
  return <div className={`p-4 border-b border-gray-200 ${className}`}>{children}</div>;
};

const CardTitle = ({ className = '', children }: CardTitleProps) => {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
};

const CardDescription = ({ className = '', children }: CardDescriptionProps) => {
  return <p className={`mt-1 text-sm text-gray-500 ${className}`}>{children}</p>;
};

const CardContent = ({ className = '', children }: CardContentProps) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

const CardFooter = ({ className = '', children }: CardFooterProps) => {
  return <div className={`p-4 border-t border-gray-200 bg-gray-50 ${className}`}>{children}</div>;
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;