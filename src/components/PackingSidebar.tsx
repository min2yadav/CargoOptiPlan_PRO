import React from 'react';
import { ContainerForm } from '@/components/ContainerForm';
import { ItemsTable } from '@/components/ItemsTable';
import { Button } from '@/components/ui/button';
import { Container, PackingItem } from '@/types/packing';
import { Download, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PackingSidebarProps {
  container: Container;
  onContainerChange: (container: Container) => void;
  items: PackingItem[];
  onItemsChange: (items: PackingItem[]) => void;
  onDownloadSample: () => void;
  onUploadClick: () => void;
}

export function PackingSidebar({
  container,
  onContainerChange,
  items,
  onItemsChange,
  onDownloadSample,
  onUploadClick,
}: PackingSidebarProps) {
  const [containerOpen, setContainerOpen] = React.useState(true);
  const [importOpen, setImportOpen] = React.useState(true);
  const [itemsOpen, setItemsOpen] = React.useState(true);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Container Dimensions Section */}
      <Collapsible open={containerOpen} onOpenChange={setContainerOpen}>
        <div className="glass-panel">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
            <h3 className="text-sm font-semibold text-foreground">Container Dimensions</h3>
            {containerOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <ContainerForm container={container} onChange={onContainerChange} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Import Section */}
      <Collapsible open={importOpen} onOpenChange={setImportOpen}>
        <div className="glass-panel">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
            <h3 className="text-sm font-semibold text-foreground">Import Items</h3>
            {importOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Upload Excel file with items or download sample format.
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={onDownloadSample} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample
                </Button>
                <Button variant="outline" size="sm" onClick={onUploadClick} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Excel
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Items to Pack Section */}
      <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
        <div className="glass-panel">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
            <h3 className="text-sm font-semibold text-foreground">
              Items to Pack ({items.reduce((sum, i) => sum + i.quantity, 0)} total)
            </h3>
            {itemsOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <ItemsTable items={items} onChange={onItemsChange} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
