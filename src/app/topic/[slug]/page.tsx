export default function TopicPage({ params }: { params: { slug: string } }) {
  const titleMap: Record<string, string> = {
    "ai-coding": "ИИ кодинг",
    "ai-assistants": "AI ассистенты",
    "ml-basics": "ML основы",
    "automation": "Автоматизация",
    "prompting": "Prompt Engineering",
  }
  const title = titleMap[params.slug] ?? params.slug
  return (
    <div className="min-h-screen w-full grid place-items-center px-4 py-10">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-4">{title}</h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Здесь будут уроки и подтемы для выбранной темы. Страница адаптивна и готова к наполнению.
        </p>
      </div>
    </div>
  )
}
