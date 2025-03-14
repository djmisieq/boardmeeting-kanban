import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

export type ValidationRule<T> = {
  validate: (value: T, formValues: FormValues) => boolean;
  message: string;
};

export type FieldConfig<T> = {
  value: T;
  required?: boolean;
  requiredMessage?: string;
  validate?: ValidationRule<T>[];
  transform?: (value: T) => any;
};

export type FormValues = Record<string, any>;
export type FormErrors = Record<string, string | null>;
export type FormConfig = Record<string, FieldConfig<any>>;

/**
 * Hook do zarządzania formularzami z walidacją
 * 
 * @param initialConfig Konfiguracja pól formularza
 * @param onSubmit Funkcja wywoływana przy prawidłowym przesłaniu formularza
 */
export function useForm<T extends FormValues>(
  initialConfig: FormConfig,
  onSubmit?: (values: T) => void | Promise<void>
) {
  // Stan formularza
  const [formConfig, setFormConfig] = useState<FormConfig>(initialConfig);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pobieranie wartości formularza
  const getValues = useCallback(() => {
    const values: FormValues = {};
    Object.entries(formConfig).forEach(([name, config]) => {
      values[name] = config.transform ? config.transform(config.value) : config.value;
    });
    return values as T;
  }, [formConfig]);

  // Walidacja jednego pola
  const validateField = useCallback(
    (name: string): string | null => {
      const config = formConfig[name];
      if (!config) return null;

      // Sprawdzenie, czy pole jest wymagane
      if (config.required && 
          (config.value === '' || config.value === null || config.value === undefined)) {
        return config.requiredMessage || 'To pole jest wymagane';
      }

      // Dodatkowe reguły walidacji
      if (config.validate) {
        const formValues = getValues();
        for (const rule of config.validate) {
          if (!rule.validate(config.value, formValues)) {
            return rule.message;
          }
        }
      }

      return null;
    },
    [formConfig, getValues]
  );

  // Walidacja wszystkich pól
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formConfig).forEach((name) => {
      const error = validateField(name);
      newErrors[name] = error;
      if (error) {
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formConfig, validateField]);

  // Obsługa zmiany wartości pola
  const handleChange = useCallback(
    (name: string, value: any) => {
      setFormConfig((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          value,
        },
      }));

      // Oznaczenie pola jako dotknięte
      if (!touched[name]) {
        setTouched((prev) => ({ ...prev, [name]: true }));
      }

      // Walidacja pola przy zmianie
      const error = validateField(name);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField, touched]
  );

  // Helper dla inputów
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      const inputValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value;
      
      handleChange(name, inputValue);
    },
    [handleChange]
  );

  // Obsługa wysłania formularza
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      // Walidacja wszystkich pól
      const isValid = validateForm();
      if (!isValid || !onSubmit) return;

      try {
        setIsSubmitting(true);
        await onSubmit(getValues());
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Wystąpił błąd');
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, onSubmit, getValues]
  );

  // Resetowanie formularza
  const resetForm = useCallback(() => {
    setFormConfig(initialConfig);
    setErrors({});
    setTouched({});
    setSubmitError(null);
  }, [initialConfig]);

  // Ustawienie pojedynczej wartości formularza
  const setFieldValue = useCallback((name: string, value: any) => {
    handleChange(name, value);
  }, [handleChange]);

  return {
    values: getValues(),
    errors,
    touched,
    isSubmitting,
    submitError,
    handleChange,
    handleInputChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    validateForm,
    validateField,
    // Sprawdzenie czy dane pole ma błąd
    hasError: useCallback(
      (name: string) => Boolean(touched[name] && errors[name]),
      [touched, errors]
    ),
    // Pobranie komunikatu błędu dla pola
    getError: useCallback(
      (name: string) => (touched[name] ? errors[name] : null),
      [touched, errors]
    ),
  };
}
