import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import { ConversationHistory } from "./ConversationHistory";

  export function AppSidebar() {
    return (
      <Sidebar className="bg-zinc-900">
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-zinc-400">Chat History</SidebarGroupLabel>
            <SidebarGroupContent>
              <ConversationHistory />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
  