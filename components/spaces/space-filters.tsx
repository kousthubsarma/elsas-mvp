// components/spaces/space-filters.tsx
'use client'

import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Search, Filter, MapPin } from 'lucide-react'

interface SpaceFiltersProps {
  onSearch?: (query: string) => void
  onLocationSearch?: () => void
  loading?: boolean
}

export function SpaceFilters({ onSearch, onLocationSearch, loading }: SpaceFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search spaces by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onLocationSearch}
          disabled={loading}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Near Me
        </Button>
      </form>
    </div>
  )
}