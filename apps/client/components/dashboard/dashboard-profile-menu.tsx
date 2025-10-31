"use client";

import { useState, useEffect, useRef } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface DashboardProfileMenuProps {
  name: string | null;
  email: string;
  image?: string | null;
  tier?: string;
}

export function DashboardProfileMenu({ name, email, image, tier = "BRONZE TIER" }: DashboardProfileMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted) return null;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Profile Avatar Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open profile menu"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          border: '2px solid var(--border-default)',
          backgroundColor: 'var(--bg-elevated)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-strong)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)'
        }}
      >
        {image ? (
          <Image 
            src={image} 
            alt="Profile" 
            width={36} 
            height={36} 
            style={{ borderRadius: '50%' }}
          />
        ) : (
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--interactive-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-inverse)',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 'var(--space-2)',
            width: '14rem',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            padding: 'var(--space-4)',
            minWidth: 'max-content',
            transition: 'var(--transition-base)'
          }}
        >
          {/* User Info Header */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-default)'
            }}
          >
            <p 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {email}
            </p>
            <p 
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-brand)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {tier}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              handleSignOut();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-base)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--status-error-text)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              transition: 'var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--status-error-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <LogOut style={{ height: '1rem', width: '1rem' }} />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
