"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { Building2, LogOut, Plus, Search, Filter, Upload, TestTube, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface HeaderProps {
  onSearch?: (query: string) => void
  onFilterToggle?: () => void
  onImportExportToggle?: () => void
  showSearch?: boolean
}

export function Header({ onSearch, onFilterToggle, onImportExportToggle, showSearch = false }: HeaderProps) {
  const { user, signOut } = useAuth()
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-lg">
              <Building2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:block">Buyer Lead Intake</span>
            <span className="font-semibold text-sm sm:hidden">BLI</span>
          </Link>
        </div>

        {showSearch && !isMobile && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search buyers..." className="pl-10" onChange={(e) => onSearch?.(e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
          {showSearch && !isMobile && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onImportExportToggle}
                className="hidden md:flex items-center space-x-2 bg-transparent"
              >
                <Upload className="w-4 h-4" />
                <span>Import/Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onFilterToggle}
                className="hidden sm:flex items-center space-x-2 bg-transparent"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden md:inline">Filter</span>
              </Button>
              <Link href="/buyers/new">
                <Button size="sm" className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Buyer</span>
                </Button>
              </Link>
            </>
          )}

          {showSearch && isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-4 pt-4">
                  {/* Mobile search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search buyers..."
                      className="pl-10"
                      onChange={(e) => onSearch?.(e.target.value)}
                    />
                  </div>

                  {/* Mobile actions */}
                  <div className="space-y-2">
                    <Link href="/buyers/new" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Buyer
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => {
                        onFilterToggle?.()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter Buyers
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => {
                        onImportExportToggle?.()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import/Export
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <Link href="/testing">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <TestTube className="w-4 h-4" />
              <span className="hidden lg:inline">Testing</span>
            </Button>
          </Link>

          <div className="hidden sm:flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground hidden md:inline">Welcome,</span>
            <span className="font-medium truncate max-w-24 lg:max-w-none">{user?.name}</span>
          </div>

          <Button variant="ghost" size="sm" onClick={signOut} className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
