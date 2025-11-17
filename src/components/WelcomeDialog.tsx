
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isNewUser: boolean;
  userName?: string;
}

const WelcomeDialog = ({ isOpen, onClose, isNewUser, userName }: WelcomeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {isNewUser ? (
              <Sparkles className="h-12 w-12 text-accent animate-pulse" />
            ) : (
              <CheckCircle className="h-12 w-12 text-success" />
            )}
          </div>
          <DialogTitle className="text-2xl">
            {isNewUser ? 'Welcome to Auction Planet!' : 'Welcome Back!'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {isNewUser 
              ? `Hi ${userName}! Your account has been created successfully. Start exploring amazing auctions or list your first item.`
              : `Great to see you again${userName ? `, ${userName}` : ''}! Ready to discover new deals?`
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={onClose} className="flex-1">
              Start Exploring
            </Button>
            {isNewUser && (
              <Button variant="outline" onClick={onClose} className="flex-1">
                List an Item
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
