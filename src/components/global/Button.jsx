const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick = () => {},
  className = "",
  type = "button",
  fullWidth = false,
  ...props
}) => {
  const baseStyles =
    "flex justify-center items-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 cursor-pointer",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 cursor-pointer",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 cursor-pointer",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 cursor-pointer",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 cursor-pointer",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
