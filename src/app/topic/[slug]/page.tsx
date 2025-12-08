import { SectionHeader } from "@/components/ui/section-header"
import { TopicButton } from "@/components/ui/topic-button"
import { BackButton } from "@/components/ui/back-button"

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const titleMap: Record<string, string> = {
    "ai-coding": "ИИ кодинг",
    "ai-assistants": "AI ассистенты",
    "ml-basics": "ML основы",
    "automation": "Автоматизация",
  }

  const lessonsBySlug: Record<string, Array<{ key: string; title: string; description: string; icon: string }>> = {
    "ai-coding": [
      { key: "lesson-1", title: "урок 1", description: "Юнит, интеграция и e2e", icon: "code" },
      { key: "intro", title: "Введение", description: "Основы и первые шаги", icon: "code" },
      { key: "tools", title: "Инструменты", description: "IDE, плагины и модели", icon: "code" },
      { key: "practice", title: "Практика", description: "Задачи и упражнения", icon: "code" },
      { key: "patterns", title: "Паттерны", description: "Шаблоны и лучшие практики", icon: "code" },
    ],
    "ai-assistants": [
      { key: "lesson-1", title: "Урок 1", description: "Старт работы с ассистентами", icon: "bot" },
      { key: "overview", title: "Обзор", description: "Виды ассистентов", icon: "bot" },
      { key: "workflows", title: "Процессы", description: "Сценарии использования", icon: "bot" },
      { key: "integrations", title: "Интеграции", description: "Инструменты и сервисы", icon: "bot" },
      { key: "customization", title: "Кастомизация", description: "Настройка и промпт‑инжиниринг", icon: "bot" },
    ],
    "ml-basics": [
      { key: "regression", title: "Регрессия", description: "Линейные модели", icon: "brain" },
      { key: "classification", title: "Классификация", description: "Основные алгоритмы", icon: "brain" },
      { key: "evaluation", title: "Оценка", description: "Метрики качества", icon: "brain" },
      { key: "datasets", title: "Датасеты", description: "Подготовка и очистка данных", icon: "brain" },
    ],
    "automation": [
      { key: "scripts", title: "Скрипты", description: "Автозадачи и утилиты", icon: "settings" },
      { key: "pipelines", title: "Пайплайны", description: "Сборки и процессы", icon: "settings" },
      { key: "integrations", title: "Интеграции", description: "API и сервисы", icon: "settings" },
      { key: "monitoring", title: "Мониторинг", description: "Логи, алерты и SLA", icon: "settings" },
    ],
  }

  const title = titleMap[slug] ?? slug
  const lessonsRaw = lessonsBySlug[slug] ?? []
  const lessons = slug === "ai-coding" ? lessonsRaw.filter((l) => l.key !== "lesson-1") : lessonsRaw

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <SectionHeader title={title} subtitle="Выберите урок или откройте поддержку" className="mb-6 sm:mb-8" />

        {slug === "ai-coding" ? (
          <div className="mb-6 sm:mb-8">
            <TopicButton
              href={`https://yuuki.training/ziua2_recapata`}
              title="урок 1"
              description="Юнит, интеграция и e2e"
              icon="code"
              className="py-6 text-lg"
            />
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 relative z-20">
          {lessons.map((l) => (
            <TopicButton
              key={l.key}
              href={`/topic/${slug}/${l.key}`}
              title={l.title}
              description={l.description}
              icon={l.icon}
            />
          ))}
        </div>

        <SectionHeader title="Техподдержка" className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          <TopicButton href="https://t.me/ai_support" title="Чат поддержки" description="Быстрые ответы" icon="message" />
        </div>
      </div>
    </div>
  )
}
