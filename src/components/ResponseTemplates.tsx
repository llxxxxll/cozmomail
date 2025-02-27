
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  CopyIcon,
  TagIcon,
  Search,
  Loader2
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface TemplateFormData {
  name: string;
  content: string;
  category?: string;
  keywords: string;
}

const ResponseTemplates: React.FC = () => {
  const { 
    responseTemplates, 
    addResponseTemplate, 
    updateResponseTemplate, 
    deleteResponseTemplate,
    isLoading,
    error 
  } = useApp();
  
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    content: '',
    category: undefined,
    keywords: ''
  });
  
  const filteredTemplates = responseTemplates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.category && template.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (template.keywords && template.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );
  
  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      category: undefined,
      keywords: ''
    });
  };
  
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) return;
    
    setIsSubmitting(true);
    
    try {
      await addResponseTemplate({
        name: formData.name,
        content: formData.content,
        category: formData.category as any,
        keywords: formData.keywords.split(',').map(kw => kw.trim())
      });
      
      resetForm();
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Error adding template:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplateId || !formData.name || !formData.content) return;
    
    setIsSubmitting(true);
    
    try {
      await updateResponseTemplate(currentTemplateId, {
        name: formData.name,
        content: formData.content,
        category: formData.category as any,
        keywords: formData.keywords.split(',').map(kw => kw.trim())
      });
      
      resetForm();
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating template:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditClick = (templateId: string) => {
    const template = responseTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category,
      keywords: template.keywords ? template.keywords.join(', ') : ''
    });
    
    setCurrentTemplateId(templateId);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = async (templateId: string) => {
    try {
      await deleteResponseTemplate(templateId);
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };
  
  const handleCopyToClipboard = (content: string, name: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: `Template "${name}" has been copied to clipboard.`
      });
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error loading templates</h3>
        <p className="text-red-600 dark:text-red-400">{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Response Templates</h1>
          <p className="text-muted-foreground mt-1">Create and manage templates for quick replies</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Add a new response template for quick replies.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Order Status Inquiry"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Template Content</Label>
                <Textarea 
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Thank you for your inquiry about your order. Your order #[ORDER_NUMBER] is currently [STATUS]..."
                  className="min-h-32"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use placeholders like [PLACEHOLDER] for dynamic content
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="inquiry">Inquiry</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (Comma Separated)</Label>
                <Input 
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  placeholder="order, status, tracking, delivery"
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Template'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative w-full sm:w-80 mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{template.name}</CardTitle>
                {template.category && (
                  <Badge variant="outline" className="capitalize">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {template.category}
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-1 mt-1">
                {template.content.substring(0, 60)}...
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {template.content}
                </div>
                
                {template.keywords && template.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.keywords.slice(0, 4).map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {template.keywords.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.keywords.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleCopyToClipboard(template.content, template.name)}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleEditClick(template.id)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => handleDelete(template.id)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {filteredTemplates.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-secondary p-3 mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "No templates match your search query" 
                    : "Start by creating your first response template"}
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  Create Template
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Make changes to your response template.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Template Name</Label>
              <Input 
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-content">Template Content</Label>
              <Textarea 
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="min-h-32"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use placeholders like [PLACEHOLDER] for dynamic content
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category (Optional)</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-keywords">Keywords (Comma Separated)</Label>
              <Input 
                id="edit-keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResponseTemplates;
