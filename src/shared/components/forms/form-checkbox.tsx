'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/shared/lib/utils/cn';

interface FormCheckboxProps {
  name: string;
  label?: string;
  description?: string;
  className?: string;
}

export function FormCheckbox({
  name,
  label,
  description,
  className,
}: FormCheckboxProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-start space-x-3 space-y-0', className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && <FormLabel>{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}