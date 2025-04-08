import { create } from 'zustand'

type ConversationData = {
  conversationId: number,
  setConversationId: (id: number) => void
}

type ModelData = {
  modelFamily: string,
  modelName: string,
  setCurrentProvider: (family: string) => void
  setModelName: (name: string) => void
}

export const useConversationStore = create<ConversationData>((set) => ({
  conversationId: -1,
  setConversationId: (id: number) => set(() => ({conversationId: id}))
})
);

export const useModelStore = create<ModelData>((set) => ({
  modelFamily: '',
  modelName: '',
  setCurrentProvider: (family: string) => set(() => ({ modelFamily: family })),
  setModelName: (name: string) => set(() => ({ modelName: name })),
}))