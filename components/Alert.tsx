import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Text } from '~/components/ui/text';

interface AlertDialogScreenProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    cancelText: string;
    actionText: string;
    onCancel: () => void;
    onAction: () => void;
}

function AlertDialogScreen({
    open,
    onOpenChange,
    title,
    description,
    cancelText,
    actionText,
    onCancel,
    onAction
}: AlertDialogScreenProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onPress={onCancel}>
                        <Text>{cancelText}</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction onPress={onAction}>
                        <Text>{actionText}</Text>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default AlertDialogScreen;