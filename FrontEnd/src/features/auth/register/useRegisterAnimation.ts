import { useEffect, useState } from "react";

type AnimationState = "idle" | "loading" | "success" | "error";

export const useRegisterAnimation = (isSubmitting: boolean, isSuccess?: boolean, isError?: boolean) => {
  const [state, setState] = useState<AnimationState>("idle");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      setState("loading");
      return;
    }

    if (isSuccess) {
      setState("success");

      // small delay for animation effect (confetti / transition)
      const timer = setTimeout(() => {
        setShowSuccess(true);
      }, 300);

      return () => clearTimeout(timer);
    }

    if (isError) {
      setState("error");
      setShowSuccess(false);
      return;
    }

    setState("idle");
  }, [isSubmitting, isSuccess, isError]);

  const resetAnimation = () => {
    setState("idle");
    setShowSuccess(false);
  };

  return {
    state,
    showSuccess,
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
    resetAnimation,
  };
};