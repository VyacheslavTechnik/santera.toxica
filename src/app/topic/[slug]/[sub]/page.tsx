import { BackButton } from "@/components/ui/back-button"
import { SectionHeader } from "@/components/ui/section-header"
import { TopicButton } from "@/components/ui/topic-button"

export default function LessonPage({ params }: { params: { slug: string; sub: string } }) {
  const titleMap: Record<string, string> = {
    "ai-coding": "ИИ кодинг",
    "ai-assistants": "AI ассистенты",
    "ml-basics": "ML основы",
    "automation": "Автоматизация",
  }
  const topicTitle = titleMap[params.slug] ?? params.slug
  const lessonTitle = params.sub

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <SectionHeader title={`${topicTitle} — ${lessonTitle}`} subtitle="Материалы урока появятся здесь" className="mb-6 sm:mb-8" />
        <SectionHeader title="Техподдержка" className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <TopicButton href={`mailto:support@example.com?subject=${encodeURIComponent(`${topicTitle} — ${lessonTitle}`)}`} title="Email поддержки" description="Ответ в рабочее время" icon="mail" />
          <TopicButton href="https://t.me/ai_support" title="Чат поддержки" description="Быстрые ответы" icon="message" />
        </div>
      </div>
    </div>
  )
}
