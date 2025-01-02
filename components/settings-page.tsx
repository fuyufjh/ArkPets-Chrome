import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus } from 'lucide-react'

export default function SettingsPage() {
  const [characters, setCharacters] = useState<string[]>(['Default Character'])
  const [speed, setSpeed] = useState<number>(1)
  const [allowDragging, setAllowDragging] = useState<boolean>(true)
  const [animationSpeed, setAnimationSpeed] = useState<string>('medium')

  const addCharacter = () => {
    setCharacters([...characters, `Character ${characters.length + 1}`])
  }

  const deleteCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index))
  }

  const resetConfigurations = () => {
    setCharacters(['Default Character'])
    setSpeed(1)
    setAllowDragging(true)
    setAnimationSpeed('medium')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for wider screens */}
      <aside className="hidden w-64 p-6 border-r lg:block">
        <nav className="space-y-2">
          <a href="#characters" className="block py-2 text-sm font-medium hover:text-primary">Characters</a>
          <a href="#motion" className="block py-2 text-sm font-medium hover:text-primary">Motion</a>
          <a href="#system" className="block py-2 text-sm font-medium hover:text-primary">System</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-8">
        <h1 className="text-3xl font-bold">Plugin Settings</h1>

        {/* Characters Section */}
        <section id="characters">
          <h2 className="text-2xl font-semibold mb-4">Characters</h2>
          <div className="space-y-2">
            {characters.map((character, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input value={character} readOnly className="flex-grow" />
                <Button variant="outline" size="icon" onClick={() => deleteCharacter(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addCharacter} className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add Character
            </Button>
          </div>
        </section>

        {/* Motion Section */}
        <section id="motion">
          <h2 className="text-2xl font-semibold mb-4">Motion</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="speed" className="w-32">Speed:</label>
              <Input
                id="speed"
                type="number"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-24"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="allowDragging" className="w-32">Allow dragging:</label>
              <Switch
                id="allowDragging"
                checked={allowDragging}
                onCheckedChange={setAllowDragging}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="animationSpeed" className="w-32">Animation speed:</label>
              <Select value={animationSpeed} onValueChange={setAnimationSpeed}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* System Section */}
        <section id="system">
          <h2 className="text-2xl font-semibold mb-4">System</h2>
          <Button variant="destructive" onClick={resetConfigurations}>
            Reset All Configurations
          </Button>
        </section>
      </main>
    </div>
  )
}

