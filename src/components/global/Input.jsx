import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  type = "text",
  placeholder = "",
  value = "",
  onChange = () => {},
  onBlur = () => {},
  className = "",
  disabled = false,
  required = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";
  const inputType = isPasswordType && showPassword ? "text" : type;

  return (
    <div className="relative w-full">
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200
          ${isPasswordType && showPassword ? "pr-10" : ""}
          ${className}
        `}
        {...props}
      />

      {isPasswordType && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPassword(!showPassword);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

export default Input;
