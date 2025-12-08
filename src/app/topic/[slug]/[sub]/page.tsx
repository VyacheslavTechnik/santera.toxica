import { BackButton } from "@/components/ui/back-button"
import { SectionHeader } from "@/components/ui/section-header"
import { TopicButton } from "@/components/ui/topic-button"

export default async function LessonPage({ params }: { params: Promise<{ slug: string; sub: string }> }) {
  const { slug, sub } = await params
  const titleMap: Record<string, string> = {
    "ai-coding": "ИИ кодинг",
    "ai-assistants": "AI ассистенты",
    "ml-basics": "ML основы",
    "automation": "Автоматизация",
  }
  const topicTitle = titleMap[slug] ?? slug
  const lessonTitle = sub
  const subject = `${topicTitle} — ${lessonTitle}` || "Вопрос по уроку"

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <SectionHeader title={`${topicTitle} — ${lessonTitle}`} subtitle="Материалы урока" className="mb-4 sm:mb-6" />
        {lessonTitle === "lesson-1" ? (
          <div className="mb-6 sm:mb-8">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-black/15 dark:border-white/15">
              <iframe
                className="w-full h-full"
                src="https://yuuki.training/ziua2_recapata"
                title="Видео урок 1"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="mt-4">
              <TopicButton href="https://yuuki.training/ziua2_recapata" title="Открыть урок" description="В новой вкладке" icon="code" />
            </div>
          </div>
        ) : null}
        <SectionHeader title="Техподдержка" className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <TopicButton href={`mailto:support@example.com?subject=${encodeURIComponent(subject)}`} title="урок 1" description="Ответ в рабочее время" icon="mail" />
          <TopicButton href="https://t.me/ai_support" title="Чат поддержки" description="Быстрые ответы" icon="message" />
        </div>
      </div>
    </div>
  )
}
