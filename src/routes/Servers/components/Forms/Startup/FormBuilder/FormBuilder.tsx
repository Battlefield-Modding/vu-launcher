import { defaultStartupArguments, StartupDescriptions } from '../Setup/DefaultStartupConfig'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { StartupArgs, Vars } from '../Setup/StartupTypes'
import { CheckBoxComponent } from './CheckBoxComponent'
import { NumberComponent } from './NumberComponent'
import { Textarea } from '@/components/ui/textarea'

type TranslateTypeToFieldType = {}

const TranslateTypeToField = {
  boolean: 'checkbox',
  string: 'textarea',
  number: 'number',
  undefined: 'none',
}
export function FormBuilder({
  form,
  sectionName,
  filteredArguments,
}: {
  form: any
  sectionName: keyof StartupArgs
  filteredArguments: any
}) {
  return Object.entries(filteredArguments[sectionName]).map(([key, value]) => {
    const fieldType = TranslateTypeToField[typeof value as keyof TranslateTypeToFieldType]
    const fieldDescription =
      // @ts-expect-error
      StartupDescriptions[sectionName as keyof StartupArgs][
        key.includes('_') ? (key.substring(1, key.length) as string) : (key as string)
      ]
    if (fieldType === 'checkbox') {
      return (
        <CheckBoxComponent
          defaultChecked={value as boolean}
          key={key}
          description={fieldDescription}
          sectionName={sectionName}
          form={form}
          keyValue={key}
        />
      )
    }
    if (fieldType === 'number') {
      return (
        <NumberComponent
          key={key}
          defaultvalue={value}
          sectionName={sectionName}
          description={fieldDescription}
          form={form}
          keyValue={key}
        />
      )
    }
    if (fieldType === 'none') {
      return <div key={key}></div>
    }
    return (
      <FormField
        key={key}
        control={form.control}
        name={`${sectionName}.${key as keyof Vars}`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-md flex flex-col justify-center rounded-md leading-10 text-white">
              <code>{key === 'password' ? 'password (RCON)' : key}</code>
            </FormLabel>

            <FormControl>
              <Textarea placeholder={value as string} {...field} rows={2} className="w-1/2" />
            </FormControl>

            <FormDescription>{fieldDescription}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  })
}
