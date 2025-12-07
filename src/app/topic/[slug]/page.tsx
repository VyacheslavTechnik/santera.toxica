import { SectionHeader } from "@/components/ui/section-header"
import { TopicButton } from "@/components/ui/topic-button"
import { BackButton } from "@/components/ui/back-button"

export default function TopicPage({ params }: { params: { slug: string } }) {
  const titleMap: Record<string, string> = {
    "ai-coding": "ИИ кодинг",
    "ai-assistants": "AI ассистенты",
    "ml-basics": "ML основы",
    "automation": "Автоматизация",
  }

  const lessonsBySlug: Record<string, Array<{ key: string; title: string; description: string; icon: string }>> = {
    "ai-coding": [
      { key: "intro", title: "Введение", description: "Основы и первые шаги", icon: "code" },
      { key: "tools", title: "Инструменты", description: "IDE, плагины и модели", icon: "code" },
      { key: "practice", title: "Практика", description: "Задачи и упражнения", icon: "code" },
    ],
    "ai-assistants": [
      { key: "overview", title: "Обзор", description: "Виды ассистентов", icon: "bot" },
      { key: "workflows", title: "Процессы", description: "Сценарии использования", icon: "bot" },
      { key: "integrations", title: "Интеграции", description: "Инструменты и сервисы", icon: "bot" },
    ],
    "ml-basics": [
      { key: "regression", title: "Регрессия", description: "Линейные модели", icon: "brain" },
      { key: "classification", title: "Классификация", description: "Основные алгоритмы", icon: "brain" },
      { key: "evaluation", title: "Оценка", description: "Метрики качества", icon: "brain" },
    ],
    "automation": [
      { key: "scripts", title: "Скрипты", description: "Автозадачи и утилиты", icon: "settings" },
      { key: "pipelines", title: "Пайплайны", description: "Сборки и процессы", icon: "settings" },
      { key: "integrations", title: "Интеграции", description: "API и сервисы", icon: "settings" },
    ],
  }

  const title = titleMap[params.slug] ?? params.slug
  const lessons = lessonsBySlug[params.slug] ?? []

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <SectionHeader title={title} subtitle="Выберите урок или откройте поддержку" className="mb-6 sm:mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {lessons.map((l) => (
            <TopicButton key={l.key} href={`/topic/${params.slug}/${l.key}`} title={l.title} description={l.description} icon={l.icon} />
          ))}
        </div>

        <SectionHeader title="Техподдержка" className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <TopicButton href={`mailto:support@example.com?subject=${encodeURIComponent(title)}`} title="Email поддержки" description="Ответ в рабочее время" icon="mail" />
          <TopicButton href="https://t.me/ai_support" title="Чат поддержки" description="Быстрые ответы" icon="message" />
        </div>
      </div>
    </div>
  )
}
