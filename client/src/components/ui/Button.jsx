import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Thin motion-enabled wrapper over the .btn-* CSS primitives.
// variant: primary | secondary | ghost | danger. Shows a spinner when loading.
const VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export default function Button({
  variant = "primary",
  loading = false,
  icon: Icon,
  iconRight = false,
  children,
  className = "",
  disabled,
  type = "button",
  ...props
}) {
  const Leading = loading ? Loader2 : Icon;
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={`${VARIANTS[variant] || VARIANTS.primary} ${className}`}
      {...props}
    >
      {!iconRight && Leading && <Leading size={16} className={loading ? "animate-spin" : ""} />}
      {children}
      {iconRight && Leading && <Leading size={16} className={loading ? "animate-spin" : ""} />}
    </motion.button>
  );
}
