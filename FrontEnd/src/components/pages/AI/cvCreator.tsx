import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function CVReviewer() {
  const [tab, setTab] = useState("structure")
  const [cvText, setCVText] = useState("")
  const [loading, setLoading] = useState(false)
  const [reviewData, setReviewData] = useState<Record<string, string>>({
    structure: "Paste a CV to get started.",
    impact: "Paste a CV to get started.",
    language: "Paste a CV to get started.",
    ats: "Paste a CV to get started.",
    roles: "Paste a CV to get started.",
    recommendations: "Paste a CV to get started.",
    examples: "Paste a CV to get started.",
  })

  const handleSubmit = async () => {
    if (!cvText) return
    setLoading(true)

    try {
      const response = await fetch("http://localhost:3000/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText }),
      })

      const data = await response.json().catch(() => ({ error: "Invalid JSON response" }))
      if (!response.ok) {
        console.error("Server error:", data)
        return
      }

      setReviewData(data)
    } catch (error) {
      console.error("Error sending CV text:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto mt-10 p-4">
      <Textarea
        rows={10}
        placeholder="Paste your CV here..."
        value={cvText}
        onChange={(e) => setCVText(e.target.value)}
      />
      <Button className="mt-2" onClick={handleSubmit} disabled={loading}>
        {loading ? "Reviewing..." : "Submit for Review"}
      </Button>

      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <TabsList className="grid grid-cols-3 gap-1">
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="ats">ATS</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <CardContent className="mt-4 whitespace-pre-wrap">
          <TabsContent value="structure">{reviewData.structure}</TabsContent>
          <TabsContent value="impact">{reviewData.impact}</TabsContent>
          <TabsContent value="language">{reviewData.language}</TabsContent>
          <TabsContent value="ats">{reviewData.ats}</TabsContent>
          <TabsContent value="roles">{reviewData.roles}</TabsContent>
          <TabsContent value="recommendations">{reviewData.recommendations}</TabsContent>
          <TabsContent value="examples">{reviewData.examples}</TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
