"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle, ExternalLink, Twitter, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { taskSubmissionSchema, type TaskSubmissionFormData } from "@/lib/task-submission"

interface TaskSubmissionFormProps {
  taskId: string
  taskName: string
  taskType: string
}

export function TaskSubmissionForm({ 
  taskId, 
  taskName, 
  taskType
}: TaskSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submissionData, setSubmissionData] = useState<TaskSubmissionFormData | null>(null)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<TaskSubmissionFormData>({
    resolver: zodResolver(taskSubmissionSchema),
    defaultValues: {
      twitterHandle: "",
      postUrl: "",
    },
  })

  // Check if user already submitted
  useEffect(() => {
    const checkSubmission = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/submit`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setAlreadySubmitted(true)
          }
        }
      } catch (error) {
        console.error('Error checking submission:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubmission()
  }, [taskId])

  const onSubmit = async (data: TaskSubmissionFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed')
      }

      if (result.success) {
        setSubmissionData(data)
        setAlreadySubmitted(true)
        setShowConfirmation(true)
      }
    } catch (error) {
      console.error('Submission error:', error)
      setError(error instanceof Error ? error.message : "Submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (alreadySubmitted && !showConfirmation) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Task Already Submitted</h3>
          <p className="text-muted-foreground">
            You have already submitted this task. It's under review.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-2 border-dashed border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Twitter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Submit Task: {taskName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete this {taskType} task by providing your Twitter details
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="twitterHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Your Twitter Handle *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="your_username" 
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value.trim()
                            if (!value.startsWith('@') && value.length > 0) {
                              value = '@' + value
                            }
                            field.onChange(value)
                          }}
                          className="pl-10"
                        />
                        <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter your Twitter username (the @ will be added automatically)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Twitter Post URL *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="https://twitter.com/username/status/123456789" 
                          {...field}
                          className="pr-10"
                        />
                        <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Copy and paste the full URL of the Twitter post you interacted with
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Before submitting:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Make sure you've completed the required action on Twitter</li>
                      <li>• Double-check that the post URL is correct and accessible</li>
                      <li>• Your Twitter handle should match the account you used</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Task Submitted Successfully! 🎉</DialogTitle>
                <DialogDescription className="mt-1 text-base">
                  Your submission has been sent for review.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {submissionData && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                  Submission Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Twitter Handle:</span>
                    <span className="text-sm font-mono font-medium">{submissionData.twitterHandle}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Post URL:</span>
                    <div className="text-right">
                      <a 
                        href={submissionData.postUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        View Post
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => {
                    setShowConfirmation(false)
                    router.push("/tasks/daily")
                  }}
                  className="w-full"
                >
                  Back to Tasks
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}