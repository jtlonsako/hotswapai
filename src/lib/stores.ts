import { create } from 'zustand'

type ConversationData = {
  conversationId: number,
  setConversationId: (id: number) => void
}

type ModelData = {
  modelFamily: string,
  modelName: string,
  setModelFamily: (family: string) => void
  setModelName: (name: string) => void
}

export const useConversationStore = create<ConversationData>((set) => ({
  conversationId: -1,
  setConversationId: (id: number) => set(() => ({conversationId: id}))
})
);

export const useModelStore = create<ModelData>((set) => ({
  modelFamily: 'OpenAI',
  modelName: 'gpt-4o-mini',
  setModelFamily: (family: string) => set(() => ({ modelFamily: family })),
  setModelName: (name: string) => set(() => ({ modelName: name })),
}))