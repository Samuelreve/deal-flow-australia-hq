
import { useState } from "react";
import { DocumentVersion } from "@/types/deal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText } from "lucide-react";
import DocumentCommentsPanel from "./comments/DocumentCommentsPanel";

interface DocumentVersionWithCommentsProps {
  version: DocumentVersion;
  currentUserDealRole?: string;
  isParticipant?: boolean;
}

const DocumentVersionWithComments = ({
  version,
  currentUserDealRole,
  isParticipant = false
}: DocumentVersionWithCommentsProps) => {
  const [activeTab, setActiveTab] = useState<string>("document");
  
  return (
    <div className="h-full flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-grow"
      >
        <div className="border-b px-2">
          <TabsList className="h-10">
            <TabsTrigger value="document" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Document
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="document" className="flex-grow p-0 m-0">
          <div className="h-full">
            {/* Document Viewer goes here - could be an iframe, PDF viewer, etc. */}
            <div className="h-full flex items-center justify-center bg-slate-50">
              <a
                href={version.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center text-center px-6 py-12 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <FileText className="h-12 w-12 text-primary mb-4" />
                <div className="font-semibold">{version.fileName}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Click to open document in a new tab
                </div>
              </a>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="comments" className="flex-grow p-0 m-0 overflow-y-auto">
          <DocumentCommentsPanel
            documentVersionId={version.id}
            currentUserDealRole={currentUserDealRole}
            isParticipant={isParticipant}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentVersionWithComments;
