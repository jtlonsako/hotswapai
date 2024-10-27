import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
  } from "@/components/ui/sidebar"

  //Load previous chat conversations from db and display them in chat history group.
  //Find a way to transfer selected conversation from sidebar to main page state (zustand?).
  
  export function AppSidebar() {
    return (
      <Sidebar className="bg-zinc-900">
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-zinc-400">Chat History</SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
  