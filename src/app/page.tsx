"use client"
import { BackgroundPaths } from "@/components/ui/background-paths";
import { TopicButton } from "@/components/ui/topic-button";
import { SectionHeader } from "@/components/ui/section-header";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <BackgroundPaths title="Учебное пространство">
      <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <Logo className="mb-4 sm:mb-6" />
          <SectionHeader title="Учебное пространство" subtitle="Уроки по искусственному интеллекту" className="mb-6 sm:mb-8" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <TopicButton href="/topic/ai-coding" title="ИИ кодинг" description="Практика кода с моделями и Copilot" icon="code" />
            <TopicButton href="/topic/ai-assistants" title="AI ассистенты" description="Инструменты и рабочие процессы ассистентов" icon="bot" />
            <TopicButton href="/topic/ml-basics" title="ML основы" description="Базовые концепции и примеры" icon="brain" />
            <TopicButton href="/topic/automation" title="Автоматизация" description="Скрипты, пайплайны и интеграции" icon="settings" />
          </div>
        </div>
      </div>
    </BackgroundPaths>
  )
}
