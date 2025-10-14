import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useClerk } from '@clerk/clerk-react';

interface InvalidEmailModalProps {
  isOpen: boolean;
}

export function InvalidEmailModal({ isOpen }: InvalidEmailModalProps) {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-red-600">Acceso no autorizado</DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              Lo sentimos, pero esta aplicación solo está disponible para usuarios
              con correo electrónico institucional de la UDP.
            </p>
            <p className="text-sm text-muted-foreground">
              Tu correo actual no tiene el dominio <strong>@mail.udp.cl</strong> requerido.
            </p>
            <p className="text-sm">
              Para continuar, debes cerrar sesión e ingresar con una cuenta institucional válida.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
          >
            Cerrar sesión e intentar con otra cuenta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
