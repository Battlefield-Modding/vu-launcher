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
export function FormBuilder({ form, sectionName }: { form: any; sectionName: keyof StartupArgs }) {
  //@ts-expect-error
  return Object.entries(defaultStartupArguments[sectionName]).map(([key, value]) => {
    const fieldType = TranslateTypeToField[typeof value as keyof TranslateTypeToFieldType]
    if (fieldType === 'checkbox') {
      return (
        <CheckBoxComponent
          defaultChecked={value}
          key={key}
          //@ts-expect-error
          description={StartupDescriptions[sectionName as keyof StartupArgs][key as string]}
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
          //@ts-expect-error
          description={StartupDescriptions[sectionName as keyof StartupArgs][key as string]}
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
            <FormLabel className="text-md rounded-md bg-sidebar-foreground p-1 pl-2 pr-2 text-white">
              <code>{key === 'password' ? 'RCON password' : key}</code>
            </FormLabel>

            <FormControl>
              <Textarea placeholder={value} {...field} rows={2} className="w-1/2" />
            </FormControl>

            <FormDescription>
              {/* @ts-expect-error*  */}
              {StartupDescriptions[sectionName as keyof StartupArgs][key as string]}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  })
}