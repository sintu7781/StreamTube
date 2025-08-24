export function Avatar({ children, className }) {
  return (
    <div className={`rounded-full overflow-hidden bg-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt }) {
  return <img src={src} alt={alt} className="w-full h-full object-cover" />;
}

export function AvatarFallback({ children }) {
  return (
    <span className="flex items-center justify-center h-full w-full text-gray-600">
      {children}
    </span>
  );
}
