import { toast } from "sonner";

export function showDeleteToast(item, onUndo) {
  toast.error("Removed from list", {
    duration: 5000,
    action: {
      label: "Undo",
      onClick: () => onUndo(),
    },
  });
}
