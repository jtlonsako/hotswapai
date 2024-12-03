import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ChatLayout({ 
  children, 
}: {
  children: React.ReactNode
}) {
  return (
    <> 
      <SidebarProvider defaultOpen={false} >
          <AppSidebar />
          {children} 
        </SidebarProvider>
    </>
  )
}