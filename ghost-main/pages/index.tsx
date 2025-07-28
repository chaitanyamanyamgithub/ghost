import { ChatProvider } from '@/contexts/chat-provider'
import MainPage from '@/components/main-page'

export default function Home() {
  return (
    <ChatProvider>
      <MainPage />
    </ChatProvider>
  )
}
