
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, Plus, Palette } from 'lucide-react';
import { HighlightCategory } from '@/hooks/contract-analysis/types';

interface HighlightCategorySelectorProps {
  categories: HighlightCategory[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onAddCategory: (name: string, color: string, description?: string) => void;
}

const HighlightCategorySelector: React.FC<HighlightCategorySelectorProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  onAddCategory
}) => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#9C27B0'); // Default purple
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor, newCategoryDescription.trim() || undefined);
      setNewCategoryName('');
      setNewCategoryColor('#9C27B0');
      setNewCategoryDescription('');
      setDialogOpen(false);
    }
  };

  const activeItem = categories.find(c => c.id === activeCategory);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 h-8"
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: activeItem?.color }}
          />
          <span>{activeItem?.name || 'Category'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2">
        <div className="space-y-1">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={category.id === activeCategory ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onSelectCategory(category.id);
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }} 
                />
                <span>{category.name}</span>
              </div>
            </Button>
          ))}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  <span>Add Category</span>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input 
                    id="category-name" 
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Important Dates"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-color" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Category Color
                  </Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border" 
                      style={{ backgroundColor: newCategoryColor }} 
                    />
                    <Input 
                      id="category-color"
                      type="color"
                      value={newCategoryColor}
                      onChange={e => setNewCategoryColor(e.target.value)}
                      className="w-24 h-10 p-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Description (Optional)</Label>
                  <Input 
                    id="category-description"
                    value={newCategoryDescription}
                    onChange={e => setNewCategoryDescription(e.target.value)}
                    placeholder="What this category represents"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>
                  Add Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HighlightCategorySelector;
