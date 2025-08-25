'use client';

import { forwardRef } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils/cn';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ name, label, description, className, ...props }, ref) => {
    const form = useFormContext();

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Input
                {...field}
                {...props}
                ref={ref}
                className={cn(className)}
                value={field.value || ''}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);

FormInput.displayName = 'FormInput';