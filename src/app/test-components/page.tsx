'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function TestComponents() {
  const [checked, setChecked] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Component Test Page</h1>

      {/* Button Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button Component</h2>
        <div className="flex gap-2">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* Input Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input Component</h2>
        <div className="max-w-sm">
          <Input
            type="text"
            placeholder="Enter text here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-2">You typed: {inputValue}</p>
        </div>
      </section>

      {/* Card Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Card Component</h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the card content. Cards are useful for grouping related information.</p>
          </CardContent>
        </Card>
      </section>

      {/* Checkbox Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Checkbox Component</h2>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="test-checkbox"
            checked={checked}
            onCheckedChange={(value) => setChecked(value as boolean)}
          />
          <label
            htmlFor="test-checkbox"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Accept terms and conditions
          </label>
        </div>
        <p className="text-sm text-muted-foreground">
          Checkbox is: {checked ? 'checked' : 'unchecked'}
        </p>
      </section>

      {/* Dialog Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dialog Component</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a dialog description. Dialogs are useful for important actions.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Dialog content goes here.</p>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Skeleton Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Skeleton Component</h2>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </section>
    </div>
  );
}
