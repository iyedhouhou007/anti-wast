import { useState, useCallback } from "react";

export default function useForm(initialValues = {}, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setValues((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Clear error when field is modified
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (e) => {
      if (!validate) return;

      const { name, value } = e.target;
      const fieldErrors = validate({ [name]: value });

      if (fieldErrors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: fieldErrors[name],
        }));
      }
    },
    [validate]
  );

  const handleSubmit = useCallback(
    async (onSubmit) => {
      try {
        setIsSubmitting(true);

        if (validate) {
          const formErrors = validate(values);
          if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
          }
        }

        await onSubmit(values);

        // Reset form on successful submission
        setValues(initialValues);
        setErrors({});
      } catch (error) {
        // Handle API validation errors
        if (error.errors) {
          setErrors(error.errors);
        }
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, initialValues]
  );

  const setFieldValue = useCallback(
    (name, value) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when field is modified
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    reset,
  };
}
