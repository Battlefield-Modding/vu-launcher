import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { User } from 'lucide-react'
import PlayerCredentialsForm from './credentials-form'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export default function CredentialsSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <Card>
          <CardHeader>
            <CardTitle>Save VU Credentials</CardTitle>
            <CardDescription>Allows for VU to auto-login</CardDescription>
          </CardHeader>
        </Card>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Save VU Credentials</SheetTitle>
          <SheetDescription>Updates your credentials for VU Auto-Login</SheetDescription>
        </SheetHeader>
        <br />
        <PlayerCredentialsForm setSheetOpen={setSheetOpen} />
      </SheetContent>
    </Sheet>
  )
}
