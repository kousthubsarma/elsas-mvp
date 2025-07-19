// components/spaces/space-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Space } from '../../shared/types/space'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

interface SpaceFormData {
  name: string
  description: string
  address: string
  lock_id: string
  camera_url?: string
  max_duration_minutes: number
}

interface SpaceFormProps {
  space?: Space
  onSubmit: (data: SpaceFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function SpaceForm({ space, onSubmit, onCancel, loading }: SpaceFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SpaceFormData>({
    defaultValues: space ? {
      name: space.name,
      description: space.description || '',
      address: space.address,
      lock_id: space.lock_id,
      camera_url: space.camera_url || '',
      max_duration_minutes: space.max_duration_minutes
    } : {
      max_duration_minutes: 60
    }
  })

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {space ? 'Edit Space' : 'Create New Space'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Space Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g., Storage Unit A-42"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the space"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address', { required: 'Address is required' })}
              placeholder="Full address of the space"
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lock_id">Lock ID</Label>
            <Input
              id="lock_id"
              {...register('lock_id', { required: 'Lock ID is required' })}
              placeholder="Unique identifier for the smart lock"
            />
            {errors.lock_id && (
              <p className="text-sm text-red-500 mt-1">{errors.lock_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="camera_url">Camera URL (Optional)</Label>
            <Input
              id="camera_url"
              {...register('camera_url')}
              placeholder="URL for camera feed"
            />
          </div>

          <div>
            <Label htmlFor="max_duration_minutes">Maximum Duration (minutes)</Label>
            <Input
              id="max_duration_minutes"
              type="number"
              min="1"
              max="1440"
              {...register('max_duration_minutes', { 
                required: 'Duration is required',
                min: { value: 1, message: 'Minimum 1 minute' },
                max: { value: 1440, message: 'Maximum 24 hours' }
              })}
            />
            {errors.max_duration_minutes && (
              <p className="text-sm text-red-500 mt-1">{errors.max_duration_minutes.message}</p>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : space ? 'Update Space' : 'Create Space'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}