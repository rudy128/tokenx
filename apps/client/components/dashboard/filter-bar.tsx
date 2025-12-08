"use client"

import { Zap, Gift, Users, Clock, Flame, Loader } from "lucide-react"

interface FilterOption {
    id: string
    label: string
    icon?: any
}

const filters: FilterOption[] = [
    { id: 'recommended', label: 'Recommended', icon: Flame },
    { id: 'token_quests', label: 'Token Quests', icon: Zap },
    { id: 'airdrop_points', label: 'Airdrop Points', icon: Gift },
    { id: 'social_quests', label: 'Social Quests', icon: Users },
    { id: 'latest', label: 'Latest', icon: Clock },
    { id: 'in_progress', label: 'In Progress', icon: Loader },
]

interface FilterBarProps {
    activeFilter: string
    onFilterChange: (id: string) => void
}

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
    return (
        <div
            className="scrollbar-hide"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                overflowX: 'auto',
                padding: '0.5rem 0',
                marginBottom: '1rem',
                width: '100%',
                whiteSpace: 'nowrap'
            }}
        >
            {filters.map((filter) => {
                const Icon = filter.icon
                const isActive = activeFilter === filter.id
                return (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '99px',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            border: isActive ? '1px solid transparent' : '1px solid var(--border-subtle)',
                            background: isActive ? '#fff' : 'var(--bg-secondary)',
                            color: isActive ? '#000' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                            flexShrink: 0
                        }}
                    >
                        {Icon && <Icon size={16} />}
                        {filter.label}
                    </button>
                )
            })}

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
        </div>
    )
}
