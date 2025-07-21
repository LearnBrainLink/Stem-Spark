"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { FloatingElements } from "@/components/FloatingElements"
import { 
  TestTube, 
  Microscope, 
  Atom, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Target,
  Lightbulb,
  Brain,
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield
} from "lucide-react"
import Link from "next/link"

interface Experiment {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  icon: React.ReactNode
  status: 'available' | 'in-progress' | 'completed'
}

interface LabEquipment {
  id: string
  name: string
  type: 'tool' | 'chemical' | 'instrument'
  icon: React.ReactNode
  isSelected: boolean
}

export default function VirtualLabPage() {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedEquipment, setSelectedEquipment] = useState<LabEquipment[]>([])
  const [labResults, setLabResults] = useState<any>(null)

  const experiments: Experiment[] = [
    {
      id: "chemistry-1",
      name: "Acid-Base Titration",
      description: "Learn about pH levels and neutralization reactions",
      category: "Chemistry",
      difficulty: "intermediate",
      duration: 30,
      icon: <TestTube className="w-6 h-6" />,
      status: "available"
    },
    {
      id: "physics-1",
      name: "Simple Pendulum",
      description: "Explore the relationship between length and period",
      category: "Physics",
      difficulty: "beginner",
      duration: 20,
      icon: <Target className="w-6 h-6" />,
      status: "available"
    },
    {
      id: "biology-1",
      name: "Cell Observation",
      description: "Examine plant and animal cells under virtual microscope",
      category: "Biology",
      difficulty: "beginner",
      duration: 25,
      icon: <Microscope className="w-6 h-6" />,
      status: "available"
    },
    {
      id: "chemistry-2",
      name: "Electrolysis",
      description: "Separate compounds using electrical current",
      category: "Chemistry",
      difficulty: "advanced",
      duration: 45,
      icon: <Zap className="w-6 h-6" />,
      status: "available"
    },
    {
      id: "physics-2",
      name: "Wave Interference",
      description: "Study wave patterns and interference phenomena",
      category: "Physics",
      difficulty: "intermediate",
      duration: 35,
      icon: <Atom className="w-6 h-6" />,
      status: "available"
    },
    {
      id: "biology-2",
      name: "DNA Extraction",
      description: "Extract DNA from virtual strawberry cells",
      category: "Biology",
      difficulty: "intermediate",
      duration: 40,
      icon: <Brain className="w-6 h-6" />,
      status: "available"
    }
  ]

  const labEquipment: LabEquipment[] = [
    { id: "beaker", name: "Beaker", type: "tool", icon: <TestTube className="w-4 h-4" />, isSelected: false },
    { id: "microscope", name: "Microscope", type: "instrument", icon: <Microscope className="w-4 h-4" />, isSelected: false },
    { id: "bunsen-burner", name: "Bunsen Burner", type: "tool", icon: <Zap className="w-4 h-4" />, isSelected: false },
    { id: "test-tube", name: "Test Tube", type: "tool", icon: <TestTube className="w-4 h-4" />, isSelected: false },
    { id: "scale", name: "Digital Scale", type: "instrument", icon: <Target className="w-4 h-4" />, isSelected: false },
    { id: "ph-indicator", name: "pH Indicator", type: "chemical", icon: <TestTube className="w-4 h-4" />, isSelected: false }
  ]

  const startExperiment = () => {
    if (!selectedExperiment) return
    setIsRunning(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          generateResults()
          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  const stopExperiment = () => {
    setIsRunning(false)
    setProgress(0)
  }

  const resetExperiment = () => {
    setSelectedExperiment(null)
    setSelectedEquipment([])
    setLabResults(null)
    setProgress(0)
    setIsRunning(false)
  }

  const generateResults = () => {
    const results = {
      experiment: selectedExperiment?.name,
      completionTime: new Date().toLocaleTimeString(),
      observations: [
        "Initial reaction observed at 2:15",
        "Color change detected at 2:45",
        "Final measurement recorded at 3:00"
      ],
      data: {
        temperature: "23.5°C",
        pH: "7.2",
        concentration: "0.1M"
      },
      conclusion: "The experiment was successful. All expected reactions occurred within the predicted timeframes."
    }
    setLabResults(results)
  }

  const toggleEquipment = (equipmentId: string) => {
    setSelectedEquipment(prev => {
      const equipment = prev.find(e => e.id === equipmentId)
      if (equipment) {
        return prev.filter(e => e.id !== equipmentId)
      } else {
        const newEquipment = labEquipment.find(e => e.id === equipmentId)
        return newEquipment ? [...prev, { ...newEquipment, isSelected: true }] : prev
      }
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-x-hidden">
      <FloatingElements />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <Logo variant="nav" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/ai-tutor">
                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  AI Tutor
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
                <TestTube className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Virtual
                <span className="bg-gradient-to-r from-green-300 to-blue-400 bg-clip-text text-transparent ml-2">
                  Laboratory
                </span>
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Conduct safe, interactive experiments in our virtual lab. Explore chemistry, physics, and biology through hands-on simulations.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Experiments List */}
            <div className="lg:col-span-1">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-white flex items-center">
                    <BookOpen className="w-6 h-6 mr-2" />
                    Available Experiments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {experiments.map((experiment) => (
                    <button
                      key={experiment.id}
                      onClick={() => setSelectedExperiment(experiment)}
                      className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                        selectedExperiment?.id === experiment.id
                          ? 'border-green-400 bg-green-500/20 text-white'
                          : 'border-white/20 bg-white/10 text-blue-100 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="text-green-300 mr-3">{experiment.icon}</div>
                          <h3 className="font-semibold">{experiment.name}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getDifficultyColor(experiment.difficulty)}`}>
                          {experiment.difficulty}
                        </span>
                      </div>
                      <p className="text-sm opacity-80 mb-2">{experiment.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-300">{experiment.category}</span>
                        <span className="text-blue-300">{experiment.duration} min</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Lab Workspace */}
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-white flex items-center">
                      <TestTube className="w-6 h-6 mr-2" />
                      Lab Workspace
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        onClick={resetExperiment}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/20"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button
                        onClick={() => setSelectedExperiment(null)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/20"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {!selectedExperiment ? (
                    <div className="text-center text-blue-200 py-20">
                      <TestTube className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Select an experiment to begin</p>
                      <p className="text-sm opacity-80 mt-2">Choose from the available experiments to start your virtual lab session</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Experiment Info */}
                      <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">{selectedExperiment.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm text-white ${getDifficultyColor(selectedExperiment.difficulty)}`}>
                            {selectedExperiment.difficulty}
                          </span>
                        </div>
                        <p className="text-blue-200 mb-4">{selectedExperiment.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-blue-300">
                          <span>Category: {selectedExperiment.category}</span>
                          <span>Duration: {selectedExperiment.duration} minutes</span>
                        </div>
                      </div>

                      {/* Equipment Selection */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Required Equipment</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {labEquipment.map((equipment) => (
                            <button
                              key={equipment.id}
                              onClick={() => toggleEquipment(equipment.id)}
                              className={`p-3 rounded-lg border transition-all duration-300 ${
                                selectedEquipment.find(e => e.id === equipment.id)
                                  ? 'border-green-400 bg-green-500/20 text-white'
                                  : 'border-white/20 bg-white/10 text-blue-100 hover:bg-white/20'
                              }`}
                            >
                              <div className="text-center">
                                <div className="mb-2">{equipment.icon}</div>
                                <p className="text-xs">{equipment.name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Experiment Controls */}
                      <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">Experiment Controls</h4>
                          <div className="flex space-x-2">
                            {!isRunning ? (
                              <Button
                                onClick={startExperiment}
                                disabled={selectedEquipment.length === 0}
                                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Experiment
                              </Button>
                            ) : (
                              <Button
                                onClick={stopExperiment}
                                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Stop Experiment
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {isRunning && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-blue-200">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Results */}
                        {labResults && (
                          <div className="mt-4 p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                              <h5 className="font-semibold text-green-300">Experiment Completed!</h5>
                            </div>
                            <div className="space-y-2 text-sm text-blue-200">
                              <p><strong>Experiment:</strong> {labResults.experiment}</p>
                              <p><strong>Completion Time:</strong> {labResults.completionTime}</p>
                              <div>
                                <strong>Observations:</strong>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {labResults.observations.map((obs: string, index: number) => (
                                    <li key={index}>{obs}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <strong>Data:</strong>
                                <ul className="ml-2 mt-1">
                                  <li>Temperature: {labResults.data.temperature}</li>
                                  <li>pH: {labResults.data.pH}</li>
                                  <li>Concentration: {labResults.data.concentration}</li>
                                </ul>
                              </div>
                              <p><strong>Conclusion:</strong> {labResults.conclusion}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Virtual Lab Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Safe Environment</h3>
                  <p className="text-blue-200">Conduct experiments without safety risks in a controlled virtual environment</p>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Interactive Learning</h3>
                  <p className="text-blue-200">Hands-on experience with real-time feedback and detailed explanations</p>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Multiple Subjects</h3>
                  <p className="text-blue-200">Explore chemistry, physics, and biology with diverse experiment options</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 